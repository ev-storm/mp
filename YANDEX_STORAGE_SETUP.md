# Настройка Yandex Object Storage для загрузки изображений

## Шаги настройки:

### 1. Создание бакета в Yandex Object Storage

1. Войдите в [Yandex Cloud Console](https://console.cloud.yandex.ru/)
2. Перейдите в раздел **Object Storage**
3. Нажмите **Создать бакет**
4. Укажите уникальное имя бакета (например: `my-site-images`)
5. Выберите регион (например: `ru-central1`)
6. Настройте публичный доступ:
   - Откройте настройки бакета
   - В разделе **Публичный доступ** установите **Публичный бакет**
   - Или настройте CORS политику для вашего домена

### 2. Создание статического ключа доступа

1. В Yandex Cloud Console перейдите в **IAM** → **Service accounts**
2. Создайте новый сервисный аккаунт или выберите существующий
3. Нажмите на сервисный аккаунт → **Keys** → **Create new key** → **Create static access key**
4. Сохраните:
   - **Key ID** (access_key_id)
   - **Secret** (secret_access_key)

### 3. Настройка переменных окружения

Добавьте следующие переменные в ваш `.env` файл:

```env
# Yandex Object Storage
YANDEX_STORAGE_ENDPOINT=https://storage.yandexcloud.net
YANDEX_STORAGE_REGION=ru-central1
YANDEX_STORAGE_BUCKET=your-bucket-name
YANDEX_STORAGE_ACCESS_KEY_ID=your-access-key-id
YANDEX_STORAGE_SECRET_ACCESS_KEY=your-secret-access-key
```

### 4. Установка зависимостей

Установите необходимые пакеты:

```bash
npm install @aws-sdk/client-s3
```

### 5. Настройка прав доступа

Убедитесь, что сервисный аккаунт имеет права:

- `storage.upload`
- `storage.buckets.get`
- `storage.objects.get`

Вы можете назначить роль `storage.editor` для полного доступа к хранилищу.

### 6. Настройка CORS (опционально)

Если вам нужен доступ к изображениям с других доменов, настройте CORS в настройках бакета:

```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

### 7. Проверка работы

После настройки:

1. Запустите сервер разработки: `npm run dev`
2. Войдите в админ-панель
3. Попробуйте загрузить изображение для любой страницы
4. Проверьте, что изображение отображается на странице

### Важно для статического хостинга

**Проблема**: При сборке статического сайта (`npm run generate`) API endpoints не работают.

**Текущее решение**:
Код автоматически определяет недоступность API endpoint (ошибка 404) и сохраняет изображение как base64 в localStorage. Это работает для статического хостинга, но изображения будут храниться локально в браузере.

**Для полной интеграции с Yandex Object Storage**:

1. **Вариант 1: SSR режим (рекомендуется)**

   - Разверните Nuxt в режиме SSR (не статический)
   - API endpoints будут работать на сервере
   - Изображения будут загружаться в Yandex Object Storage

2. **Вариант 2: Yandex Cloud Function**

   - Создайте отдельную Cloud Function для загрузки изображений
   - Обновите код в `pages/admin/index.vue` для использования функции вместо `/api/admin/upload-image`

3. **Вариант 3: Внешний API сервис**
   - Используйте отдельный сервис для загрузки изображений
   - Например: Cloudinary, Imgur, или собственный API сервер

**Если вы используете статический хостинг** (`npm run generate`):

- API endpoint `/api/admin/upload-image` не будет работать
- Изображения будут сохраняться как base64 в localStorage (fallback)
- Это работает, но изображения не будут синхронизироваться между устройствами

### Альтернативное решение для статического хостинга

Если нужна работа на статическом хостинге, можно:

1. Создать отдельный сервис/функцию для загрузки изображений
2. Использовать прямой клиентский доступ к Yandex Object Storage через presigned URLs
3. Или использовать другой сервис хранения (например, Cloudinary, Imgur)

## Структура файлов в хранилище

Изображения будут сохраняться в следующей структуре:

```
bucket/
  └── images/
      ├── tracing-1234567890.png
      ├── visit-card-laser-1234567891.jpg
      └── ...
```

Формат имени файла: `images/{pageKey}-{timestamp}.{extension}`
