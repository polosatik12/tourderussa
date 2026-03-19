import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { eventsAPI } from '@/lib/api';
import HeaderNew from '@/components/HeaderNew';
import FooterNew from '@/components/FooterNew';

const CATEGORIES = [
'А 18+', 'М1 18-29', 'М2 30-39', 'М3 40-49', 'М4 50-59', 'М5 60+', 'FA 18+', 'F1 18-29', 'F2 30-39', 'F3 40-54', 'F4 55+'] as
const;

function getDisplayDistanceName(backendName: string): string {
  const mapping: Record<string, string> = {
    'Велогонка 114 км': 'Grand Tour',
    'Велогонка 60 км': 'Median Tour',
    'Велогонка 25 км': 'Intro Tour',
  };
  return mapping[backendName] || backendName;
}

function getAgeCategory(dateOfBirth: string | null, gender: string | null): string {
  if (!dateOfBirth || !gender) return 'А 18+';
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || m === 0 && today.getDate() < birth.getDate()) age--;

  if (gender === 'male') {
    if (age < 30) return 'М1 18-29';
    if (age < 40) return 'М2 30-39';
    if (age < 50) return 'М3 40-49';
    if (age < 60) return 'М4 50-59';
    return 'М5 60+';
  }
  // female
  if (age < 30) return 'F1 18-29';
  if (age < 40) return 'F2 30-39';
  if (age < 55) return 'F3 40-54';
  return 'F4 55+';
}

const ITEMS_PER_PAGE = 20;

