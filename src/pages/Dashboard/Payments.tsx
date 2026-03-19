import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faReceipt } from '@fortawesome/free-solid-svg-icons';

const Payments: React.FC = () => {
  const payments: any[] = [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">История платежей</h1>
          <p className="text-muted-foreground mt-1">
            Все ваши транзакции и стартовые взносы
          </p>
        </div>

        {payments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FontAwesomeIcon icon={faCreditCard} className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Нет платежей
              </h3>
              <p className="text-muted-foreground">
                История ваших платежей будет отображаться здесь после оплаты стартовых взносов
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={faReceipt} className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">{payment.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.created_at).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{payment.amount} ₽</p>
                      <p className={`text-sm ${
                        payment.status === 'success' ? 'text-green-500' :
                        payment.status === 'pending' ? 'text-orange-500' : 'text-red-500'
                      }`}>
                        {payment.status === 'success' ? 'Оплачено' :
                         payment.status === 'pending' ? 'Ожидание' : 'Ошибка'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Payments;
