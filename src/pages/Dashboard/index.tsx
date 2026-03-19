import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProfileCompletion from '@/components/dashboard/ProfileCompletion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faTrophy, faFileLines, faHeart, faArrowRight, faUser } from '@fortawesome/free-solid-svg-icons';

const Dashboard: React.FC = () => {
  const { profile, user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  const getName = () => {
    if (profile?.first_name) return profile.first_name;
    if (user?.email) return user.email.split('@')[0];
    return 'участник';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome section */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            {getGreeting()}, {getName()}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Добро пожаловать в ваш личный кабинет Tour de Russie
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FontAwesomeIcon icon={faCalendarDays} className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ближайшее событие</p>
                  <p className="font-semibold text-foreground">Нет регистраций</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <FontAwesomeIcon icon={faTrophy} className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Всего участий</p>
                  <p className="font-semibold text-foreground">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <FontAwesomeIcon icon={faHeart} className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Справка о здоровье</p>
                  <p className="font-semibold text-foreground">Не загружена</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <FontAwesomeIcon icon={faFileLines} className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Документы</p>
                  <p className="font-semibold text-foreground">Требуется подпись</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile completion */}
          <div className="lg:col-span-1">
            <ProfileCompletion />
            
            <Link to="/dashboard/profile" className="block mt-4">
              <Button variant="outline" className="w-full">
                <FontAwesomeIcon icon={faUser} className="h-4 w-4 mr-2" />
                Редактировать профиль
              </Button>
            </Link>
          </div>

          {/* Quick actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Быстрые действия</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link 
                  to="/calendar" 
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faCalendarDays} className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Зарегистрироваться на мероприятие</p>
                      <p className="text-sm text-muted-foreground">Выберите событие из календаря</p>
                    </div>
                  </div>
                  <FontAwesomeIcon icon={faArrowRight} className="h-5 w-5 text-muted-foreground" />
                </Link>

                <Link 
                  to="/dashboard/health" 
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faHeart} className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-foreground">Загрузить справку о здоровье</p>
                      <p className="text-sm text-muted-foreground">Требуется для участия в гонках</p>
                    </div>
                  </div>
                  <FontAwesomeIcon icon={faArrowRight} className="h-5 w-5 text-muted-foreground" />
                </Link>

                <Link 
                  to="/dashboard/documents" 
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faFileLines} className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium text-foreground">Подписать документы</p>
                      <p className="text-sm text-muted-foreground">Вейвер и согласия</p>
                    </div>
                  </div>
                  <FontAwesomeIcon icon={faArrowRight} className="h-5 w-5 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
