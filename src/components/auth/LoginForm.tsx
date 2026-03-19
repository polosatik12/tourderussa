import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faSpinner } from '@fortawesome/free-solid-svg-icons';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptTerms || !acceptPrivacy) {
      toast({
        title: 'Необходимо согласие',
        description: 'Пожалуйста, примите условия использования и политику конфиденциальности',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: 'Ошибка входа',
        description: error.message === 'Invalid login credentials' 
          ? 'Неверный email или пароль' 
          : error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Добро пожаловать!',
        description: 'Вы успешно вошли в систему',
      });
      navigate('/dashboard');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="champion@tourderussie.ru"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <div className="relative">
          <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
            required
            minLength={6}
          />
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-start gap-2">
          <Checkbox
            id="terms-login"
            checked={acceptTerms}
            onCheckedChange={(v) => setAcceptTerms(v === true)}
            className="mt-0.5"
          />
          <label htmlFor="terms-login" className="text-sm leading-snug cursor-pointer">
            Я принимаю{' '}
            <a href="/documents/terms-of-service.pdf" target="_blank" className="font-bold underline text-primary">
              условия использования
            </a>
          </label>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="privacy-login"
            checked={acceptPrivacy}
            onCheckedChange={(v) => setAcceptPrivacy(v === true)}
            className="mt-0.5"
          />
          <label htmlFor="privacy-login" className="text-sm leading-snug cursor-pointer">
            Я принимаю{' '}
            <a href="/documents/privacy-policy.pdf" target="_blank" className="font-bold underline text-primary">
              политику конфиденциальности
            </a>
          </label>
        </div>
      </div>

      <Button type="submit" className="w-full bg-[#003051] hover:bg-[#003051]/90 text-white" disabled={loading || !acceptTerms || !acceptPrivacy}>
        {loading ? (
          <>
            <FontAwesomeIcon icon={faSpinner} className="mr-2 h-4 w-4 animate-spin" />
            Вход...
          </>
        ) : (
          'Войти'
        )}
      </Button>
    </form>
  );
};

export default LoginForm;
