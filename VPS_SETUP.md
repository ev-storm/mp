# Инструкция по настройке VPS для Nuxt SSR проекта

## Конфигурация сервера
- **CPU:** 1 vCPU
- **RAM:** 2 ГБ
- **Диск:** 10 ГБ
- **ОС:** Ubuntu 24.04 LTS

---

## Шаг 1: Подключение к серверу

**Получите данные для подключения:**
- IP-адрес сервера
- Логин (обычно `root`)
- Пароль или SSH-ключ

**Подключитесь через SSH:**
```bash
# Windows (PowerShell или Git Bash)
ssh root@ВАШ_IP_АДРЕС

# Или с паролем
ssh root@ВАШ_IP_АДРЕС -p 22
```

---

## Шаг 2: Обновление системы

```bash
# Обновить список пакетов
sudo apt update

# Обновить систему
sudo apt upgrade -y

# Перезагрузить (если нужно)
sudo reboot
```

---

## Шаг 3: Установка Node.js 20 LTS

```bash
# Установить curl (если не установлен)
sudo apt install -y curl

# Добавить репозиторий NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Установить Node.js
sudo apt install -y nodejs

# Проверить версии
node -v  # Должно быть v20.x.x
npm -v   # Должно быть 10.x.x
```

**Альтернативный способ (если NodeSource не работает):**
```bash
sudo apt install -y nodejs npm
```

---

## Шаг 4: Установка Nginx

**Зачем нужен Nginx:**
- Работает как Reverse Proxy (принимает запросы на порт 80/443 и перенаправляет на Node.js приложение)
- Отдает статические файлы (быстрее)
- Обрабатывает SSL/HTTPS
- Безопасность (Node.js не работает от root)

```bash
# Установить Nginx
sudo apt install -y nginx

# Запустить и добавить в автозагрузку
sudo systemctl start nginx
sudo systemctl enable nginx

# Проверить статус
sudo systemctl status nginx
```

**Проверьте в браузере:** `http://ВАШ_IP_АДРЕС` — должна открыться страница Nginx

---

## Шаг 5: Установка PM2

**PM2** — менеджер процессов для Node.js, который:
- Автоматически перезапускает приложение при сбоях
- Управляет логами
- Запускает приложение при загрузке сервера

```bash
# Установить PM2 глобально
sudo npm install -g pm2

# Добавить PM2 в автозагрузку
pm2 startup systemd
# Выполните команду, которую PM2 покажет (обычно что-то вроде):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
```

---

## Шаг 6: Настройка Firewall

```bash
# Установить UFW (если не установлен)
sudo apt install -y ufw

# Разрешить SSH
sudo ufw allow 22/tcp

# Разрешить HTTP и HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Включить firewall
sudo ufw enable

# Проверить статус
sudo ufw status
```

---

## Шаг 7: Загрузка проекта на сервер

### Вариант А: Через Git (если проект в репозитории)

```bash
# Установить Git
sudo apt install -y git

# Создать директорию для проекта
mkdir -p /var/www
cd /var/www

# Клонировать проект (замените на ваш репозиторий)
git clone https://github.com/ваш-юзер/ваш-репозиторий.git mp
cd mp
```

### Вариант Б: Через SCP (если проект локально)

**На вашем компьютере (Windows PowerShell):**
```bash
scp -r C:\Users\delir\Documents\PROJECT\mp root@ВАШ_IP_АДРЕС:/var/www/
```

**На сервере:**
```bash
cd /var/www/mp
```

### Вариант В: Через SFTP (FileZilla, WinSCP)
- Подключитесь к серверу через SFTP
- Загрузите папку проекта в `/var/www/mp`

---

## Шаг 8: Установка зависимостей проекта

```bash
# Перейти в директорию проекта
cd /var/www/mp

# Установить зависимости
npm install

# Создать .env файл
nano .env
```

**Содержимое `.env` файла:**
```env
# Аутентификация админ-панели
ADMIN_PASSWORD=ваш_пароль_админа
ADMIN_SECRET_KEY=ваш_секретный_ключ
ADMIN_PASSWORD_HASH=хеш_пароля_для_клиента

# Yandex Object Storage (если используете)
YANDEX_STORAGE_ENDPOINT=https://storage.yandexcloud.net
YANDEX_STORAGE_REGION=ru-central1
YANDEX_STORAGE_BUCKET=ваш_бакет
YANDEX_STORAGE_ACCESS_KEY_ID=ваш_ключ
YANDEX_STORAGE_SECRET_ACCESS_KEY=ваш_секрет

# URL для загрузки изображений (если используете Cloud Function)
UPLOAD_IMAGE_API_URL=https://functions.yandexcloud.net/...
```

**Сгенерировать хеш пароля (на локальном компьютере):**
```bash
# На вашем локальном компьютере
node scripts/generate-password-hash.js ваш_пароль ваш_секретный_ключ
# Скопируйте полученный хеш в ADMIN_PASSWORD_HASH
```

**Сохранение в nano:** `Ctrl+O` → Enter → `Ctrl+X`

---

## Шаг 9: Сборка проекта

```bash
# Собрать проект
npm run build

# Проверить, что сборка прошла успешно
ls -la .output/
```

---

## Шаг 10: Запуск через PM2

