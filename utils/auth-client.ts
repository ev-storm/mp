// Утилиты для клиентской аутентификации (для статического хостинга)
// ⚠️ ВНИМАНИЕ: Это решение работает на статическом хостинге, но менее безопасно, чем серверная аутентификация
// Пароль хешируется на клиенте, хеш виден в коде. Используйте только для простых админ-панелей.

/**
 * Хеширует строку с помощью SHA-256
 * Использует Web Crypto API (crypto.subtle) если доступен (требует HTTPS),
 * иначе использует crypto-js как fallback (работает на HTTP)
 */
export async function hashString(str: string): Promise<string> {
  // Проверяем доступность crypto.subtle
  if (typeof window === "undefined") {
    throw new Error("hashString может использоваться только на клиенте");
  }

  // Пытаемся использовать Web Crypto API (работает только на HTTPS)
  const crypto = window.crypto;
  const subtle = crypto?.subtle;

  if (subtle && typeof subtle.digest === "function") {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await subtle.digest("SHA-256", data);

      if (!hashBuffer) {
        throw new Error("Ошибка: hashBuffer пустой");
      }

      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (error) {
      // Если crypto.subtle не работает, используем fallback
      // Продолжаем выполнение ниже
    }
  }

  // Fallback: используем crypto-js (работает на HTTP и HTTPS)
  // Используем динамический импорт для SSR совместимости
  try {
    const CryptoJS = await import("crypto-js");
    const hash = CryptoJS.default.SHA256(str);
    return hash.toString(CryptoJS.default.enc.Hex);
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    throw new Error(`Ошибка хеширования: ${errorMsg}`);
  }
}

/**
 * Генерирует токен аутентификации на основе пароля и времени
 */
export async function generateAuthToken(
  password: string,
  secretKey: string
): Promise<string> {
  const timestamp = Math.floor(Date.now() / (1000 * 60 * 60)); // Округляем до часа
  const data = `${secretKey}-${password}-${timestamp}`;
  return await hashString(data);
}

/**
 * Проверяет пароль, сравнивая его хеш с ожидаемым хешем
 */
export async function verifyPassword(
  inputPassword: string,
  expectedPasswordHash: string
): Promise<boolean> {
  const inputHash = await hashString(inputPassword);
  return inputHash === expectedPasswordHash;
}

/**
 * Проверяет валидность токена
 */
export async function validateToken(
  token: string,
  password: string,
  secretKey: string
): Promise<boolean> {
  // Проверяем токен для текущего часа и предыдущего часа (на случай смены часа)
  const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));
  const previousHour = currentHour - 1;

  for (const hour of [currentHour, previousHour]) {
    const expectedToken = await hashString(`${secretKey}-${password}-${hour}`);
    if (token === expectedToken) {
      return true;
    }
  }

  return false;
}

/**
 * Сохраняет токен в localStorage
 */
export function saveToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("admin-auth-token", token);
    // Также сохраняем время создания токена
    localStorage.setItem("admin-auth-token-time", Date.now().toString());
  }
}

/**
 * Получает токен из localStorage
 */
export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("admin-auth-token");
  }
  return null;
}

/**
 * Удаляет токен из localStorage
 */
export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("admin-auth-token");
    localStorage.removeItem("admin-auth-token-time");
  }
}

/**
 * Проверяет, не истек ли токен (максимум 24 часа)
 */
export function isTokenExpired(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  const tokenTime = localStorage.getItem("admin-auth-token-time");
  if (!tokenTime) {
    return true;
  }

  const tokenTimestamp = parseInt(tokenTime, 10);
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 часа

  return now - tokenTimestamp > maxAge;
}

/**
 * Защита от брутфорса: проверка и увеличение счетчика неудачных попыток
 */
export function checkBruteForceProtection(): {
  allowed: boolean;
  remainingAttempts: number;
  lockoutTime: number | null;
} {
  if (typeof window === "undefined") {
    return { allowed: false, remainingAttempts: 0, lockoutTime: null };
  }

  const maxAttempts = 100;
  const lockoutDuration = 100 * 60 * 1000;
  const storageKey = "admin-login-attempts";
  const lockoutKey = "admin-login-lockout";

  // Проверяем блокировку
  const lockoutTime = localStorage.getItem(lockoutKey);
  if (lockoutTime) {
    const lockoutTimestamp = parseInt(lockoutTime, 10);
    const now = Date.now();
    const remainingLockout = lockoutTimestamp + lockoutDuration - now;

    if (remainingLockout > 0) {
      return {
        allowed: false,
        remainingAttempts: 0,
        lockoutTime: remainingLockout,
      };
    } else {
      // Блокировка истекла, очищаем
      localStorage.removeItem(lockoutKey);
      localStorage.removeItem(storageKey);
    }
  }

  // Проверяем количество попыток
  const attemptsData = localStorage.getItem(storageKey);
  if (!attemptsData) {
    return { allowed: true, remainingAttempts: maxAttempts, lockoutTime: null };
  }

  const attempts = JSON.parse(attemptsData);
  const now = Date.now();
  const attemptWindow = 5 * 60 * 1000; // 5 минут окно для попыток

  // Удаляем старые попытки (старше 5 минут)
  const recentAttempts = attempts.filter(
    (timestamp: number) => now - timestamp < attemptWindow
  );

  if (recentAttempts.length >= maxAttempts) {
    // Превышен лимит, устанавливаем блокировку
    localStorage.setItem(lockoutKey, now.toString());
    localStorage.setItem(storageKey, JSON.stringify(recentAttempts));
    return {
      allowed: false,
      remainingAttempts: 0,
      lockoutTime: lockoutDuration,
    };
  }

  return {
    allowed: true,
    remainingAttempts: maxAttempts - recentAttempts.length,
    lockoutTime: null,
  };
}

/**
 * Регистрирует неудачную попытку входа
 */
export function recordFailedAttempt(): void {
  if (typeof window === "undefined") {
    return;
  }

  const storageKey = "admin-login-attempts";
  const attemptsData = localStorage.getItem(storageKey);
  const attempts = attemptsData ? JSON.parse(attemptsData) : [];
  attempts.push(Date.now());
  localStorage.setItem(storageKey, JSON.stringify(attempts));
}

/**
 * Очищает счетчик неудачных попыток (при успешном входе)
 */
export function clearFailedAttempts(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("admin-login-attempts");
    localStorage.removeItem("admin-login-lockout");
  }
}
