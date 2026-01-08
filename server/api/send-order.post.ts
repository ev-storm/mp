export default defineEventHandler(async (event) => {
  if (event.node.req.method !== "POST") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed",
    });
  }

  try {
    const body = await readBody(event);
    const {
      productType,
      printType,
      options,
      designActive,
      designPrice,
      macketFileName,
      contact,
      totalPrice,
    } = body;

    if (!contact?.phone) {
      throw createError({
        statusCode: 400,
        statusMessage: "Телефон обязателен для заполнения",
      });
    }

    const config = useRuntimeConfig();
    const BOT_TOKEN = config.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = config.telegramChatId || process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      throw createError({
        statusCode: 500,
        statusMessage: "Конфигурация Telegram не настроена. Установите TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в .env файле.",
      });
    }

    let message = `🛒 <b>Новый заказ с сайта</b>\n\n`;
    message += `📦 <b>Тип продукта:</b> ${productType || "Не указано"}\n`;
    if (printType) {
      message += `🖨️ <b>Тип печати:</b> ${printType}\n`;
    }
    message += `\n👤 <b>Контактные данные:</b>\n`;
    message += `📞 <b>Телефон:</b> ${contact.phone}\n`;
    if (contact.name) {
      message += `👤 <b>Имя:</b> ${contact.name}\n`;
    }
    if (contact.email) {
      message += `✉️ <b>Email:</b> ${contact.email}\n`;
    }

    if (options && options.length > 0) {
      message += `\n⚙️ <b>Параметры заказа:</b>\n`;
      options.forEach((opt: any) => {
        if (opt.value !== null && opt.value !== "") {
          message += `• ${opt.label}: ${opt.value}`;
          if (opt.price > 0) {
            message += ` (${opt.price} ₽)`;
          }
          message += `\n`;
        }
      });
    }

    if (designActive) {
      message += `\n🎨 <b>Заказать дизайн:</b> Да`;
      if (designPrice > 0) {
        message += ` (${designPrice} ₽)`;
      }
      message += `\n`;
    }

    if (macketFileName) {
      message += `\n📎 <b>Прикреплен файл макета:</b> ${macketFileName}\n`;
    }

    message += `\n💰 <b>Итого:</b> ${totalPrice.toLocaleString("ru-RU")} ₽`;

    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error("Telegram API error:", data);
      throw createError({
        statusCode: 500,
        statusMessage: "Ошибка отправки заказа в Telegram",
      });
    }

    return {
      success: true,
      message: "Заказ успешно отправлен",
    };
  } catch (error: any) {
    console.error("Error sending order to Telegram:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Внутренняя ошибка сервера",
    });
  }
});