const Results: React.FC = () => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedDistanceId, setSelectedDistanceId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('А 18+');
  const [page, setPage] = useState(1);

  // Fetch events
  const { data: events } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data } = await eventsAPI.getEvents();
      return data.events;
    }
  });

  const activeEvent = events?.find((e) => e.id === selectedEventId) ?? events?.[0];
  const activeEventId = activeEvent?.id;

  // Fetch distances for event
  const { data: distances } = useQuery({
    queryKey: ['event_distances', activeEventId],
    queryFn: async () => {
      const { data } = await eventsAPI.getEventDistances(activeEventId!);
      console.log('Fetched distances:', data.distances);
      return data.distances;
    },
    enabled: !!activeEventId
  });

  const activeDistance = distances?.find((d) => d.id === selectedDistanceId) ?? distances?.[0];
  const activeDistanceId = activeDistance?.id;
  const isCompleted = activeEvent?.status === 'completed';

  console.log('=== Results Debug ===');
  console.log('Events:', events);
  console.log('Distances:', distances);
  console.log('Active Distance:', activeDistance);
  console.log('Active Distance Name:', activeDistance?.name);

  // Fetch registrations (for participant list)
  const { data: registrations, isLoading: loadingRegs } = useQuery({
    queryKey: ['event_registrations', activeEventId, activeDistanceId],
    queryFn: async () => {
      const { data } = await eventsAPI.getEventResults(activeEventId!, activeDistanceId);
      return data.registrations || [];
    },
    enabled: !!activeEventId && !!activeDistanceId && !isCompleted
  });

  // Fetch results (for completed events)
  const { data: results, isLoading: loadingResults } = useQuery({
    queryKey: ['event_results', activeEventId, activeDistanceId],
    queryFn: async () => {
      const { data } = await eventsAPI.getEventResults(activeEventId!, activeDistanceId);
      return data.results || [];
    },
    enabled: !!activeEventId && !!activeDistanceId && isCompleted
  });

  // Filter by category
  const filteredParticipants = useMemo(() => {
    if (!registrations) return [];
    return registrations.filter((reg) => {
      if (selectedCategory === 'А 18+') return true;
      const profile = reg.profile as any;
      if (!profile) return false;
      return getAgeCategory(profile.date_of_birth, profile.gender) === selectedCategory;
    });
  }, [registrations, selectedCategory]);

  const filteredResults = useMemo(() => {
    if (!results) return [];
    if (selectedCategory === 'А 18+') return results;
    return results.filter((r) => r.category === selectedCategory);
  }, [results, selectedCategory]);

  const currentItems = isCompleted ? filteredResults : filteredParticipants;
  const totalPages = Math.max(1, Math.ceil(currentItems.length / ITEMS_PER_PAGE));
  const paginatedItems = currentItems.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const isLoading = isCompleted ? loadingResults : loadingRegs;

  // Reset page on filter change
  React.useEffect(() => {setPage(1);}, [selectedCategory, activeDistanceId]);

  // Auto-select first event/distance
  React.useEffect(() => {
    if (events?.length && !selectedEventId) setSelectedEventId(events[0].id);
  }, [events, selectedEventId]);

  React.useEffect(() => {
    if (distances?.length) setSelectedDistanceId(distances[0].id);
  }, [distances]);

  const formatTime = (interval: string | null) => {
    if (!interval) return '—';
    return interval;
  };

  const getFullName = (profile: any) => {
    if (!profile) return '—';
    return [profile.last_name, profile.first_name, profile.patronymic].filter(Boolean).join(' ') || '—';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeaderNew />
      
      <main className="flex-1 pt-32 md:pt-36 pb-16">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          {/* Event selector (if multiple) */}
          {events && events.length > 1 &&
          <div className="flex flex-wrap gap-3 mb-6 justify-center">
              {events.map((event) =>
            <button
              key={event.id}
              onClick={() => {setSelectedEventId(event.id);setSelectedDistanceId(null);}}
              className={`px-5 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${
              activeEventId === event.id ?
              'bg-primary text-primary-foreground' :
              'bg-muted text-muted-foreground hover:bg-muted/80'}`
              }>
              
                  {event.name}
                </button>
            )}
            </div>
          }

          {/* Distance tabs */}
          {distances && distances.length > 0 ? (
          <div className="flex flex-wrap gap-2 justify-center mb-6">
              {distances.map((dist) => {
                const displayName = getDisplayDistanceName(dist.name);
                console.log('Rendering distance button:', dist.name, '→', displayName);
                return (
            <button
              key={dist.id}
              onClick={() => setSelectedDistanceId(dist.id)}
              className={`px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition-colors ${
              activeDistanceId === dist.id ?
              'bg-[#E31E24] text-white' :
              'bg-transparent text-foreground hover:text-[#E31E24] border-b-2 border-transparent hover:border-[#E31E24]'}`
              }>
                  {displayName}
                </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Загрузка дистанций...
            </div>
          )}

          {/* Title */}
          {activeDistance && activeEvent &&
          <h1 className="text-center text-xl md:text-2xl lg:text-3xl text-[#003051] mb-8 tracking-tight">
              <span className="font-extrabold uppercase">{getDisplayDistanceName(activeDistance.name)}</span>
              <span className="font-normal">, {activeEvent.location},{' '}
              {new Date(activeEvent.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} г.</span>
            </h1>
          }

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {CATEGORIES.map((cat) =>
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
              selectedCategory === cat ?
              'bg-[#003051] text-white' :
              'bg-transparent text-[#003051] hover:bg-[#003051]/10'}`
              }>
              
                {cat}
              </button>
            )}
          </div>

          {/* Sub-header */}
          <div className="bg-[#003051]/5 py-3 px-4 text-center mb-6">
            <p className="font-bold text-sm md:text-base text-[#003051] tracking-wide uppercase">
              {isCompleted ? 'Результаты' : 'Список участников'}
            </p>
          </div>

          {/* Pagination top */}
          {totalPages > 1 &&
          <div className="flex items-center gap-2 mb-4 text-sm">
              <span className="text-muted-foreground">Страницы:</span>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) =>
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-2 py-1 ${page === p ? 'font-bold text-foreground' : 'text-primary hover:underline'}`}>
              
                  {p}
                </button>
            )}
            </div>
          }

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#003051]/20">
                  <th className="text-left py-3 px-4 font-bold w-20 text-foreground">Место</th>
                  <th className="text-left py-3 px-4 font-bold w-24 text-foreground">Номер</th>
                  <th className="text-left py-3 px-4 font-bold text-foreground">Участник</th>
                  {isCompleted &&
                  <th className="text-left py-3 px-4 font-bold text-[#003051] w-32">Время</th>
                  }
                  <th className="text-left py-3 px-4 font-bold w-48 text-foreground">Команда/регион</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ?
                <tr>
                    <td colSpan={isCompleted ? 5 : 4} className="text-center py-16 text-muted-foreground">
                      Загрузка...
                    </td>
                  </tr> :
                currentItems.length === 0 ? null :
                isCompleted ?
                paginatedItems.map((result: any, idx: number) => {
                  const profile = result.registration?.profile;
                  return (
                    <tr key={result.id} className={idx % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'}>
                        <td className="py-2.5 px-4">{selectedCategory === 'А 18+' ? result.place : result.category_place}</td>
                        <td className="py-2.5 px-4">{result.registration?.bib_number ?? '—'}</td>
                        <td className="py-2.5 px-4">{getFullName(profile)}</td>
                        <td className="py-2.5 px-4">{formatTime(result.finish_time)}</td>
                        <td className="py-2.5 px-4">{profile?.team_name || profile?.region || ''}</td>
                      </tr>);

                }) :

                paginatedItems.map((reg: any, idx: number) => {
                  const profile = reg.profile;
                  const rowNumber = (page - 1) * ITEMS_PER_PAGE + idx + 1;
                  return (
                    <tr key={reg.id} className={idx % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'}>
                        <td className="py-2.5 px-4">{rowNumber}</td>
                        <td className="py-2.5 px-4">{reg.bib_number ?? '—'}</td>
                        <td className="py-2.5 px-4">{getFullName(profile)}</td>
                        <td className="py-2.5 px-4">{profile?.team_name || profile?.region || ''}</td>
                      </tr>);

                })
                }
              </tbody>
            </table>
          </div>

          {/* Pagination bottom */}
          {totalPages > 1 &&
          <div className="flex items-center gap-2 mt-6 text-sm justify-center">
              {page > 1 &&
            <button onClick={() => setPage(page - 1)} className="text-primary hover:underline">← Пред.</button>
            }
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) =>
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-2 py-1 ${page === p ? 'font-bold text-foreground' : 'text-primary hover:underline'}`}>
              
                  {p}
                </button>
            )}
              {page < totalPages &&
            <button onClick={() => setPage(page + 1)} className="text-primary hover:underline">След. →</button>
            }
            </div>
          }
        </div>
      </main>

      <FooterNew />
    </div>);

};

export default Results;