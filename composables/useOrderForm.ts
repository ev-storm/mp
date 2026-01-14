import { reactive, computed, ref, type Ref } from "vue";
import type { OrderField } from "~/types/order-fields";
import {
  calculateTotalPrice,
  getQuantityFromFields,
} from "~/types/order-fields";

export interface OrderFormConfig {
  fields: OrderField[];
  designPrice?: number;
  productType: string;
  printType: string;
}

export function useOrderForm(config: OrderFormConfig) {
  const fields = reactive<OrderField[]>(config.fields);
  const isDesignActive = ref(false);
  const designPrice = config.designPrice ?? 1500;

  // Вычисляем общую стоимость
  const totalPrice = computed(() => {
    const quantity = getQuantityFromFields(fields);
    return calculateTotalPrice(
      fields,
      quantity,
      isDesignActive.value ? designPrice : 0
    );
  });


  

  // Файл макета
  const macketFile = ref<File | null>(null);
  const macketFileName = ref("");

  const handleFileUpload = (file: File) => {
    macketFile.value = file;
    macketFileName.value = file.name;
  };

  const removeFile = () => {
    macketFile.value = null;
    macketFileName.value = "";
  };

  // Форма заказа
  const formData = reactive({
    name: "",
    phone: "",
    email: "",
  });

  // Toast
  const showToast = ref(false);
  const toastMessage = ref("");

  const submitOrder = () => {
    // Собираем все данные заказа
    const orderData = {
      productType: config.productType,
      printType: config.printType,
      // Выбранные опции
      options: fields.map((f: OrderField) => {
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
      }),
      // Дизайн
      designActive: isDesignActive.value,
      designPrice: isDesignActive.value ? designPrice : 0,
      // Макет
      macketFile: macketFile.value,
      macketFileName: macketFileName.value || null,
      // Контактные данные
      contact: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
      },
      // Итоговая цена
      totalPrice: totalPrice.value,
    };

    console.log("Order data:", orderData);

    // TODO: отправка данных на сервер

    // Показываем уведомление
    toastMessage.value = "Заказ отправлен!";
    showToast.value = true;
  };

  return {
    fields,
    isDesignActive,
    designPrice,
    totalPrice,
    macketFile,
    macketFileName,
    handleFileUpload,
    removeFile,
    formData,
    showToast,
    toastMessage,
    submitOrder,
  };
}

