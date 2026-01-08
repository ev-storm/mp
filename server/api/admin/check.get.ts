import { createHash } from "crypto";

export default defineEventHandler(async (event) => {
  try {
    const authToken = getCookie(event, "admin-auth-token");

    if (!authToken) {
      return {
        authenticated: false,
      };
    }

    const config = useRuntimeConfig();
    const adminSecretKey =
      config.adminSecretKey || (process.env as any).ADMIN_SECRET_KEY;

    if (!adminSecretKey) {
      return {
        authenticated: false,
      };
    }

    // Проверяем валидность токена
    const expectedToken = createHash("sha256")
      .update(adminSecretKey + "-admin")
      .digest("hex");

    const isValid = authToken === expectedToken;

    return {
      authenticated: isValid,
    };
  } catch (error: any) {
    return {
      authenticated: false,
    };
  }
});
