// Код для Yandex Cloud Function
// Обрабатывает оба типа запросов: контактная форма и форма заказа

module.exports.handler = async function (event, context) {
  // Разрешаем CORS
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Обработка preflight запросов
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  try {
    // Парсим тело запроса
    let body;
    try {
      body =
        typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    } catch (e) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: "Неверный формат данных",
        }),
      };
    }

    // Получаем токен и chat ID из переменных окружения
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: "Конфигурация Telegram не настроена",
        }),
      };
    }

    let message = "";
    let isValid = false;

    // Функция для отправки файла в Telegram через sendDocument
    const sendFileToTelegram = async (fileBase64, fileName, mimeType) => {
      if (!fileBase64 || !fileName) return null;

      try {
        // Конвертируем base64 в Buffer
        const fileBuffer = Buffer.from(fileBase64, "base64");

        // Создаем multipart/form-data вручную
        const boundary =
          "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
        const formDataParts = [];

        // Добавляем chat_id
        formDataParts.push(`--${boundary}`);
        formDataParts.push(`Content-Disposition: form-data; name="chat_id"`);
        formDataParts.push("");
        formDataParts.push(CHAT_ID);

        // Добавляем файл
        formDataParts.push(`--${boundary}`);
        formDataParts.push(
          `Content-Disposition: form-data; name="document"; filename="${fileName}"`
        );
        formDataParts.push(`Content-Type: ${mimeType || "application/pdf"}`);
        formDataParts.push("");

        // Собираем multipart body
        const textParts = formDataParts.join("\r\n") + "\r\n";
        const bodyBuffer = Buffer.concat([
          Buffer.from(textParts, "utf8"),
          fileBuffer,
          Buffer.from(`\r\n--${boundary}--\r\n`, "utf8"),
        ]);

        // Отправляем файл в Telegram
        const telegramFileUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`;

        const fileResponse = await fetch(telegramFileUrl, {
          method: "POST",
          headers: {
            "Content-Type": `multipart/form-data; boundary=${boundary}`,
          },
          body: bodyBuffer,
        });

        const fileData = await fileResponse.json();

        if (!fileResponse.ok || !fileData.ok) {
          console.error("Telegram file upload error:", fileData);
          return false;
        }

        return true;
      } catch (error) {
        console.error("Error sending file to Telegram:", error);
        return false;
      }
    };

    // Определяем тип запроса по наличию полей
    // Если есть productType - это заказ, иначе - контактная форма
    if (body.productType) {
      // Обработка формы заказа
      if (!body.contact?.phone) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: "Телефон обязателен для заполнения",
          }),
        };
      }

      message = `🛒 <b>Новый заказ с сайта</b>\n\n`;
      message += `📦 <b>Тип продукта:</b> ${
        body.productType || "Не указано"
      }\n`;

      if (body.printType) {
        message += `🖨️ <b>Тип печати:</b> ${body.printType}\n`;
      }

      message += `\n👤 <b>Контактные данные:</b>\n`;
      message += `📞 <b>Телефон:</b> ${body.contact.phone}\n`;

      if (body.contact.name) {
        message += `👤 <b>Имя:</b> ${body.contact.name}\n`;
      }

      if (body.contact.email) {
        message += `✉️ <b>Email:</b> ${body.contact.email}\n`;
      }

      if (body.options && body.options.length > 0) {
        message += `\n⚙️ <b>Параметры заказа:</b>\n`;
        body.options.forEach((opt) => {
          if (opt.value !== null && opt.value !== "") {
            message += `• ${opt.label}: ${opt.value}`;
            if (opt.price > 0) {
              message += ` (${opt.price} ₽)`;
            }
            message += `\n`;
          }
        });
      }

      if (body.designActive) {
        message += `\n🎨 <b>Заказать дизайн:</b> Да`;
        if (body.designPrice > 0) {
          message += ` (${body.designPrice} ₽)`;
        }
        message += `\n`;
      }

      // Отправляем файл макета, если он есть
      if (body.macketFileBase64 && body.macketFileName) {
        const fileSent = await sendFileToTelegram(
          body.macketFileBase64,
          body.macketFileName,
          body.macketFileMimeType
        );
        if (fileSent) {
          message += `\n📎 <b>Файл макета отправлен:</b> ${body.macketFileName}\n`;
        } else {
          message += `\n📎 <b>Файл макета:</b> ${body.macketFileName} (ошибка отправки)\n`;
        }
      } else if (body.macketFileName) {
        message += `\n📎 <b>Указан файл макета:</b> ${body.macketFileName}\n`;
      }

      if (body.totalPrice) {
        const totalPrice =
          typeof body.totalPrice === "number"
            ? body.totalPrice
            : body.totalPrice.value || body.totalPrice;
        message += `\n💰 <b>Итого:</b> ${totalPrice.toLocaleString("ru-RU")} ₽`;
      }

      isValid = true;
    } else {
      // Обработка контактной формы
      if (!body.phone) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: "Телефон обязателен для заполнения",
          }),
        };
      }

      message = `📧 <b>Новое сообщение с сайта</b>\n\n`;
      message += `👤 <b>Имя:</b> ${body.name || "Не указано"}\n`;
      message += `📞 <b>Телефон:</b> ${body.phone}\n`;

      if (body.email) {
        message += `✉️ <b>Email:</b> ${body.email}\n`;
      }

      if (body.comment) {
        message += `\n💬 <b>Комментарий:</b>\n${body.comment}\n`;
      }

      // Отправляем файл, если он есть
      if (body.fileBase64 && body.fileName) {
        const fileSent = await sendFileToTelegram(
          body.fileBase64,
          body.fileName,
          body.fileMimeType
        );
        if (fileSent) {
          message += `\n📎 <b>Файл отправлен:</b> ${body.fileName}`;
        } else {
          message += `\n📎 <b>Файл:</b> ${body.fileName} (ошибка отправки)`;
        }
      } else if (body.fileName) {
        message += `\n📎 <b>Указан файл:</b> ${body.fileName}`;
      }

      isValid = true;
    }

    if (!isValid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: "Неверный формат запроса",
        }),
      };
    }

    // Отправляем сообщение в Telegram
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
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: "Ошибка отправки сообщения в Telegram",
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Сообщение успешно отправлено",
      }),
    };
  } catch (error) {
    console.error("Error in function:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: error.message || "Внутренняя ошибка сервера",
      }),
    };
  }
};