```bash
# Запустить приложение
pm2 start .output/server/index.mjs --name "nuxt-app"

# Сохранить конфигурацию PM2
pm2 save

# Проверить статус
pm2 status
pm2 logs nuxt-app
```

**Приложение должно запуститься на порту 3000**

---

## Шаг 11: Настройка Nginx как Reverse Proxy

```bash
# Создать конфигурацию для вашего сайта
sudo nano /etc/nginx/sites-available/mp
```

**Содержимое файла:**
```nginx
server {
    listen 80;
    server_name ВАШ_IP_АДРЕС;  # Или ваш домен, если есть

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
}
```

**Активировать конфигурацию:**
```bash
# Создать символическую ссылку
sudo ln -s /etc/nginx/sites-available/mp /etc/nginx/sites-enabled/

# Удалить дефолтную конфигурацию (опционально)
sudo rm /etc/nginx/sites-enabled/default

# Проверить конфигурацию Nginx
sudo nginx -t

# Перезагрузить Nginx
sudo systemctl reload nginx
```

---

## Шаг 12: Настройка SSL (Let's Encrypt) - опционально

**Если у вас есть домен:**
```bash
# Установить Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получить SSL сертификат
sudo certbot --nginx -d ваш-домен.ru

# Автоматическое обновление
sudo certbot renew --dry-run
```

---

## Шаг 13: Проверка работы

**Проверьте в браузере:**
- `http://ВАШ_IP_АДРЕС` — должен открыться ваш сайт
- `http://ВАШ_IP_АДРЕС/admin` — админ-панель

**Проверьте логи:**
```bash
# Логи PM2
pm2 logs nuxt-app

# Логи Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Шаг 14: Оптимизация (для экономии места)

```bash
# Удалить dev зависимости после сборки (опционально)
rm -rf .nuxt
rm -rf node_modules/.cache

# Очистить системные логи
sudo journalctl --vacuum-time=7d

# Очистить кэш пакетов
sudo apt autoremove
sudo apt autoclean
```

---

## Полезные команды

### Управление приложением
```bash
pm2 restart nuxt-app    # Перезапустить
pm2 stop nuxt-app       # Остановить
pm2 delete nuxt-app     # Удалить
pm2 logs nuxt-app       # Просмотр логов
pm2 monit               # Мониторинг
pm2 list                # Список процессов
```

### Обновление проекта
```bash
cd /var/www/mp
git pull                # Если через Git
npm install
npm run build
pm2 restart nuxt-app
```

### Проверка ресурсов
```bash
# Установить htop для мониторинга
sudo apt install -y htop

htop                    # Мониторинг ресурсов
df -h                   # Использование диска
free -h                 # Использование памяти
```

### Проверка статуса сервисов
```bash
sudo systemctl status nginx
sudo systemctl status pm2-root
pm2 status
```

---

## Решение проблем

### Приложение не запускается
```bash
# Проверить логи
pm2 logs nuxt-app --lines 50

# Проверить, что порт 3000 свободен
sudo netstat -tulpn | grep 3000

# Перезапустить PM2
pm2 restart all
```

### Nginx не работает
```bash
# Проверить конфигурацию
sudo nginx -t

# Проверить логи
sudo tail -f /var/log/nginx/error.log

# Перезапустить Nginx
sudo systemctl restart nginx
```

### Не хватает места на диске
```bash
# Проверить использование
df -h

# Найти большие файлы
du -h /var/www | sort -rh | head -20

# Очистить логи
sudo journalctl --vacuum-time=3d
```

### Проблемы с памятью
```bash
# Проверить использование памяти
free -h

# Настроить swap (если нужно)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## Безопасность

### Смена пароля root
```bash
sudo passwd root
```

### Создание нового пользователя (рекомендуется)
```bash
# Создать пользователя
sudo adduser ваш_пользователь

# Добавить в группу sudo
sudo usermod -aG sudo ваш_пользователь

# Настроить SSH ключи (безопаснее пароля)
```

### Настройка SSH (рекомендуется)
```bash
# Отредактировать конфигурацию SSH
sudo nano /etc/ssh/sshd_config

# Изменить порт (опционально)
# Port 2222

# Отключить вход по паролю (только ключи)
# PasswordAuthentication no

# Перезапустить SSH
sudo systemctl restart sshd
```

---

## Резервное копирование

### Бэкап проекта
```bash
# Создать архив проекта
tar -czf /root/backup-mp-$(date +%Y%m%d).tar.gz /var/www/mp

# Скачать на локальный компьютер
scp root@ВАШ_IP:/root/backup-mp-*.tar.gz ./
```

### Бэкап конфигурации
```bash
# Бэкап Nginx конфигурации
sudo tar -czf /root/nginx-config-backup.tar.gz /etc/nginx/sites-available/

# Бэкап PM2 конфигурации
pm2 save
```

---

## Мониторинг

### Установка мониторинга (опционально)
```bash
# PM2 Plus (облачный мониторинг)
pm2 link

# Или локальный мониторинг
pm2 install pm2-logrotate
```

---

## Контакты и поддержка

Если возникли проблемы:
1. Проверьте логи: `pm2 logs nuxt-app`
2. Проверьте статус сервисов: `sudo systemctl status nginx`
3. Проверьте использование ресурсов: `htop`

---

**Последнее обновление:** 2025-01-08
