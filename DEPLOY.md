# Пошаговая инструкция по деплою проекта

## Подготовка

### Требования на сервере:

- Ubuntu 24.04 LTS (или другой Linux дистрибутив)
- Node.js 20 LTS (или выше)
- Nginx
- PM2
- Git

Если эти компоненты еще не установлены, следуйте инструкции из `VPS_SETUP.md`.

---

## Этап 1: Подготовка проекта локально

### 1.1. Проверьте, что проект готов к деплою

```bash
# Убедитесь, что все зависимости установлены
npm install

# Проверьте, что проект собирается без ошибок
npm run build
```

### 1.2. Создайте файл `.env.example` (для документации переменных окружения)

Создайте файл `.env.example` в корне проекта:

```env
# Аутентификация админ-панели
ADMIN_PASSWORD=ваш_пароль_админа
ADMIN_SECRET_KEY=ваш_секретный_ключ

# Telegram бот (опционально, но рекомендуется)
TELEGRAM_BOT_TOKEN=ваш_токен_бота
TELEGRAM_CHAT_ID=ваш_chat_id

# Yandex Object Storage (опционально, если используете)
YANDEX_STORAGE_ENDPOINT=https://storage.yandexcloud.net
YANDEX_STORAGE_REGION=ru-central1
YANDEX_STORAGE_BUCKET=ваш_бакет
YANDEX_STORAGE_ACCESS_KEY_ID=ваш_ключ
YANDEX_STORAGE_SECRET_ACCESS_KEY=ваш_секрет
```

**Важно:** `.env.example` можно закоммитить в Git, но `.env` - НЕТ (он уже в `.gitignore`).

---

## Этап 2: Настройка Git репозитория

### 2.1. Убедитесь, что проект в Git

```bash
# Проверьте статус
git status

# Если есть несохраненные изменения, закоммитьте их
git add .
git commit -m "Подготовка к деплою"
```

### 2.2. Создайте удаленный репозиторий (если еще нет)

- GitHub: https://github.com/new
- GitLab: https://gitlab.com/projects/new
- Bitbucket: https://bitbucket.org/repo/create

### 2.3. Добавьте remote и запушьте код

```bash
# Добавьте remote (замените URL на свой)
git remote add origin https://github.com/ваш-username/ваш-репозиторий.git

# Или если remote уже есть, проверьте URL
git remote -v

# Запушьте код
git push -u origin main
# или
git push -u origin master
```

---

## Этап 3: Подключение к серверу

### 3.1. Подключитесь к серверу по SSH

```bash
# Замените IP_ADDRESS и USERNAME на данные вашего сервера
ssh USERNAME@IP_ADDRESS

# Или если используете ключ SSH
ssh -i /path/to/your/key.pem USERNAME@IP_ADDRESS
```

### 3.2. Проверьте, что все установлено

```bash
# Проверьте версии
node -v    # Должно быть v20.x.x или выше
npm -v     # Должна быть версия 10.x.x или выше
pm2 -v     # Должна быть версия 5.x.x или выше
nginx -v   # Должна быть версия 1.x.x или выше
git --version
```

---

## Этап 4: Клонирование проекта на сервер

### 4.1. Перейдите в директорию для проектов

```bash
# Обычно используется /var/www или /home/USERNAME/projects
cd /var/www

# Или создайте директорию для проектов
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www
cd /var/www
```

### 4.2. Клонируйте репозиторий

```bash
# Клонируйте ваш репозиторий
git clone https://github.com/ваш-username/ваш-репозиторий.git mp
# Или если репозиторий приватный, используйте SSH:
# git clone git@github.com:ваш-username/ваш-репозиторий.git mp

cd mp
```

### 4.3. Установите зависимости

```bash
# Установите зависимости
npm install --production=false

# Это установит все зависимости (включая devDependencies для сборки)
```

---

## Этап 5: Настройка переменных окружения

### 5.1. Создайте файл `.env` на сервере

```bash
# В директории проекта
cd /var/www/mp

# Создайте файл .env
nano .env
```

### 5.2. Добавьте переменные окружения

Вставьте следующие переменные (замените значения на свои):

```env
# Аутентификация админ-панели (ОБЯЗАТЕЛЬНО)
ADMIN_PASSWORD=ваш_пароль_админа
ADMIN_SECRET_KEY=ваш_секретный_ключ

# Telegram бот (опционально, но рекомендуется)
TELEGRAM_BOT_TOKEN=ваш_токен_бота
TELEGRAM_CHAT_ID=ваш_chat_id
```

**Важно:**

- НЕ используйте кавычки вокруг значений
- НЕ добавляйте пробелы вокруг `=`
- Каждое значение на новой строке

**Как получить TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID:**

