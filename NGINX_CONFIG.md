# Настройка Nginx для увеличения лимита размера запроса

## Проблема

Ошибка 413 "Request Entity Too Large" возникает, когда размер запроса превышает лимит, установленный в Nginx.

## Решение

### 1. Найти конфигурационный файл Nginx для вашего сайта

Обычно находится в:

```bash
/etc/nginx/sites-available/mp
# или
/etc/nginx/conf.d/mp.conf
```

### 2. Отредактировать конфигурацию

```bash
sudo nano /etc/nginx/sites-available/mp
```

### 3. Добавить/изменить параметр `client_max_body_size`

Найдите блок `server` и добавьте или измените параметр:

```nginx
server {
    listen 80;
    server_name 95.163.232.220;  # или ваш домен

    # Увеличиваем лимит размера тела запроса до 50MB
    # Это нужно для загрузки изображений в base64
    client_max_body_size 50M;

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

        # Увеличиваем таймауты для больших запросов
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }
}
```

### 4. Проверить конфигурацию

```bash
sudo nginx -t
```

Если всё правильно, вы увидите:

```
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 5. Перезагрузить Nginx

```bash
sudo systemctl reload nginx
# или
sudo nginx -s reload
```

### 6. Проверить работу

После перезагрузки Nginx попробуйте снова сохранить конфигурацию в админ-панели.

## Альтернативное решение: глобальная настройка

Если нужно установить лимит для всех сайтов, отредактируйте основной конфиг:

```bash
sudo nano /etc/nginx/nginx.conf
```

Добавьте в блок `http`:

```nginx
http {
    # Увеличиваем лимит размера тела запроса
    client_max_body_size 50M;

    # ... остальная конфигурация
}
```

## Проверка текущего лимита

Чтобы проверить текущий лимит, выполните:

```bash
grep -r "client_max_body_size" /etc/nginx/
```

## Важно

- `50M` = 50 мегабайт
- Если нужно больше, увеличьте значение (например, `100M`)
- После изменения конфигурации всегда проверяйте её: `sudo nginx -t`
- Перезагружайте Nginx после изменений: `sudo systemctl reload nginx`
