import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Trophy, ArrowRight, MapPin, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { eventsAPI, registrationsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Map backend distance names to display names
function getDisplayDistanceName(backendName: string): string {
  const mapping: Record<string, string> = {
    'Велогонка 114 км': 'Grand Tour',
    'Велогонка 60 км': 'Median Tour',
    'Велогонка 25 км': 'Intro Tour',
  };
  return mapping[backendName] || backendName;
}

// Format distance to remove decimals
function formatDistance(distance: number | string): string {
  return Math.round(Number(distance)).toString();
}

interface EventWithDistances {
  id: string;
  name: string;
  date: string;
  location: string;
  status: string;
  distances: { id: string; name: string; distance_km: number; price_kopecks: number }[];
}

interface Registration {
  id: string;
  event_id: string;
  distance_id: string;
  bib_number: number | null;
  payment_status: string;
  created_at: string;
  events: { name: string; date: string; location: string; status: string } | null;
  event_distances: { name: string; distance_km: number } | null;
}

const Participations: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventWithDistances[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventWithDistances | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [vipExpanded, setVipExpanded] = useState(false);
  const [vipSelected, setVipSelected] = useState(false);
  const [detailsAgreed, setDetailsAgreed] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;

      try {
        const [eventsRes, regsRes] = await Promise.all([
          eventsAPI.getEvents('upcoming'),
          registrationsAPI.getUserRegistrations(),
        ]);

        const eventsWithDist: EventWithDistances[] = [];
        for (const ev of eventsRes.data.events || []) {
          const { data: distsData } = await eventsAPI.getEventDistances(ev.id);
          // Filter out Intro Tour (25 km) for Suzdal event
          let distances = distsData.distances || [];
          if (ev.name.includes('Суздаль')) {
            distances = distances.filter(d => d.name !== 'Велогонка 25 км');
          }
          eventsWithDist.push({ ...ev, distances });
        }

        setEvents(eventsWithDist);
        setRegistrations(regsRes.data.registrations || []);
      } catch (error) {
        console.error('Error loading data:', error);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const upcomingRegs = registrations.filter(r => r.events?.status === 'upcoming' || r.events?.status === 'ongoing');
  const pastRegs = registrations.filter(r => r.events?.status === 'completed');

  const openRegistration = (ev: EventWithDistances) => {
    setSelectedEvent(ev);
    setSelectedDistance(null);
    setAccepted(false);
    setDialogOpen(true);
  };

  const addToCart = () => {
    if (!selectedEvent || !selectedDistance) return;
    const dist = selectedEvent.distances.find(d => d.id === selectedDistance);
    if (!dist) return;

    const cartItem = {
      eventSlug: selectedEvent.id,
      eventName: selectedEvent.name,
      routeName: getDisplayDistanceName(dist.name),
      distance: `${formatDistance(dist.distance_km)} км`,
      price: 6000,
      city: selectedEvent.location,
      requirements: [],
    };

    const stored = localStorage.getItem('tdr_cart');
    const cart = stored ? JSON.parse(stored) : [];

    const exists = cart.some((c: any) => c.eventSlug === cartItem.eventSlug && c.routeName === cartItem.routeName);
    if (exists) {
      toast.info('Эта дистанция уже в корзине');
      setDialogOpen(false);
      return;
    }

    cart.push(cartItem);
    localStorage.setItem('tdr_cart', JSON.stringify(cart));
    toast.success('Добавлено в корзину');
    setDialogOpen(false);
    navigate('/dashboard/cart');
  };

  const isRegistered = (eventId: string) => registrations.some(r => r.event_id === eventId);

  const openRegistrationDetails = (reg: Registration) => {
    setSelectedRegistration(reg);
    setVipExpanded(false);
    setVipSelected(false);
    setDetailsAgreed(false);
    setDetailsDialogOpen(true);
  };

  const handlePurchaseFromDetails = () => {
    if (!selectedRegistration) return;
    toast.info('Покупка дополнительных услуг временно недоступна');
    setDetailsDialogOpen(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Мои участия</h1>
        </div>

        <Tabs defaultValue="register" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="register">Регистрация</TabsTrigger>
            <TabsTrigger value="upcoming">Предстоящие</TabsTrigger>
            <TabsTrigger value="past">Архив</TabsTrigger>
          </TabsList>

          {/* Active registrations */}
          <TabsContent value="upcoming" className="mt-6">
            {upcomingRegs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Нет активных регистраций</h3>
                  <p className="text-muted-foreground mb-6">Зарегистрируйтесь на ближайшее мероприятие</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {upcomingRegs.map(r => (
                  <Card
                    key={r.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => openRegistrationDetails(r)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{r.events?.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            <MapPin className="inline w-3 h-3 mr-1" />
                            {r.events?.location} · {r.events?.date ? new Date(r.events.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Дистанция: {getDisplayDistanceName(r.event_distances?.name || '')} ({formatDistance(r.event_distances?.distance_km || 0)} км)
                            {r.bib_number && <> · Номер: <span className="font-medium text-foreground">{r.bib_number}</span></>}
                          </p>
                        </div>
                        <Badge variant={r.payment_status === 'paid' ? 'default' : 'outline'}>
                          {r.payment_status === 'paid' ? 'Оплачено' : 'Ожидает оплаты'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Past */}
          <TabsContent value="past" className="mt-6">
            {pastRegs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">История участий пуста</h3>
                  <p className="text-muted-foreground">Ваши прошедшие мероприятия будут отображаться здесь</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pastRegs.map(r => (
                  <Card key={r.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{r.events?.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {getDisplayDistanceName(r.event_distances?.name || '')} ({formatDistance(r.event_distances?.distance_km || 0)} км)
                          </p>
                        </div>
                        <Badge variant="secondary">Завершено</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Register for events */}
          <TabsContent value="register" className="mt-6">
            {events.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Нет доступных мероприятий</h3>
                  <p className="text-muted-foreground">Следите за обновлениями в календаре</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {events.map(ev => (
                  <Card key={ev.id} className="overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-foreground">{ev.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            <MapPin className="inline w-3 h-3 mr-1" />
                            {ev.location} · {new Date(ev.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          {ev.distances.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {ev.distances.map(d => (
                                <Badge key={d.id} variant="outline" className="text-xs">
                                  {getDisplayDistanceName(d.name)} · {formatDistance(d.distance_km)} км · 6 000 ₽
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0">
                          {isRegistered(ev.id) ? (
                            <Badge variant="secondary">Вы зарегистрированы</Badge>
                          ) : (
                            <Button size="sm" onClick={() => openRegistration(ev)}>
                              <Plus className="w-4 h-4 mr-1" />Регистрация
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Registration dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Регистрация на мероприятие</DialogTitle>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{selectedEvent.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedEvent.location} · {new Date(selectedEvent.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Выберите дистанцию:</p>
                {selectedEvent.distances.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDistance(d.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedDistance === d.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{getDisplayDistanceName(d.name)} — {formatDistance(d.distance_km)} км</span>
                      <span className="font-semibold text-primary">6 000 ₽</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="accept-rules"
                  checked={accepted}
                  onCheckedChange={(v) => setAccepted(v === true)}
                />
                <label htmlFor="accept-rules" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                  Я ознакомился с правилами мероприятия и принимаю условия участия
                </label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button
              onClick={addToCart}
              disabled={!selectedDistance || !accepted}
            >
              Добавить в корзину
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Registration Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-bold text-xl uppercase text-primary">
              Детали регистрации
            </DialogTitle>
          </DialogHeader>

          {selectedRegistration && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {getDisplayDistanceName(selectedRegistration.event_distances?.name || '')} — {formatDistance(selectedRegistration.event_distances?.distance_km || 0)} км
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedRegistration.events?.location} · {selectedRegistration.events?.date ? new Date(selectedRegistration.events.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </p>
                {selectedRegistration.bib_number && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Стартовый номер: <span className="font-medium text-foreground">{selectedRegistration.bib_number}</span>
                  </p>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm font-medium text-foreground mb-2">Базовая регистрация:</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Стоимость участия</span>
                  <span className="font-semibold text-foreground">6 000 ₽</span>
                </div>
              </div>

              {/* Insurance Button */}
              <div className="border-t border-border pt-4">
                <a
                  href="https://www.sogaz.ru/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold uppercase tracking-wider rounded-sm transition-colors"
                >
                  Купить страховку
                </a>
              </div>

              {/* VIP Section */}
              <div className="border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setVipExpanded(!vipExpanded)}
                  className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={vipSelected}
                      onCheckedChange={(checked) => setVipSelected(checked === true)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="font-bold text-foreground">Выбрать VIP Пакет</span>
                  </div>
                  {vipExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>

                {vipExpanded && (
                  <div className="p-4 bg-background space-y-3">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-foreground">VIP Пакет включает:</p>
                      <span className="font-bold text-lg text-primary">7 000 ₽</span>
                    </div>
                    <ul className="space-y-2 text-sm text-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>Завтрак в VIP шатре</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>VIP парковка</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>Регистрация в VIP стойке</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm text-muted-foreground">Итого к оплате</span>
                <span className="font-extrabold text-2xl text-primary">
                  {vipSelected ? '11 000 ₽' : '6 000 ₽'}
                </span>
              </div>

              <div className="flex items-start gap-3 border-t border-border pt-4">
                <Checkbox
                  id="agree-details"
                  checked={detailsAgreed}
                  onCheckedChange={(checked) => setDetailsAgreed(checked === true)}
                />
                <label
                  htmlFor="agree-details"
                  className="text-sm text-foreground leading-snug cursor-pointer"
                >
                  С условиями ознакомлен и подтверждаю
                </label>
              </div>

              <Button
                onClick={handlePurchaseFromDetails}
                disabled={!detailsAgreed}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider"
              >
                Перейти к покупке
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Participations;
