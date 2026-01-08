# Миграция на SSR сервер - Выполнено ✅

## Что было сделано

### Этап 1: Авторизация админа ✅

**Изменения:**
- ✅ `pages/admin/login.vue` - переписан для использования серверного endpoint `/api/admin/login`
- ✅ `middleware/admin-auth.ts` - обновлен для проверки cookies через `/api/admin/check`
- ✅ `pages/admin/index.vue` - убрано использование `utils/auth-client.ts`, используется серверный endpoint `/api/admin/logout`
- ✅ `nuxt.config.ts` - убраны клиентские переменные авторизации (`adminPasswordHash`, `adminSecretKey` из public)

**Результат:**
- Авторизация теперь работает через серверные cookies
- Нет зависимости от клиентской авторизации
- Более безопасно (пароль не проверяется на клиенте)

---

### Этап 2: Telegram бот ✅

**Изменения:**
- ✅ `config/telegram.ts` - обновлен для использования серверных endpoints (`/api/send-telegram`, `/api/send-order`)
- ✅ `components/ContactModal.vue` - использует `/api/send-telegram`
- ✅ `composables/useOrderSubmit.ts` - использует `/api/send-order`
- ✅ `server/api/send-telegram.post.ts` - обновлен для использования `runtimeConfig`
- ✅ `server/api/send-order.post.ts` - обновлен для использования `runtimeConfig`
- ✅ `nuxt.config.ts` - убран `telegramApiUrl` из public config, добавлены `telegramBotToken` и `telegramChatId` в server config

**Результат:**
- Telegram работает через серверные endpoints
- Нет зависимости от Yandex Cloud Functions
- Все работает на одном сервере

---

### Этап 3: Сохранение конфигурации ✅

**Изменения:**
- ✅ `pages/admin/index.vue` - `saveConfig()` теперь сохраняет через `/api/order-fields-config` (POST)
- ✅ `pages/admin/index.vue` - `loadConfig()` теперь загружает с сервера через `/api/order-fields-config` (GET)
- ✅ localStorage используется как fallback/кэш
- ✅ Приоритет: сервер → localStorage

**Результат:**
- Конфигурация сохраняется на сервере в `data/order-fields-config.json`
- Работает на всех устройствах/браузерах
- localStorage используется как кэш и fallback

---

### Этап 4: Очистка конфигурации ✅

**Изменения:**
- ✅ `nuxt.config.ts` - убраны все ссылки на Yandex Cloud Functions
- ✅ Убраны клиентские переменные авторизации
- ✅ Добавлены серверные переменные для Telegram

**Результат:**
- Чистая конфигурация без зависимостей от Cloud Functions
- Все секреты только на сервере

---

## Обновление .env файла

### Что нужно добавить:

```env
# Аутентификация (только на сервере)
ADMIN_PASSWORD=ваш_пароль_админа
ADMIN_SECRET_KEY=ваш_секретный_ключ

# Telegram (только на сервере)
TELEGRAM_BOT_TOKEN=ваш_токен_бота
TELEGRAM_CHAT_ID=ваш_chat_id

# Yandex Object Storage (если используете)
YANDEX_STORAGE_ENDPOINT=https://storage.yandexcloud.net
YANDEX_STORAGE_REGION=ru-central1
YANDEX_STORAGE_BUCKET=ваш_бакет
YANDEX_STORAGE_ACCESS_KEY_ID=ваш_ключ
YANDEX_STORAGE_SECRET_ACCESS_KEY=ваш_секрет
```

### Что можно убрать (больше не нужно):

```env
# Эти переменные больше не нужны:
# ADMIN_PASSWORD_HASH - не нужен, пароль проверяется на сервере
# UPLOAD_IMAGE_API_URL - если не используете загрузку изображений
```

---

## Как получить TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID

### 1. Создать бота в Telegram:

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям и получите токен бота
4. Скопируйте токен в `TELEGRAM_BOT_TOKEN`

### 2. Получить Chat ID:

**Вариант А: Через бота @userinfobot**
1. Откройте [@userinfobot](https://t.me/userinfobot)
2. Бот покажет ваш Chat ID
3. Скопируйте ID в `TELEGRAM_CHAT_ID`

**Вариант Б: Через API**
1. Отправьте сообщение вашему боту
2. Откройте в браузере: `https://api.telegram.org/bot<ВАШ_ТОКЕН>/getUpdates`
3. Найдите `chat.id` в ответе
4. Скопируйте ID в `TELEGRAM_CHAT_ID`

---

## Проверка работы

### 1. Авторизация:
- ✅ Откройте `/admin/login`
- ✅ Введите пароль
- ✅ Должна открыться админ-панель
- ✅ Проверьте cookies в DevTools (должен быть `admin-auth-token`)

### 2. Сохранение конфигурации:
- ✅ Откройте админ-панель
- ✅ Измените поля заказа
- ✅ Нажмите "Сохранить"
- ✅ Проверьте файл `data/order-fields-config.json` на сервере

### 3. Telegram:
- ✅ Откройте форму контактов
- ✅ Отправьте сообщение
- ✅ Проверьте Telegram - должно прийти сообщение

---

## Структура файлов после миграции

```
server/
  api/
    admin/
      login.post.ts      ✅ Серверная авторизация
      logout.post.ts     ✅ Выход из системы
      check.get.ts       ✅ Проверка авторизации
    order-fields-config.get.ts   ✅ Загрузка конфигурации
    order-fields-config.post.ts  ✅ Сохранение конфигурации
    send-telegram.post.ts        ✅ Отправка сообщений
    send-order.post.ts           ✅ Отправка заказов

pages/
  admin/
    login.vue           ✅ Использует серверный endpoint
    index.vue            ✅ Сохраняет через API

config/
  telegram.ts           ✅ Использует серверные endpoints

middleware/
  admin-auth.ts         ✅ Проверяет cookies на сервере
```

---

## Что осталось (опционально)

### Можно удалить (если не нужны):
- `utils/auth-client.ts` - клиентская авторизация (больше не используется)
- `yandex-cloud-function-auth.js` - старые Cloud Functions
- `yandex-cloud-function.js` - старые Cloud Functions

### Можно оставить:
- `utils/auth-client.ts` - как fallback для оффлайн режима (но не используется)

---

## Итоговый результат

✅ **Авторизация:** Работает через серверные cookies  
✅ **Telegram:** Работает через серверные endpoints  
✅ **Конфигурация:** Сохраняется на сервере  
✅ **Нет зависимостей:** От Yandex Cloud Functions  
✅ **Все на одном сервере:** Монолитная архитектура  

---

**Дата миграции:** 2025-01-08  
**Статус:** ✅ Завершено
