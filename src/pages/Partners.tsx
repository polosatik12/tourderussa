import React, { useEffect } from 'react';
import HeaderNew from '../components/HeaderNew';
import FooterNew from '../components/FooterNew';

import gazpromMezhregiongaz from '../assets/partners/gazprom-mezhregiongaz.jpg';
import rostelecom from '../assets/partners/rostelecom.png';
import bankRossiya from '../assets/partners/bank-rossiya.png';
import gazpromNeft from '../assets/partners/gazprom-neft.png';
import interRao from '../assets/partners/inter-rao.jpg';
import delovayaRossiya from '../assets/partners/delovaya-rossiya.jpg';
import rzhd from '../assets/partners/rzhd.png';
import sogazMedicina from '../assets/partners/sogaz-medicina.png';
import sogaz from '../assets/partners/sogaz.png';

const partners = [
{ src: gazpromMezhregiongaz, alt: 'Газпром Межрегионгаз' },
{ src: gazpromNeft, alt: 'Газпром Нефть' },
{ src: bankRossiya, alt: 'Банк Россия' },
{ src: rostelecom, alt: 'Ростелеком' },
{ src: rzhd, alt: 'РЖД' },
{ src: interRao, alt: 'Интер РАО' },
{ src: sogaz, alt: 'СОГАЗ' },
{ src: sogazMedicina, alt: 'СОГАЗ Медицина' },
{ src: delovayaRossiya, alt: 'Деловая Россия' },
{ src: '/images/partners/moscow-coat-of-arms.png', alt: 'Правительство Москвы' },
{ src: '/images/partners/leningrad-oblast-coat-of-arms.png', alt: 'Правительство Ленинградской области' },
{ src: '/images/partners/vladimir-oblast-coat-of-arms.png', alt: 'Правительство Владимирской области' },
{ src: '/images/partners/saint-petersburg-coat-of-arms.png', alt: 'Правительство Санкт-Петербурга' },
{ src: '/images/partners/academy-of-life.png', alt: 'Академия Жизни' },
{ src: '/images/partners/teremok.png', alt: 'Теремок' },
{ src: '/images/partners/rm-travel.png', alt: 'R&M Travel' }];


const Partners: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      <HeaderNew />
      
      <main className="tdr-page">
        <div className="tdr-container">
          <h1 className="font-extrabold text-base uppercase tracking-tight text-foreground mb-8">Партнеры</h1>
          
          



          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
            {partners.map((partner, index) =>
            <div key={index} className="flex items-center justify-center">
                <img
                src={partner.src}
                alt={partner.alt}
                loading="lazy"
                decoding="async"
                className="max-h-20 object-contain" />

              </div>
            )}
          </div>
        </div>
        
      </main>
      
      <FooterNew />
    </div>);

};

export default Partners;