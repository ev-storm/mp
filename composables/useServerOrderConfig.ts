import { reactive, ref, onMounted, type Ref } from "vue";
import type { OrderField } from "~/types/order-fields";
import type { PageConfigKey, PageMeta } from "~/config/order-fields-config";
import { getOrderFieldsConfigSync } from "~/config/order-fields-config";

interface UseServerOrderConfigOptions {
  pageKey: PageConfigKey;
  defaultImage: string;
  defaultDescription?: string;
  defaultShowMacketButton?: boolean;
  defaultShowDesignButton?: boolean;
}

export function useServerOrderConfig(options: UseServerOrderConfigOptions) {
  const { pageKey, defaultImage, defaultDescription = "", defaultShowMacketButton = true, defaultShowDesignButton = true } =
    options;

  // Поля: начинаем с дефолтной конфигурации из кода
  const fields = reactive<OrderField[]>(getOrderFieldsConfigSync(pageKey));

  // Метаданные страницы
  const productionDays = ref<number | undefined>(1);
  const pageImage = ref<string>(defaultImage);
  const pageDescription = ref<string>(defaultDescription);
  const showMacketButton = ref<boolean>(defaultShowMacketButton);
  const showDesignButton = ref<boolean>(defaultShowDesignButton);
  const pageExamples = ref<string[]>([]);

  const loading = ref(false);
  const error: Ref<string | null> = ref(null);

  const applyMeta = (meta: PageMeta | undefined | null) => {
    if (!meta || typeof meta !== "object") return;

    const newProductionDays = meta.productionDays ?? 1;
    const newImage = meta.imageUrl || defaultImage;
    const newDescription = meta.description || defaultDescription;
    const newShowMacketButton =
      meta.showMacketButton ?? defaultShowMacketButton;
    const newShowDesignButton =
      meta.showDesignButton ?? defaultShowDesignButton;
    const newExamples = meta.examples || [];

    productionDays.value = newProductionDays;
    pageImage.value = newImage;
    pageDescription.value = newDescription;
    showMacketButton.value = newShowMacketButton;
    showDesignButton.value = newShowDesignButton;
    pageExamples.value = newExamples;
  };

  const loadFromServer = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch<{
        success: boolean;
        data?: Record<PageConfigKey, OrderField[]>;
        meta?: Record<PageConfigKey, PageMeta>;
      }>("/api/order-fields-config");

      if (response.success) {
        // Обновляем поля
        const serverConfig = response.data?.[pageKey];
        if (Array.isArray(serverConfig)) {
          fields.splice(0, fields.length, ...serverConfig);
        }

        // Обновляем метаданные
        const serverMeta = response.meta?.[pageKey];
        if (serverMeta) {
          applyMeta(serverMeta);
        }
      } else {
        error.value = "Не удалось загрузить конфигурацию с сервера";
      }
    } catch (e: any) {
      error.value =
        e?.statusMessage || e?.message || "Ошибка загрузки конфигурации";
      // Не кидаем исключение: на витрине лучше отобразить дефолт вместо падения
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    loadFromServer();
  });

  return {
    fields,
    productionDays,
    pageImage,
    pageDescription,
    showMacketButton,
    showDesignButton,
    pageExamples,
    loading,
    error,
    reload: loadFromServer,
  };
}

