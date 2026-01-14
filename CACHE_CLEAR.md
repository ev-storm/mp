# Инструкция по очистке кеша на сервере

## Проблема с toggle, отображающимся как dropdown

Если на сервере toggle поля отображаются как dropdown, это может быть связано с:
1. Старым билдом проекта (кеш Nuxt)
2. Неправильными данными в `data/order-fields-config.json`
3. Кешем браузера пользователей

## Решение: Очистка кеша и пересборка

### Шаг 1: Подключитесь к серверу

```bash
ssh root@ваш_сервер_ip
cd /var/www/mp
```

### Шаг 2: Остановите PM2

```bash
pm2 stop nuxt-app
# или
pm2 stop all
```

### Шаг 3: Очистите кеш Nuxt

```bash
# Удалите директории кеша и билда
rm -rf .output
rm -rf .nuxt
rm -rf .cache
rm -rf node_modules/.cache
```

### Шаг 4: Очистите npm кеш (опционально)

```bash
npm cache clean --force
```

### Шаг 5: Проверьте данные в конфигурации

Убедитесь, что в `data/order-fields-config.json` поле "Биговка" имеет правильный тип:

```bash
# Проверьте тип поля "Биговка" для booklet-laser
cat data/order-fields-config.json | grep -A 5 "Биговка" | grep -A 5 "booklet-laser"

# Должно быть:
# "type": "toggle"
# НЕ "type": "dropdown"
```

Если тип неправильный, исправьте в файле или через админ-панель.

### Шаг 6: Пересоберите проект

```bash
# Убедитесь, что зависимости установлены
npm install

# Соберите проект заново
npm run build
```

### Шаг 7: Проверьте сборку

```bash
# Убедитесь, что директория .output создана
ls -la .output

# Проверьте структуру
ls -la .output/server
```

### Шаг 8: Перезапустите PM2

```bash
pm2 restart nuxt-app
# или
pm2 start .output/server/index.mjs --name nuxt-app
```

### Шаг 9: Проверьте логи

```bash
pm2 logs nuxt-app --lines 50
```

## Дополнительно: Очистка кеша браузера пользователей

Если проблема сохраняется, возможно, данные кешируются в localStorage браузера. 

**Важно:** localStorage очищается только на клиенте. Но если на сервере данные исправлены, они должны загружаться через API.

## Быстрая команда (все сразу)

```bash
cd /var/www/mp && \
pm2 stop nuxt-app && \
rm -rf .output .nuxt .cache node_modules/.cache && \
npm cache clean --force && \
npm install && \
npm run build && \
pm2 restart nuxt-app && \
pm2 logs nuxt-app --lines 20
```

## Проверка типизации

Типы строго определены в TypeScript:
- `DropdownField` имеет `type: "dropdown"`
- `ToggleField` имеет `type: "toggle"`
- `InputField` имеет `type: "input"`

Но во время выполнения данные приходят из JSON, который не валидируется автоматически. Если в JSON указан неправильный тип, TypeScript не может это предотвратить.

## Проверка данных через API

Можно проверить данные, которые возвращает API:

```bash
curl http://localhost:3000/api/order-fields-config | jq '.data["booklet-laser"]' | grep -A 10 "Биговка"
```

Или через браузер:
```
http://ваш_сервер/api/order-fields-config
```
