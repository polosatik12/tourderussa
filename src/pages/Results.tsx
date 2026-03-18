import React from 'react';
import HeaderNew from '@/components/HeaderNew';
import FooterNew from '@/components/FooterNew';

const Results: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeaderNew />
      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="font-extrabold text-2xl md:text-3xl text-primary uppercase mb-8 text-center">
            Результаты
          </h1>
          <div className="bg-card p-8 rounded-lg shadow-md text-center">
            <p className="text-muted-foreground text-lg mb-4">
              Результаты велозаездов будут опубликованы после проведения мероприятий.
            </p>
            <p className="text-muted-foreground">
              Следите за обновлениями на нашем сайте и в социальных сетях.
            </p>
          </div>
        </div>
      </main>
      <FooterNew />
    </div>
  );
};

export default Results;
