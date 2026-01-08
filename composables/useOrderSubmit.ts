import { ref } from "vue";
import type { OrderField } from "~/types/order-fields";

interface OrderSubmitOptions {
  productType: string;
  printType?: string;
  fields: OrderField[];
  isDesignActive: boolean;
  designPrice: number;
  macketFileName: string;
  macketFile?: File | null;
  formData: {
    name: string;
    phone: string;
    email: string;
  };
  totalPrice: number | { value: number };
}

export const useOrderSubmit = () => {
  const showToast = ref(false);
  const toastMessage = ref("");

  const closeToast = () => {
    showToast.value = false;
  };

  const submitOrder = async (options: OrderSubmitOptions) => {
    if (!options.formData.phone) {
      toastMessage.value = "Пожалуйста, заполните телефон";
      showToast.value = true;
      return false;
    }

    try {
      // Преобразуем поля в формат для отправки
      const optionsData = options.fields.map((f: OrderField) => {
        let displayValue: string | null = null;
        let price = 0;

        switch (f.type) {
          case "dropdown":
            displayValue = f.value?.label || null;
            price = f.value?.price || 0;
            break;
          case "toggle":
            displayValue = f.value ? "Да" : "Нет";
            price = f.value ? f.price : 0;
            break;
          case "input":
            displayValue = f.value !== null ? String(f.value) : null;
            break;
        }

        return {
          id: f.id,
          label: f.label,
          value: displayValue,
          price,
        };
      });

      // Конвертируем файл макета в base64, если он есть
      let macketFileBase64 = null;
      let macketFileMimeType = null;

      if (options.macketFile) {
        macketFileMimeType = options.macketFile.type;
        macketFileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            // Убираем префикс "data:application/pdf;base64," или другой
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(options.macketFile!);
        });
      }

      const orderData = {
        productType: options.productType,
        printType: options.printType || null,
        options: optionsData,
        designActive: options.isDesignActive,
        designPrice: options.isDesignActive ? options.designPrice : 0,
        macketFileName: options.macketFileName || null,
        macketFileBase64: macketFileBase64,
        macketFileMimeType: macketFileMimeType,
        contact: {
          name: options.formData.name,
          phone: options.formData.phone,
          email: options.formData.email,
        },
        totalPrice:
          typeof options.totalPrice === "object" && "value" in options.totalPrice
            ? options.totalPrice.value
            : options.totalPrice,
      };

      // Используем серверный endpoint для отправки заказов
      const { ORDER_API_URL } = await import('~/config/telegram');
      const apiUrl = ORDER_API_URL;

      if (!apiUrl) {
        throw new Error("API URL не настроен");
      }

      const response = await $fetch(apiUrl, {
        method: "POST",
        body: orderData,
      });

      if (response.success) {
        toastMessage.value = "Заказ отправлен!";
        showToast.value = true;
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error submitting order:", error);
      const errorMessage =
        error?.data?.statusMessage ||
        error?.statusMessage ||
        error?.message ||
        "Произошла ошибка при отправке заказа";
      toastMessage.value = errorMessage;
      showToast.value = true;
      return false;
    }
  };

  return {
    showToast,
    toastMessage,
    closeToast,
    submitOrder,
  };
};