1. **BOT_TOKEN:**

   - Откройте [@BotFather](https://t.me/BotFather) в Telegram
   - Отправьте `/newbot`
   - Следуйте инструкциям и получите токен

2. **CHAT_ID:**
   - Откройте [@userinfobot](https://t.me/userinfobot)
   - Бот покажет ваш Chat ID
   - Или отправьте сообщение боту и откройте: `https://api.telegram.org/bot<ВАШ_ТОКЕН>/getUpdates`
   - Найдите `chat.id` в ответе

### 5.3. Сохраните файл

В `nano`: `Ctrl+O` (сохранить), `Enter` (подтвердить), `Ctrl+X` (выход)

### 5.4. Установите права доступа

```bash
# Сделайте файл доступным только для чтения владельцу
chmod 600 .env
```

---

## Этап 6: Сборка проекта

### 6.1. Соберите проект

```bash
# В директории проекта
cd /var/www/mp

# Соберите проект для production
npm run build
```

**Важно:** Процесс сборки может занять несколько минут. Дождитесь завершения.

### 6.2. Проверьте, что сборка прошла успешно

```bash
# Проверьте, что директория .output создана
ls -la .output

# Проверьте структуру
ls -la .output/server
```

---

## Этап 7: Создание директории для данных

### 7.1. Создайте директорию `data`

```bash
# В директории проекта
cd /var/www/mp

# Создайте директорию data
mkdir -p data

# Установите права доступа
chmod 755 data
```

Эта директория будет использоваться для хранения:

- `order-fields-config.json` - конфигурация полей заказа
- `order-fields-meta.json` - метаданные страниц (изображения, описания)

---

## Этап 8: Настройка PM2

### 8.1. Создайте PM2 конфигурацию (опционально)

```bash
# В директории проекта
cd /var/www/mp

# Создайте файл ecosystem.config.js
nano ecosystem.config.js
```

Добавьте содержимое:

```javascript
export default {
  apps: [
    {
      name: "nuxt-app",
      script: ".output/server/index.mjs",
      cwd: "/var/www/mp",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        NITRO_PORT: 3000,
      },
      error_file: "/var/www/mp/logs/pm2-error.log",
      out_file: "/var/www/mp/logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
    },
  ],
};
```

Сохраните: `Ctrl+O`, `Enter`, `Ctrl+X`

### 8.2. Создайте директорию для логов

```bash
mkdir -p logs
chmod 755 logs
```

### 8.3. Запустите приложение через PM2

```bash
# Используя ecosystem.config.js
pm2 start ecosystem.config.js

# Или напрямую
pm2 start .output/server/index.mjs --name nuxt-app

# Сохраните конфигурацию PM2
pm2 save

# Настройте автозапуск при перезагрузке сервера
pm2 startup
# Выполните команду, которую выведет PM2 (обычно с sudo)
```

### 8.4. Проверьте статус

```bash
# Проверьте статус приложения
pm2 status

# Проверьте логи
pm2 logs nuxt-app --lines 50
```

---

## Этап 9: Настройка Nginx

### 9.1. Создайте конфигурацию Nginx

```bash
# Создайте конфигурационный файл
sudo nano /etc/nginx/sites-available/mp
```

Добавьте следующую конфигурацию (замените `YOUR_DOMAIN` на ваш домен или IP):

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN или IP_ADDRESS;

    # Лимиты для загрузки файлов
    client_max_body_size 10M;

    # Проксирование на Nuxt приложение
    location / {
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

    # Статические файлы (опционально, если нужен прямой доступ)
    location /img/ {
        alias /var/www/mp/public/img/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Сохраните: `Ctrl+O`, `Enter`, `Ctrl+X`

### 9.2. Активируйте конфигурацию

```bash
# Создайте символическую ссылку
sudo ln -s /etc/nginx/sites-available/mp /etc/nginx/sites-enabled/

# Проверьте конфигурацию Nginx
sudo nginx -t

# Если все ОК, перезагрузите Nginx
sudo systemctl reload nginx
```

---

## Этап 10: Настройка файрвола (если нужно)

### 10.1. Откройте необходимые порты

```bash
# Разрешите HTTP (порт 80)
sudo ufw allow 80/tcp

# Разрешите HTTPS (порт 443, если используете SSL)
sudo ufw allow 443/tcp

# Проверьте статус
sudo ufw status
```

---

## Этап 11: Проверка работы

### 11.1. Проверьте, что приложение работает

```bash
# Проверьте статус PM2
pm2 status

# Проверьте логи
pm2 logs nuxt-app --lines 20

# Проверьте, что порт 3000 слушается
netstat -tlnp | grep 3000
# или
ss -tlnp | grep 3000
```

### 11.2. Проверьте в браузере

Откройте в браузере:

- `http://YOUR_DOMAIN` или `http://IP_ADDRESS`
- `http://YOUR_DOMAIN/admin/login` или `http://IP_ADDRESS/admin/login`

### 11.3. Проверьте админ-панель

1. Откройте `/admin/login`
2. Введите пароль из `ADMIN_PASSWORD`
3. Должна открыться админ-панель

---

## Этап 12: Настройка SSL (опционально, но рекомендуется)

### 12.1. Установите Certbot

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### 12.2. Получите SSL сертификат

```bash
# Замените YOUR_DOMAIN на ваш домен
sudo certbot --nginx -d YOUR_DOMAIN

# Следуйте инструкциям на экране
```

Certbot автоматически обновит конфигурацию Nginx и настроит автоматическое обновление сертификата.

---

## Полезные команды для управления

### Управление PM2

```bash
# Остановить приложение
pm2 stop nuxt-app

# Перезапустить приложение
pm2 restart nuxt-app

# Посмотреть логи
pm2 logs nuxt-app

# Посмотреть логи в реальном времени
pm2 logs nuxt-app --lines 50 --lines

# Мониторинг
pm2 monit
```

### Обновление проекта

```bash
# Перейдите в директорию проекта
cd /var/www/mp

# Получите последние изменения из Git
git pull

# Установите новые зависимости (если есть)
npm install

# Пересоберите проект
npm run build

# Перезапустите приложение
pm2 restart nuxt-app

# Проверьте логи
pm2 logs nuxt-app --lines 20
```

### Просмотр логов

```bash
# Логи PM2
pm2 logs nuxt-app

# Логи Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Системные логи
sudo journalctl -u nginx -f
```

### Резервное копирование данных

```bash
# Создайте резервную копию данных
cd /var/www/mp
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz data/

# Скопируйте на локальную машину
scp USERNAME@IP_ADDRESS:/var/www/mp/backup-*.tar.gz ./
```

---

## Частые проблемы и решения

### Проблема 1: Ошибка 500 при входе в админ-панель

**Решение:**

```bash
# Проверьте, что .env файл существует и содержит переменные
cat /var/www/mp/.env

# Проверьте логи
pm2 logs nuxt-app --lines 50

# Убедитесь, что перезапустили приложение после изменения .env
pm2 restart nuxt-app
```

### Проблема 2: Приложение не запускается

**Решение:**

```bash
# Проверьте логи
pm2 logs nuxt-app --err

# Проверьте, что порт 3000 свободен
sudo lsof -i :3000

# Проверьте, что .env файл настроен правильно
cat /var/www/mp/.env
```

### Проблема 3: Nginx показывает 502 Bad Gateway

**Решение:**

```bash
# Проверьте, что приложение запущено
pm2 status

# Проверьте, что порт 3000 слушается
netstat -tlnp | grep 3000

# Проверьте логи Nginx
sudo tail -f /var/log/nginx/error.log

# Перезапустите приложение
pm2 restart nuxt-app
```

### Проблема 4: Изменения не применяются

**Решение:**

```bash
# Убедитесь, что проект пересобран
cd /var/www/mp
npm run build

# Перезапустите PM2
pm2 restart nuxt-app

# Очистите кэш браузера (Ctrl+Shift+R или Ctrl+F5)
```

---

## Проверочный чеклист

- [ ] Node.js установлен и работает
- [ ] PM2 установлен и работает
- [ ] Nginx установлен и работает
- [ ] Проект клонирован на сервер
- [ ] Зависимости установлены (`npm install`)
- [ ] Файл `.env` создан и настроен
- [ ] Проект собран (`npm run build`)
- [ ] Директория `data` создана
- [ ] Приложение запущено через PM2
- [ ] PM2 настроен на автозапуск
- [ ] Nginx настроен и проксирует на порт 3000
- [ ] Файрвол настроен (порты 80, 443 открыты)
- [ ] Сайт открывается в браузере
- [ ] Админ-панель работает
- [ ] SSL настроен (опционально)

---

## Следующие шаги

1. **Настройте мониторинг** (опционально):

   - Настройте PM2 Plus для мониторинга
   - Настройте уведомления об ошибках

2. **Настройте резервное копирование**:

   - Настройте автоматическое резервное копирование `data/` директории
   - Используйте cron для регулярных бэкапов

3. **Оптимизация**:
   - Настройте кэширование в Nginx
   - Оптимизируйте изображения
   - Настройте CDN (если нужно)

---

**Готово! Ваш проект должен работать на сервере.**

Если возникнут проблемы, проверьте логи:

- `pm2 logs nuxt-app`
- `sudo tail -f /var/log/nginx/error.log`
