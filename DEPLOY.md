# Инструкция по деплою фронтенда Tour de Russie

## Что было сделано

✅ Удалена папка node_modules (установите на сервере)
✅ Удалена зависимость от Supabase
✅ Настроено подключение к вашему бекенду (https://tourderussie.ru/api)
✅ Созданы файлы конфигурации (.env.production, .env.example)
✅ Обновлены все формы для работы с вашим API
✅ Создан API клиент (src/lib/api.ts)

## Шаги для деплоя на сервер

### 1. Загрузите проект на сервер

Скопируйте всю папку `indesign-to-html-main` на ваш сервер.

### 2. Установите зависимости

```bash
cd /path/to/indesign-to-html-main
npm install
```

### 3. Проверьте файл .env.production

Убедитесь, что файл `.env.production` содержит правильные URL:

```bash
VITE_API_URL=https://tourderussie.ru/api
VITE_FRONTEND_URL=https://tourderussie.ru
```

### 4. Соберите проект

```bash
npm run build
```

После выполнения команды появится папка `dist` с готовыми файлами.

### 5. Настройте веб-сервер

#### Для Nginx:

```nginx
server {
    listen 80;
    server_name tourderussie.ru www.tourderussie.ru;
    root /path/to/indesign-to-html-main/dist;
    index index.html;

    # Обслуживание статических файлов
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Проксирование API запросов к бекенду
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Кэширование статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Для Apache (.htaccess):

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### 6. Перезапустите веб-сервер

```bash
# Для Nginx
sudo systemctl restart nginx

# Для Apache
sudo systemctl restart apache2
```

## Проверка работы

1. Откройте https://tourderussie.ru в браузере
2. Проверьте, что сайт загружается
3. Откройте консоль разработчика (F12) и проверьте, нет ли ошибок
4. Попробуйте отправить форму обратной связи или корпоративную заявку
5. Проверьте, что запросы идут на https://tourderussie.ru/api

## Важные моменты

### CORS на бекенде

Убедитесь, что на бекенде настроен CORS для домена https://tourderussie.ru:

```javascript
// В вашем backend/src/index.ts должно быть:
app.use(
  cors({
    origin: ["https://tourderussie.ru", "https://www.tourderussie.ru"],
    credentials: true,
  }),
);
```

### SSL сертификат

Убедитесь, что у вас установлен SSL сертификат для HTTPS.
Можно использовать Let's Encrypt (бесплатно):

```bash
sudo certbot --nginx -d tourderussie.ru -d www.tourderussie.ru
```

### PM2 для бекенда

Убедитесь, что бекенд запущен через PM2:

```bash
cd /home/tour-de-russie/backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Структура файлов на сервере

```
/home/tour-de-russie/
├── backend/              # Бекенд (уже настроен)
│   ├── src/
│   ├── dist/
│   ├── .env
│   └── ecosystem.config.js
│
└── frontend/             # Фронтенд (новый)
    ├── dist/             # Собранные файлы (nginx указывает сюда)
    ├── src/
    ├── public/
    ├── .env.production
    └── package.json
```

## Обновление фронтенда в будущем

Когда нужно обновить фронтенд:

```bash
cd /path/to/indesign-to-html-main
git pull  # если используете git
npm install  # если добавились новые зависимости
npm run build
# Nginx автоматически начнет отдавать новые файлы из dist/
```

## Troubleshooting

### Проблема: API запросы не работают

- Проверьте, что бекенд запущен: `pm2 status`
- Проверьте логи бекенда: `pm2 logs backend`
- Проверьте CORS настройки на бекенде

### Проблема: Страницы не загружаются при прямом переходе

- Убедитесь, что настроен `try_files` в nginx (см. конфиг выше)
- Для Apache убедитесь, что включен mod_rewrite

### Проблема: Статические файлы не загружаются

- Проверьте права доступа к папке dist: `chmod -R 755 dist`
- Проверьте путь в конфиге nginx

## Контакты для поддержки

Если возникнут проблемы, проверьте:

1. Логи nginx: `/var/log/nginx/error.log`
2. Логи бекенда: `pm2 logs backend`
3. Консоль браузера (F12 → Console)
