import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import HeaderNew from '@/components/HeaderNew';
import FooterNew from '@/components/FooterNew';

const eventNames: Record<string, string> = {
  suzdal: 'Суздаль',
  igora: 'Игора',
  pushkin: 'Царское Село',
  moscow: 'Москва',
};

const MediaVideoGallery: React.FC = () => {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const eventName = eventNames[eventSlug || ''] || eventSlug;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [eventSlug]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeaderNew />
      <main className="pt-24 md:pt-28 flex-1">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-4 md:py-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/media" className="hover:text-foreground transition-colors">Медиа</Link>
            <span>/</span>
            <span className="text-foreground">Видео — {eventName}</span>
          </div>

          <h1 className="font-extrabold text-base uppercase tracking-tight text-foreground mb-8">
            Видео — {eventName}
          </h1>

          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <p className="text-base">Видео будут добавлены позже</p>
          </div>
        </div>
      </main>
      <FooterNew />
    </div>
  );
};

export default MediaVideoGallery;
