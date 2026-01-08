// Скрипт для генерации хеша пароля
// Использование: node scripts/generate-password-hash.js <пароль> <секретный-ключ>

import crypto from "crypto";

const password = process.argv[2];
const secretKey = process.argv[3];

if (!password || !secretKey) {
  console.error("");
  process.exit(1);
}

// Генерируем хеш пароля (SHA-256)
const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
