# Настройка переменных окружения на сервере

## Проблема: Ошибка 500 при авторизации

Если вы видите ошибку:
```
Failed to load resource: the server responded with a status of 500
ADMIN_PASSWORD ADMIN_SECRET_KEY .env
```

Это означает, что переменные окружения не настроены или не загружаются правильно.

---

## Решение

### 1. Создайте/обновите `.env` файл на сервере

**На сервере выполните:**
```bash
cd /var/www/mp
nano .env
```

**Добавьте в файл:**
```env
# Аутентификация админ-панели
ADMIN_PASSWORD=ваш_пароль_админа
ADMIN_SECRET_KEY=ваш_секретный_ключ

# Telegram бот (опционально, но рекомендуется)
TELEGRAM_BOT_TOKEN=ваш_токен_бота
TELEGRAM_CHAT_ID=ваш_chat_id
```

**Важно:**
- Не используйте кавычки вокруг значений
- Не добавляйте пробелы вокруг `=`
- Каждое значение на новой строке

**Пример правильного формата:**
```env
ADMIN_PASSWORD=mypassword123
ADMIN_SECRET_KEY=mysecretkey456
```

**Пример неправильного формата:**
```env
ADMIN_PASSWORD = "mypassword123"  # ❌ Пробелы и кавычки
ADMIN_PASSWORD="mypassword123"    # ❌ Кавычки
ADMIN_PASSWORD = mypassword123    # ❌ Пробелы
```

---

### 2. Проверьте права доступа к файлу

```bash
# Убедитесь, что файл существует
ls -la /var/www/mp/.env

# Если файла нет, создайте его
touch /var/www/mp/.env
chmod 600 /var/www/mp/.env  # Только владелец может читать/писать
```

---

### 3. Перезапустите приложение

**После изменения `.env` файла ОБЯЗАТЕЛЬНО перезапустите приложение:**

```bash
# Перезапустить PM2
pm2 restart nuxt-app

# Или остановить и запустить заново
pm2 stop nuxt-app
pm2 start .output/server/index.mjs --name "nuxt-app"
pm2 save
```

**Важно:** Nuxt загружает переменные окружения только при старте. После изменения `.env` нужно перезапустить!

---

### 4. Проверьте, что переменные загружаются

**Создайте тестовый endpoint для проверки (временно):**

```bash
# Создайте файл для проверки
nano /var/www/mp/server/api/test-env.get.ts
```

**Содержимое:**
```typescript
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  return {
    adminPassword: config.adminPassword ? "установлен" : "НЕ УСТАНОВЛЕН",
    adminSecretKey: config.adminSecretKey ? "установлен" : "НЕ УСТАНОВЛЕН",
    telegramBotToken: config.telegramBotToken ? "установлен" : "НЕ УСТАНОВЛЕН",
    processEnv: {
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? "есть" : "нет",
      ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY ? "есть" : "нет",
    }
  };
});
```

**Проверьте в браузере:**
```
http://ВАШ_IP/api/test-env
```

**После проверки удалите файл:**
```bash
rm /var/www/mp/server/api/test-env.get.ts
pm2 restart nuxt-app
```

---

### 5. Проверьте логи

**Если проблема сохраняется, проверьте логи:**

```bash
# Логи PM2
pm2 logs nuxt-app --lines 50

# Ищите ошибки связанные с:
# - ADMIN_PASSWORD
# - ADMIN_SECRET_KEY
# - .env
```

---

## Частые ошибки

### Ошибка 1: Файл `.env` в неправильной директории

**Проблема:** Файл `.env` должен быть в корне проекта, где находится `nuxt.config.ts`

**Решение:**
```bash
# Убедитесь, что вы в правильной директории
cd /var/www/mp
ls -la .env  # Должен показать файл
```

---

### Ошибка 2: Неправильный формат `.env`

**Проблема:** Пробелы, кавычки, комментарии на той же строке

**Правильно:**
```env
ADMIN_PASSWORD=mypassword
ADMIN_SECRET_KEY=mysecret
```

**Неправильно:**
```env
ADMIN_PASSWORD = mypassword  # Пробелы
ADMIN_PASSWORD="mypassword"  # Кавычки
ADMIN_PASSWORD=mypassword # комментарий  # Комментарий на той же строке
```

---

### Ошибка 3: Не перезапустили приложение

**Проблема:** Изменили `.env`, но не перезапустили PM2

**Решение:**
```bash
pm2 restart nuxt-app
```

---

### Ошибка 4: Переменные не видны в runtimeConfig

**Проблема:** Nuxt не загружает переменные из `.env`

**Решение:**
1. Убедитесь, что файл называется именно `.env` (с точкой в начале)
2. Убедитесь, что файл в корне проекта
3. Перезапустите приложение
4. Проверьте, что переменные указаны в `nuxt.config.ts` в `runtimeConfig`

---

## Быстрая проверка

**Выполните на сервере:**
```bash
cd /var/www/mp

# 1. Проверьте наличие .env
ls -la .env

# 2. Проверьте содержимое (НЕ показывайте пароли в логах!)
cat .env | grep -E "ADMIN_PASSWORD|ADMIN_SECRET_KEY"

# 3. Перезапустите приложение
pm2 restart nuxt-app

# 4. Проверьте логи
pm2 logs nuxt-app --lines 20
```

---

## После настройки

После правильной настройки `.env` и перезапуска:
1. Откройте `/admin/login`
2. Введите пароль из `ADMIN_PASSWORD`
3. Должна открыться админ-панель

---

**Если проблема сохраняется:**
1. Проверьте логи: `pm2 logs nuxt-app`
2. Проверьте формат `.env` файла
3. Убедитесь, что перезапустили приложение
4. Проверьте права доступа к файлу: `chmod 600 .env`
