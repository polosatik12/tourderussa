import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import HeaderNew from '../../components/HeaderNew';
import FooterNew from '../../components/FooterNew';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface RegistrationCard {
  routeName: string;
  distance: string;
  requirements: string[];
  timeLimitNote?: string;
  price: number;
  priceLabel: string;
}

interface EventRegistrationProps {
  slug: string;
  eventName: string;
  city: string;
  registrationCards: RegistrationCard[];
  borderColors: string[];
  backUrl: string;
}

const EventRegistration: React.FC<EventRegistrationProps> = ({
  slug,
  eventName,
  city,
  registrationCards,
  borderColors,
  backUrl,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<RegistrationCard | null>(null);
  const [agreed, setAgreed] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleParticipate = (cardIndex: number) => {
    setSelectedCard(registrationCards[cardIndex]);
    setAgreed(false);
    setConfirmOpen(true);
  };

  const handleProceedToCart = () => {
    if (!selectedCard) return;
    setConfirmOpen(false);
    alert('Регистрация временно недоступна. Следите за обновлениями на сайте.');
  };

  return (
    <div className="min-h-screen bg-background">
      <HeaderNew />

      <section className="pt-[88px] py-16 md:py-20 bg-muted">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <Link
            to={backUrl}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
            Назад к мероприятию
          </Link>

          <h1 className="font-extrabold text-2xl md:text-3xl text-primary uppercase mb-2 text-center font-mono">
            Регистрация
          </h1>
          <p className="text-center text-muted-foreground mb-10">{eventName}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {registrationCards.map((card, idx) => (
              <div key={card.routeName} className="bg-background border border-border flex flex-col">
                <div className="px-6 py-3" style={{ backgroundColor: borderColors[idx] }}>
                  <h3 className="font-bold text-white uppercase text-center text-xl font-mono">
                    {card.routeName} {card.distance}
                  </h3>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex-grow">
                    <ul className="space-y-2 text-sm text-foreground mb-4">
                      {card.requirements.map((req) => (
                        <li key={req}>• {req}</li>
                      ))}
                    </ul>
                    {card.timeLimitNote && (
                      <p className="text-destructive font-semibold text-xs mb-6">
                        Внимание: {card.timeLimitNote}
                      </p>
                    )}
                    <div className="mb-4">
                      <span className="font-extrabold text-3xl text-primary">{card.priceLabel}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleParticipate(idx)}
                    className="mt-auto w-full bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider text-sm py-3 transition-colors"
                  >
                    Участвовать
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FooterNew />

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-xl uppercase text-primary tracking-wide">
              Подтверждение выбора
            </DialogTitle>
            <DialogDescription>Проверьте условия участия перед покупкой</DialogDescription>
          </DialogHeader>

          {selectedCard && (
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-foreground mb-1">
                  {selectedCard.routeName} — {selectedCard.distance}
                </p>
                <p className="text-sm text-muted-foreground">Город: {city}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-2">Требования:</p>
                <ul className="space-y-1 text-sm text-foreground">
                  {selectedCard.requirements.map((req) => (
                    <li
                      key={req}
                      className={req.includes('Лимит') ? 'text-destructive font-semibold' : ''}
                    >
                      • {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm text-muted-foreground">Стоимость</span>
                <span className="font-extrabold text-2xl text-primary">
                  {selectedCard.priceLabel}
                </span>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id={`agree-${slug}`}
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked === true)}
                />
                <label
                  htmlFor={`agree-${slug}`}
                  className="text-sm text-foreground leading-snug cursor-pointer"
                >
                  С условиями ознакомлен и подтверждаю
                </label>
              </div>

              <Button
                onClick={handleProceedToCart}
                disabled={!agreed}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider"
              >
                Перейти к покупке
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventRegistration;
