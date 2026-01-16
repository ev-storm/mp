<script setup lang="ts">
import { ref, onMounted, reactive, computed, watch } from "vue";
import type { OrderField } from "~/types/order-fields";
import type { PageConfigKey } from "~/config/order-fields-config";
import {
  orderFieldsConfig,
  saveConfigToStorage,
} from "~/config/order-fields-config";
import { clearConfigCache, clearMetaCache } from "~/config/order-fields-config";

definePageMeta({
  key: (route) => route.fullPath,
  middleware: "admin-auth",
});

useHead({
  title: "Админ-панель - Конфигурация полей заказа",
  meta: [
    {
      name: "description",
      content: "Управление конфигурацией полей заказа",
    },
  ],
});

// Тип для раздела
type SectionKey = "printing" | "photo" | "gift" | "publish" | "engraver";

// Состояние
const loading = ref(false);
const saving = ref(false);
const isReloading = ref(false);
const message = ref<{ type: "success" | "error"; text: string } | null>(null);
const selectedPage = ref<PageConfigKey | null>(null);
const selectedSection = ref<SectionKey>("printing"); // По умолчанию типография
const config = reactive<Record<PageConfigKey, OrderField[]>>(
  {} as Record<PageConfigKey, OrderField[]>
);

// Метаданные страниц (срок изготовления и другие параметры)
interface PageMeta {
  productionDays?: number; // Количество дней для изготовления
  description?: string; // Текст описания для страницы (отображается в .tab-order-name p)
  imageUrl?: string; // URL изображения для страницы (отображается в .tab-option-img img)
  showMacketButton?: boolean; // Показывать ли кнопку загрузки макета (tab-order-macket)
  showDesignButton?: boolean; // Показывать ли кнопку заказа дизайна (tab-order-macket-des)
  examples?: string[]; // Массив URL изображений примеров работ
}

const pageMeta = reactive<Record<PageConfigKey, PageMeta>>(
  {} as Record<PageConfigKey, PageMeta>
);

// Toast для успешного сохранения
const showToast = ref(false);
const toastMessage = ref("");

const closeToast = () => {
  showToast.value = false;
};

// Модалка подтверждения удаления
const showDeleteModal = ref(false);
const deleteAction = ref<{
  type: "field" | "option" | null;
  pageKey: PageConfigKey | null;
  fieldIndex: number | null;
  optionIndex: number | null;
  message?: string;
}>({
  type: null,
  pageKey: null,
  fieldIndex: null,
  optionIndex: null,
  message: undefined,
});

// Модалка примеров работ
const showExamplesModal = ref(false);

// Список всех страниц с их названиями
const pageNames: Record<PageConfigKey, string> = {
  // Типография
  tracing: "Печать на кальке",
  catalogs: "Брошюры и каталоги",
  replication: "Тиражирование на ризографе",
  scan: "Сканирование документа",
  diplom: "Печать курсовых и дипломных работ",
  "booklet-laser": "Печать листовок и буклетов (лазерная)",
  "booklet-ofset": "Печать листовок и буклетов (офсетная)",
  "visit-card-laser": "Печать визиток (лазерная)",
  "visit-card-ofset": "Печать визиток (офсетная)",
  "visit-card-uf": "Печать визиток (УФ)",
  "stickers-print": "Наклейки и плоттерная резка",
  "plotter-paper": "Плоттерная бумага",
  "bind-plastic": "Переплет (пластик)",
  "bind-metal": "Переплет (металл)",
  "bind-hard": "Переплет (твердый)",
  "lamination-doc": "Ламинирование документов",
  "lamination-large": "Широкоформатное ламинирование",
  "large-print": "Широкоформатная печать",
  "large-scan": "Широкоформатное сканирование",
  "large-plan": "Печать чертежей",
  "scan-print": "Печать документа до А3",
  // Фотопечать
  "photo-test": "Тестовая страница фотопечати",
  // Сувениры
  "gift-test": "Тестовая страница сувениров",
  // Издательство
  "publish-test": "Тестовая страница издательства",
  // Гравюровка
  "engraver-test": "Тестовая страница гравюровки",
};

// Маппинг страниц по разделам
const pageSectionMap: Record<PageConfigKey, SectionKey> = {
  // Типография
  tracing: "printing",
  catalogs: "printing",
  replication: "printing",
  scan: "printing",
  diplom: "printing",
  "booklet-laser": "printing",
  "booklet-ofset": "printing",
  "visit-card-laser": "printing",
  "visit-card-ofset": "printing",
  "visit-card-uf": "printing",
  "stickers-print": "printing",
  "plotter-paper": "printing",
  "bind-plastic": "printing",
  "bind-metal": "printing",
  "bind-hard": "printing",
  "lamination-doc": "printing",
  "lamination-large": "printing",
  "large-print": "printing",
  "large-scan": "printing",
  "large-plan": "printing",
  "scan-print": "printing",
  // Фотопечать
  "photo-test": "photo",
  // Сувениры
  "gift-test": "gift",
  // Издательство
  "publish-test": "publish",
  // Гравюровка
  "engraver-test": "engraver",
};

// Названия разделов
const sectionNames: Record<SectionKey, string> = {
  printing: "Типография",
  photo: "Фотопечать",
  gift: "Сувениры",
  publish: "Издательство",
  engraver: "Гравюровка",
};

// Цвета разделов для активных элементов
const sectionColors: Record<SectionKey, string> = {
  printing: "var(--blue)",
  photo: "var(--red)",
  gift: "var(--orange)",
  publish: "var(--green)",
  engraver: "var(--blue_2)",
};

// Computed свойство для получения текущего цвета раздела
const currentSectionColor = computed(() => {
  return sectionColors[selectedSection.value as SectionKey];
});

// Фильтрация страниц по выбранному разделу
const filteredPages = computed(() => {
  const filtered: Record<PageConfigKey, string> = {} as Record<
    PageConfigKey,
    string
  >;
  Object.keys(pageNames).forEach((key) => {
    const pageKey = key as PageConfigKey;
    if (pageSectionMap[pageKey] === selectedSection.value) {
      filtered[pageKey] = pageNames[pageKey];
    }
  });
  return filtered;
});

// Обработчик клика для кнопки reload с анимацией
const handleReload = () => {
  isReloading.value = true;
  loadConfig();
  // Сбрасываем анимацию после завершения, чтобы вернуться в исходное положение
  setTimeout(() => {
    isReloading.value = false;
  }, 600); // Длительность анимации (больше для плавности)
};

// Загрузить конфигурацию
const loadConfig = async () => {
  loading.value = true;
  message.value = null;
  try {
    // Всегда начинаем с дефолтной конфигурации
    let loadedConfig: Record<PageConfigKey, OrderField[]> = {
      ...orderFieldsConfig,
    };

    // Пытаемся загрузить с сервера
    try {
      const response = await $fetch<{
        success: boolean;
        data?: Record<PageConfigKey, OrderField[]>;
        meta?: Record<PageConfigKey, PageMeta>;
      }>("/api/order-fields-config");
      if (response.success && response.data) {
        // Используем конфигурацию с сервера
        loadedConfig = response.data;

        // Загружаем метаданные с сервера
        if (response.meta && typeof response.meta === "object") {
          Object.assign(pageMeta, response.meta);
        }
      }
    } catch (apiError) {
      // Если не удалось загрузить с сервера, просто работаем с дефолтной конфигурацией
      console.warn(
        "Не удалось загрузить конфигурацию с сервера, используем дефолтную:",
        apiError
      );
      loadedConfig = { ...orderFieldsConfig };
    }

    // Убеждаемся, что все ключи из дефолтной конфигурации присутствуют
    // и правильно инициализированы в реактивном объекте
    // Используем явное присваивание для каждого ключа, чтобы сохранить реактивность
    for (const key in loadedConfig) {
      const pageKey = key as PageConfigKey;
      const fields = loadedConfig[pageKey] || [];

      // Инициализируем thresholdsString для полей quantity
      // Прибавляем 1 к каждому порогу для отображения (так как при сохранении вычитали 1)
      fields.forEach((field: any) => {
        if (field.type === "input" && field.id === "quantity" && field.thresholds) {
          (field as any).thresholdsString = field.thresholds.map((t: number) => t + 1).join(", ");
        }
        // Для всех input полей устанавливаем value: 1 по умолчанию, если значение не задано
        if (field.type === "input" && (field.value === null || field.value === undefined || field.value === "")) {
          field.value = 1;
        }
      });

      // Если ключ уже существует, обновляем массив через splice для сохранения реактивности
      if (config[pageKey] && Array.isArray(config[pageKey])) {
        config[pageKey].splice(0, config[pageKey].length, ...fields);
      } else {
        // Если ключа нет, создаем новый массив
        config[pageKey] = [...fields];
      }
    }

    // Убеждаемся, что все ключи из дефолтной конфигурации присутствуют
    for (const key in orderFieldsConfig) {
      const pageKey = key as PageConfigKey;
      if (!(pageKey in config)) {
        config[pageKey] = [];
      }
    }

    if (!selectedPage.value) {
      // Выбираем первую страницу с конфигурацией
      const firstPageWithConfig = Object.keys(config).find(
        (key) => config[key as PageConfigKey]?.length > 0
      ) as PageConfigKey | undefined;
      if (firstPageWithConfig) {
        selectedPage.value = firstPageWithConfig;
      }
    }
  } catch (error: any) {
    message.value = {
      type: "error",
      text: `Ошибка загрузки: ${error.message || "Неизвестная ошибка"}`,
    };
  } finally {
    loading.value = false;
  }
};

// Сохранить конфигурацию
const saveConfig = async () => {
  saving.value = true;
  message.value = null;
  try {
    // Создаем копию конфигурации для сохранения, чтобы убедиться, что все ключи присутствуют
    const configToSave: Record<PageConfigKey, OrderField[]> = {} as Record<
      PageConfigKey,
      OrderField[]
    >;

    // Копируем все ключи из текущей конфигурации
    for (const key in config) {
      const pageKey = key as PageConfigKey;
      // Создаем глубокую копию массива полей
      const fields = JSON.parse(JSON.stringify(config[pageKey] || []));
      
      // Устанавливаем значения по умолчанию
      for (const field of fields) {
        if (field.type === "input") {
          // Для input полей значение по умолчанию всегда 1
          if (field.value === null || field.value === undefined || field.value === "") {
            field.value = 1;
          }
        } else if (field.type === "dropdown" || field.type === "dropdown-multiply") {
          // Для dropdown полей value уже установлен через чекбокс, но если его нет, оставляем null
          // Значение уже установлено через setDefaultOption
        }
      }
      
      configToSave[pageKey] = fields;
    }

    // Убеждаемся, что все ключи из дефолтной конфигурации присутствуют
    // Это важно для совместимости
    for (const key in orderFieldsConfig) {
      const pageKey = key as PageConfigKey;
      if (!(pageKey in configToSave)) {
        configToSave[pageKey] = [];
      }
    }

    try {
      // Сохраняем на сервер через API (конфигурация + метаданные)
      const response = await $fetch<{ success: boolean; message?: string }>(
        "/api/order-fields-config",
        {
          method: "POST",
          body: { config: configToSave, meta: pageMeta },
          credentials: "include", // Важно: передаем cookies
        } as any
      ).catch((error: any) => {
        console.error("Ошибка при сохранении на сервер:", error);
        // Пробрасываем ошибку дальше
        throw error;
      });

      if (response.success) {
        // Показываем Toast
        toastMessage.value = "Конфигурация успешно сохранена на сервере";
        showToast.value = true;
        // Сбрасываем кэш
        clearConfigCache();
        clearMetaCache();

        // Генерируем кастомное событие для обновления конфигурации на страницах
        if (typeof window !== "undefined") {
          const event = new CustomEvent("pageConfigUpdated", {
            detail: { config: configToSave },
          });
          window.dispatchEvent(event);
        }
      } else {
        throw new Error("Не удалось сохранить на сервере");
      }
    } catch (apiError: any) {
      // Если API недоступен или вернул ошибку, явно показываем ошибку
      console.error("Ошибка при сохранении на сервер:", apiError);
      throw apiError;
    }
  } catch (error: any) {
    console.error("Ошибка сохранения конфигурации:", error);
    let errorMessage = "Неизвестная ошибка";

    if (error.statusCode === 401) {
      errorMessage = "Требуется авторизация. Пожалуйста, войдите заново.";
    } else if (error.statusCode === 500) {
      errorMessage = "Ошибка сервера. Проверьте логи на сервере.";
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.statusMessage) {
      errorMessage = error.statusMessage;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    message.value = {
      type: "error",
      text: `Ошибка сохранения: ${errorMessage}`,
    };
  } finally {
    saving.value = false;
  }
};

// Добавить новое поле
const addField = (pageKey: PageConfigKey) => {
  if (!config[pageKey]) {
    config[pageKey] = [];
  }
  config[pageKey].push({
    id: `field-${Date.now()}`,
    type: "dropdown",
    label: "Новое поле",
    placeholder: "Выберите значение",
    options: [{ label: "Опция 1", price: 0 }],
    value: null,
  });
};

// Показать модалку подтверждения удаления
const confirmDelete = (
  type: "field" | "option",
  pageKey: PageConfigKey,
  fieldIndex: number,
  optionIndex?: number,
  customMessage?: string
) => {
  deleteAction.value = {
    type,
    pageKey,
    fieldIndex,
    optionIndex: optionIndex ?? null,
    message: customMessage,
  };
  showDeleteModal.value = true;
};

// Запрещенные поля для удаления (по ключу страницы и label поля)
const protectedFields: Record<string, string[]> = {
  "booklet-laser": ["Сложение", "Плотность бумаги", "Биговка"],
  "booklet-ofset": ["Сложение", "Плотность бумаги", "Биговка"],
};

// Проверка, можно ли удалять поле
const canDeleteField = (
  pageKey: PageConfigKey | null,
  fieldIndex: number
): boolean => {
  if (!pageKey) return false;
  const field = config[pageKey]?.[fieldIndex];
  const protectedLabels = protectedFields[pageKey];

  if (field && protectedLabels && protectedLabels.includes(field.label)) {
    return false;
  }

  return true;
};

// Показать модалку для удаления поля
const confirmDeleteField = (pageKey: PageConfigKey, index: number) => {
  // Проверяем, является ли поле запрещенным для удаления
  if (!canDeleteField(pageKey, index)) {
    const field = config[pageKey]?.[index];
    toastMessage.value = `Поле "${
      field?.label || "это поле"
    }" нельзя удалять для этой страницы`;
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 3000);
    return;
  }

  confirmDelete("field", pageKey, index);
};

// Drag and Drop для изменения порядка полей
const draggedFieldIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);

const handleDragStart = (event: DragEvent, fieldIndex: number) => {
  draggedFieldIndex.value = fieldIndex;
  dragOverIndex.value = null;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/html", fieldIndex.toString());
  }
};

const handleDragEnd = (event: DragEvent) => {
  draggedFieldIndex.value = null;
  dragOverIndex.value = null;
};

const handleDragOver = (event: DragEvent, targetIndex: number) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
  if (
    draggedFieldIndex.value !== null &&
    draggedFieldIndex.value !== targetIndex
  ) {
    dragOverIndex.value = targetIndex;
  }
};

const handleDragLeave = (event: DragEvent) => {
  // Проверяем, что мы действительно покинули элемент (не перешли на дочерний)
  const target = event.target as HTMLElement;
  const relatedTarget = event.relatedTarget as HTMLElement;
  if (!target.contains(relatedTarget)) {
    dragOverIndex.value = null;
  }
};

const handleDrop = (event: DragEvent, targetIndex: number) => {
  event.preventDefault();
  event.stopPropagation();

  if (draggedFieldIndex.value === null || !selectedPage.value) {
    dragOverIndex.value = null;
    return;
  }

  const sourceIndex = draggedFieldIndex.value;

  if (sourceIndex === targetIndex) {
    dragOverIndex.value = null;
    return;
  }

  // Перемещаем поле в массиве
  const fields = config[selectedPage.value];
  if (!fields) {
    dragOverIndex.value = null;
    return;
  }

  const [movedField] = fields.splice(sourceIndex, 1);
  if (movedField) {
    fields.splice(targetIndex, 0, movedField);
  }

  // Сбрасываем состояние
  draggedFieldIndex.value = null;
  dragOverIndex.value = null;

  // Показываем уведомление
  toastMessage.value = "Порядок полей обновлен";
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 2000);
};

// Выполнить удаление (после подтверждения)
const executeDelete = () => {
  const { type, pageKey, fieldIndex, optionIndex } = deleteAction.value;

  if (!pageKey || fieldIndex === null) {
    closeDeleteModal();
    return;
  }

  if (type === "field") {
    // Проверяем еще раз перед удалением (на всякий случай)
    const field = config[pageKey]?.[fieldIndex];
    const protectedLabels = protectedFields[pageKey];

    if (field && protectedLabels && protectedLabels.includes(field.label)) {
      toastMessage.value = `Поле "${field.label}" нельзя удалять для этой страницы`;
      showToast.value = true;
      setTimeout(() => {
        showToast.value = false;
      }, 3000);
      closeDeleteModal();
      return;
    }

    // Удалить поле
    if (config[pageKey]) {
      config[pageKey].splice(fieldIndex, 1);
    }
  } else if (type === "option" && optionIndex !== null) {
    // Удалить опцию
    const field = config[pageKey]?.[fieldIndex];
    if (field && (field.type === "dropdown" || field.type === "dropdown-multiply")) {
      field.options.splice(optionIndex, 1);
    }
  }

  closeDeleteModal();
};

// Закрыть модалку
const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deleteAction.value = {
    type: null,
    pageKey: null,
    fieldIndex: null,
    optionIndex: null,
    message: undefined,
  };
};

// Обработчик изменения типа поля
const handleFieldTypeChange = (field: any, fieldIndex: number) => {
  if (!selectedPage.value) return;

  // Удаляем свойства, которые не нужны для нового типа
  if (field.type === "toggle") {
    // Преобразуем в toggle поле
    delete field.placeholder;
    delete field.options;
    delete field.inputType;
    delete field.min;
    delete field.max;
    // Устанавливаем свойства toggle, если их нет
    if (field.price === undefined) field.price = 0;
    if (field.value === null || field.value === undefined) field.value = false;
    if (typeof field.value !== "boolean") field.value = false;
  } else if (field.type === "input") {
    // Преобразуем в input поле
    delete field.options;
    delete field.price;
    delete field.tooltip;
    // Устанавливаем свойства input, если их нет
    if (!field.placeholder) field.placeholder = "Введите значение";
    if (!field.inputType) field.inputType = "text";
    // Для input полей значение по умолчанию всегда 1
    if (field.value === null || field.value === undefined || field.value === "") {
      field.value = 1;
    }
  } else if (field.type === "dropdown") {
    // Преобразуем в dropdown поле
    delete field.price;
    delete field.tooltip;
    delete field.inputType;
    delete field.min;
    delete field.max;
    // Устанавливаем свойства dropdown, если их нет
    if (!field.placeholder) field.placeholder = "Выберите значение";
    if (!field.options || !Array.isArray(field.options)) {
      field.options = [{ label: "Опция 1", price: 0 }];
    }
    if (field.value === null || field.value === undefined) field.value = null;
  } else if (field.type === "dropdown-multiply") {
    // Преобразуем в dropdown-multiply поле
    delete field.price;
    delete field.tooltip;
    delete field.inputType;
    delete field.min;
    delete field.max;
    // Устанавливаем свойства dropdown-multiply, если их нет
    if (!field.placeholder) field.placeholder = "Выберите значение";
    if (!field.options || !Array.isArray(field.options)) {
      field.options = [{ label: "Опция 1", price: 1 }];
    }
    if (field.value === null || field.value === undefined) field.value = null;
  }
};

// Обновить пороги из строки
const updateThresholds = (fieldIndex: number) => {
  if (!selectedPage.value) return;
  const field = config[selectedPage.value]?.[fieldIndex];
  if (field && field.type === "input" && field.id === "quantity") {
    const thresholdsString = (field as any).thresholdsString || "";
    if (thresholdsString.trim()) {
      const thresholds = thresholdsString
        .split(",")
        .map((t: string) => parseFloat(t.trim()) - 1) // Вычитаем 1 из каждого порога
        .filter((t: number) => !isNaN(t))
        .sort((a: number, b: number) => a - b);
      field.thresholds = thresholds.length > 0 ? thresholds : undefined;
    } else {
      field.thresholds = undefined;
    }
  }
};

// Получить строку порогов для отображения
const getThresholdsString = (field: any): string => {
  if (field.type === "input" && field.id === "quantity" && field.thresholds) {
    // Прибавляем 1 к каждому порогу для отображения (так как при сохранении вычитали 1)
    return field.thresholds.map((t: number) => t + 1).join(", ");
  }
  return (field as any).thresholdsString || "";
};

// Проверить, есть ли пороги в текущей странице
const hasThresholds = (): boolean => {
  if (!selectedPage.value) return false;
  const quantityField = config[selectedPage.value]?.find(
    (f: OrderField) => f.id === "quantity" && f.type === "input"
  );
  return (
    quantityField !== undefined &&
    quantityField.type === "input" &&
    quantityField.thresholds !== undefined &&
    Array.isArray(quantityField.thresholds) &&
    quantityField.thresholds.length > 0
  );
};

// Получить пороги текущей страницы
const getCurrentThresholds = (): number[] | undefined => {
  if (!selectedPage.value) return undefined;
  const quantityField = config[selectedPage.value]?.find(
    (f: OrderField) => f.id === "quantity" && f.type === "input"
  );
  if (quantityField && quantityField.type === "input") {
    return quantityField.thresholds;
  }
  return undefined;
};

// Получить строку цены для отображения
const getPriceString = (price: number | number[]): string => {
  if (typeof price === "number") {
    return price.toString();
  }
  if (Array.isArray(price)) {
    return price.join(", ");
  }
  return "";
};

// Обновить цену опции из строки (вызывается при blur)
const updateOptionPrice = (
  fieldIndex: number,
  optionIndex: number,
  priceString: string
) => {
  if (!selectedPage.value) return;
  const field = config[selectedPage.value]?.[fieldIndex];
  if (field && (field.type === "dropdown" || field.type === "dropdown-multiply") && field.options[optionIndex]) {
    const thresholds = getCurrentThresholds();
    if (thresholds && thresholds.length > 0) {
      // Если есть пороги, парсим массив
      const prices = priceString
        .split(",")
        .map((p) => parseFloat(p.trim()))
        .filter((p) => !isNaN(p));
      if (prices.length > 0) {
        field.options[optionIndex].price = prices;
      } else {
        // Если не удалось распарсить, оставляем как есть или устанавливаем 0
        field.options[optionIndex].price = 0;
      }
    } else {
      // Если нет порогов, парсим одно число
      const price = parseFloat(priceString.trim());
      field.options[optionIndex].price = isNaN(price) ? 0 : price;
    }
  }
};

// Сохранить промежуточное значение цены (для отображения во время ввода)
const savePriceString = (
  fieldIndex: number,
  optionIndex: number,
  priceString: string
) => {
  if (!selectedPage.value) return;
  const field = config[selectedPage.value]?.[fieldIndex];
  if (field && (field.type === "dropdown" || field.type === "dropdown-multiply") && field.options[optionIndex]) {
    // Сохраняем строку во временное поле для отображения
    (field.options[optionIndex] as any).priceString = priceString;
  }
};

// Получить строку цены для отображения (с учетом промежуточного значения)
const getPriceStringForInput = (option: any): string => {
  // Если есть промежуточное значение (во время ввода), используем его
  if ((option as any).priceString !== undefined) {
    return (option as any).priceString;
  }
  // Иначе используем сохраненное значение
  return getPriceString(option.price);
};

// Обработчик для изменения thresholdsString
const handleThresholdsStringInput = (field: any, value: string) => {
  (field as any).thresholdsString = value;
};

// Обработчик для изменения priceString
const handlePriceStringInput = (fieldIndex: number, optionIndex: number, value: string) => {
  savePriceString(fieldIndex, optionIndex, value);
};

// Обработчик для blur priceString
const handlePriceStringBlur = (fieldIndex: number, optionIndex: number, value: string) => {
  updateOptionPrice(fieldIndex, optionIndex, value);
};

// Добавить опцию в dropdown
const addOption = (pageKey: PageConfigKey, fieldIndex: number) => {
  const field = config[pageKey]?.[fieldIndex];
  if (field && (field.type === "dropdown" || field.type === "dropdown-multiply")) {
    const defaultPrice = field.type === "dropdown-multiply" ? 1 : 0;
    field.options.push({ label: "Новая опция", price: defaultPrice });
  }
};

// Проверить, является ли опция значением по умолчанию
const isDefaultOption = (field: OrderField, optionIndex: number): boolean => {
  if (!field || (field.type !== "dropdown" && field.type !== "dropdown-multiply")) {
    return false;
  }
  if (!field.value || !field.options || !field.options[optionIndex]) {
    return false;
  }
  // Сравниваем по label, так как это самый надежный способ
  return field.value.label === field.options[optionIndex].label;
};

// Установить опцию как значение по умолчанию
const setDefaultOption = (fieldIndex: number, optionIndex: number) => {
  if (!selectedPage.value) return;
  const field = config[selectedPage.value]?.[fieldIndex];
  if (field && (field.type === "dropdown" || field.type === "dropdown-multiply") && field.options[optionIndex]) {
    const isCurrentlyDefault = isDefaultOption(field, optionIndex);
    if (isCurrentlyDefault) {
      // Если снимаем галочку, сбрасываем value
      field.value = null;
    } else {
      // Устанавливаем value равным выбранной опции
      field.value = JSON.parse(JSON.stringify(field.options[optionIndex]));
    }
  }
};

// Показать модалку для удаления опции
const confirmDeleteOption = (
  pageKey: PageConfigKey,
  fieldIndex: number,
  optionIndex: number
) => {
  confirmDelete("option", pageKey, fieldIndex, optionIndex);
};

// Получить текущие поля выбранной страницы
const currentFields = computed(() => {
  if (!selectedPage.value) return [];
  return config[selectedPage.value] || [];
});

// Таблица цен для scan-print
const quantityTiers = [1, 5, 10, 100, 300, 500];
const quantityLabels = ["1", "5+", "10+", "100+", "300+", "500+"];

// Состояние для таблицы цен
const priceTableColorMode = ref(false); // false = чб, true = цвет
const priceTableFormats = ref([
  { label: "А4", value: "A4" },
  { label: "А3", value: "A3" }
]);
const selectedFormat = ref("A4");

// Добавить новую опцию формата
const addFormatOption = () => {
  const newFormat = { label: "Новый формат", value: `format-${Date.now()}` };
  priceTableFormats.value.push(newFormat);
  selectedFormat.value = newFormat.value;
};

// Получить поле плотности бумаги
const getPlotField = computed(() => {
  if (!selectedPage.value || selectedPage.value !== "scan-print") return null;
  const fields = config[selectedPage.value] || [];
  const field = fields.find((f: OrderField) => f.id === "plot");
  if (field && (field.type === "dropdown" || field.type === "dropdown-multiply")) {
    return field;
  }
  return null;
});

// Получить опции поля плотности (исключая "100 г/м²")
const getPlotFieldOptions = computed(() => {
  const field = getPlotField.value;
  if (field && (field.type === "dropdown" || field.type === "dropdown-multiply")) {
    const options = (field as any).options || [];
    // Исключаем "100 г/м²"
    return options.filter((option: any) => !option.label.includes("100 г/м²"));
  }
  return [];
});

// Получить количество опций плотности
const getPlotFieldOptionsCount = computed(() => {
  return getPlotFieldOptions.value.length || 8;
});

// Получить поле дизайна (если есть)
const getDesignField = computed(() => {
  if (!selectedPage.value || selectedPage.value !== "scan-print") return null;
  const fields = config[selectedPage.value] || [];
  return fields.find((f: OrderField) => f.id === "design") || null;
});

// Получить цену для плотности и количества
const getPriceForDensityAndQuantity = (densityOption: any, quantityIndex: number): number => {
  if (!densityOption || !densityOption.price) return 0;
  if (Array.isArray(densityOption.price)) {
    return densityOption.price[quantityIndex] || 0;
  }
  return densityOption.price || 0;
};

// Обновить цену для плотности и количества
const updatePriceForDensityAndQuantity = (
  densityOption: any,
  quantityIndex: number,
  newPrice: number
) => {
  if (!densityOption) return;
  if (!Array.isArray(densityOption.price)) {
    densityOption.price = new Array(quantityTiers.length).fill(0);
  }
  densityOption.price[quantityIndex] = newPrice;
  // Обновляем priceString
  densityOption.priceString = densityOption.price.join(",");
};

// Обработчик для изменения цены плотности
const handleDensityPriceChange = (option: any, qIndex: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target) {
    updatePriceForDensityAndQuantity(option, qIndex, parseFloat(target.value) || 0);
  }
};

// Обработчик для изменения цены дизайна
const handleDesignPriceChange = (qIndex: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target) {
    updateDesignPriceForQuantity(qIndex, parseFloat(target.value) || 0);
  }
};


// Обновить цену дизайна для количества
const updateDesignPriceForQuantity = (quantityIndex: number, newPrice: number) => {
  if (!selectedPage.value || selectedPage.value !== "scan-print") return;
  const designField = getDesignField.value;
  
  // Если поля дизайна нет, создаем его в метаданных страницы
  if (!designField) {
    if (!pageMeta["scan-print"]) {
      pageMeta["scan-print"] = {};
    }
    if (!(pageMeta["scan-print"] as any).designPrices) {
      (pageMeta["scan-print"] as any).designPrices = new Array(quantityTiers.length).fill(0);
    }
    (pageMeta["scan-print"] as any).designPrices[quantityIndex] = newPrice;
    return;
  }
  
  // Если поле есть, обновляем его price
  if (!Array.isArray((designField as any).price)) {
    (designField as any).price = new Array(quantityTiers.length).fill(0);
  }
  (designField as any).price[quantityIndex] = newPrice;
};

// Получить цену дизайна (из поля или метаданных)
const getDesignPriceForQuantity = (quantityIndex: number): number => {
  const designField = getDesignField.value;
  if (designField && (designField as any).price) {
    if (Array.isArray((designField as any).price)) {
      return (designField as any).price[quantityIndex] || 0;
    }
    return (designField as any).price || 0;
  }
  // Проверяем метаданные
  if (pageMeta["scan-print"] && (pageMeta["scan-print"] as any).designPrices) {
    return (pageMeta["scan-print"] as any).designPrices[quantityIndex] || 0;
  }
  return 0;
};

// Получить дефолтное изображение для страницы
const getDefaultPageImage = (pageKey: PageConfigKey | null): string => {
  if (!pageKey) return "/img/repli/1.png";

  const defaultImages: Record<PageConfigKey, string> = {
    tracing: "/img/tracing/1.png",
    catalogs: "/img/catalogs/1.png",
    replication: "/img/repli/1.png",
    scan: "/img/scan/1.png",
    diplom: "/img/bind/1.png", // Используем bind/1.png для diplom
    "booklet-laser": "/img/repli/1.png", // Дефолт, если нет отдельного изображения
    "booklet-ofset": "/img/repli/1.png",
    "visit-card-laser": "/img/visit/1.png",
    "visit-card-ofset": "/img/visit/2.png",
    "visit-card-uf": "/img/visit/3.png",
    "stickers-print": "/img/stick/1.png",
    "plotter-paper": "/img/stick/2.png",
    "bind-plastic": "/img/bind/2.png",
    "bind-metal": "/img/bind/3.png",
    "bind-hard": "/img/bind/1.png",
    "lamination-doc": "/img/lam/1.png",
    "lamination-large": "/img/lam/2.png",
    "large-print": "/img/large/1.png",
    "large-scan": "/img/large/2.png",
    "large-plan": "/img/large/3.png",
    "scan-print": "/img/scan/2.png",
    "photo-test": "/img/repli/1.png",
    "gift-test": "/img/repli/1.png",
    "publish-test": "/img/repli/1.png",
    "engraver-test": "/img/repli/1.png",
  };

  return defaultImages[pageKey] || "/img/repli/1.png";
};

// Computed для текущего изображения страницы
const currentPageImage = computed({
  get: () => {
    if (!selectedPage.value) return "";
    if (!pageMeta[selectedPage.value]) {
      initPageMeta(selectedPage.value);
    }
    // Используем сохраненное изображение или дефолтное
    return (
      pageMeta[selectedPage.value]?.imageUrl ||
      getDefaultPageImage(selectedPage.value)
    );
  },
  set: (value: string) => {
    if (!selectedPage.value) return;
    if (!pageMeta[selectedPage.value]) {
      initPageMeta(selectedPage.value);
    }
    pageMeta[selectedPage.value].imageUrl = value;
  },
});

// Computed для безопасного доступа к productionDays с getter/setter
const currentProductionDays = computed({
  get: () => {
    if (!selectedPage.value) return 1;
    if (!pageMeta[selectedPage.value]) {
      initPageMeta(selectedPage.value);
    }
    return pageMeta[selectedPage.value]?.productionDays ?? 1;
  },
  set: (value: number) => {
    if (!selectedPage.value) return;
    if (!pageMeta[selectedPage.value]) {
      initPageMeta(selectedPage.value);
    }
    pageMeta[selectedPage.value].productionDays = value;
  },
});

// Computed для текущего текста описания страницы
const currentPageDescription = computed({
  get: () => {
    if (!selectedPage.value) return "";
    if (!pageMeta[selectedPage.value]) {
      initPageMeta(selectedPage.value);
    }
    return pageMeta[selectedPage.value]?.description || "";
  },
  set: (value: string) => {
    if (!selectedPage.value) return;
    if (!pageMeta[selectedPage.value]) {
      initPageMeta(selectedPage.value);
    }
    pageMeta[selectedPage.value].description = value;
  },
});

// Computed для showMacketButton
const currentShowMacketButton = computed({
  get: () => {
    if (!selectedPage.value) return true;
    if (!pageMeta[selectedPage.value]) {
      initPageMeta(selectedPage.value);
    }
    return pageMeta[selectedPage.value]?.showMacketButton ?? true;
  },
  set: (value: boolean) => {
    if (!selectedPage.value) return;
    if (!pageMeta[selectedPage.value]) {
      initPageMeta(selectedPage.value);
    }
    pageMeta[selectedPage.value].showMacketButton = value;
    savePageMeta();
  },
});

// Computed для showDesignButton
const currentShowDesignButton = computed({
  get: () => {
    if (!selectedPage.value) return true;
    if (!pageMeta[selectedPage.value]) {
      initPageMeta(selectedPage.value);
    }
    return pageMeta[selectedPage.value]?.showDesignButton ?? true;
  },
  set: (value: boolean) => {
    if (!selectedPage.value) return;
    if (!pageMeta[selectedPage.value]) {
      initPageMeta(selectedPage.value);
    }
    pageMeta[selectedPage.value].showDesignButton = value;
    savePageMeta();
  },
});

// Обработчики для кнопок
const toggleMacketButton = () => {
  const newValue = !currentShowMacketButton.value;
  currentShowMacketButton.value = newValue;

  // Если макет деактивируется, дизайн тоже должен деактивироваться
  if (!newValue && currentShowDesignButton.value) {
    currentShowDesignButton.value = false;
  }
};

const toggleDesignButton = () => {
  const newValue = !currentShowDesignButton.value;

  // Если дизайн активируется, макет тоже должен активироваться
  if (newValue && !currentShowMacketButton.value) {
    currentShowMacketButton.value = true;
  }

  currentShowDesignButton.value = newValue;
};

// Computed для примеров работ текущей страницы
const currentPageExamples = computed(() => {
  if (!selectedPage.value) return [];
  if (!pageMeta[selectedPage.value]) {
    initPageMeta(selectedPage.value);
  }
  return pageMeta[selectedPage.value]?.examples || [];
});

// Открыть модалку примеров работ
const openExamplesModal = () => {
  showExamplesModal.value = true;
};

// Закрыть модалку примеров работ
const closeExamplesModal = () => {
  showExamplesModal.value = false;
};

// Обработчик клика на кнопку "Добавить примеры работ"
const handleExamplesButtonClick = () => {
  if (typeof window !== "undefined" && examplesInputRef.value) {
    examplesInputRef.value.click();
  }
};

// Обработчик загрузки примеров работ
const handleExamplesUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  if (!files || !selectedPage.value) return;

  // Инициализируем метаданные страницы, если их нет
  if (!pageMeta[selectedPage.value]) {
    initPageMeta(selectedPage.value);
  }

  try {
    // Конвертируем все выбранные файлы в base64
    const newExamples: string[] = [];
    const fileArray = Array.from(files);

    // Проверяем каждый файл
    for (const file of fileArray) {
      // Проверяем тип файла
      if (!file.type.startsWith("image/")) {
        message.value = {
          type: "error",
          text: `Файл "${file.name}" не является изображением`,
        };
        continue;
      }

      // Проверяем размер файла (максимум 10 МБ)
      if (file.size > 10 * 1024 * 1024) {
        message.value = {
          type: "error",
          text: `Файл "${file.name}" превышает 10 МБ`,
        };
        continue;
      }

      // Читаем файл как base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            resolve(result);
          } else {
            reject(new Error(`Ошибка при чтении файла ${file.name}`));
          }
        };
        reader.onerror = () => {
          reject(new Error(`Ошибка при чтении файла ${file.name}`));
        };
        reader.readAsDataURL(file);
      });

      newExamples.push(base64Data);
    }

    if (newExamples.length > 0) {
      // Добавляем новые примеры к существующим или заменяем их
      const currentExamples = pageMeta[selectedPage.value]?.examples || [];
      pageMeta[selectedPage.value].examples = [
        ...currentExamples,
        ...newExamples,
      ];
      savePageMeta();

      toastMessage.value = `Загружено примеров работ: ${newExamples.length}. Нажмите 'Сохранить' для применения изменений.`;
      showToast.value = true;
      setTimeout(() => {
        showToast.value = false;
      }, 3000);
    }

    // Очищаем input, чтобы можно было выбрать те же файлы снова
    if (input) {
      input.value = "";
    }
  } catch (error: any) {
    message.value = {
      type: "error",
      text: error.message || "Ошибка при загрузке примеров работ",
    };
  }
};

// Сохранить метаданные страницы (только в localStorage и событие, основное сохранение через saveConfig)
const savePageMeta = () => {
  // Метаданные сохраняются вместе с конфигурацией через saveConfig()
  // Здесь только обновляем событие для синхронизации в той же вкладке
  if (typeof window !== "undefined") {
    const META_STORAGE_KEY = "order-fields-meta";
    if (window.localStorage) {
      try {
        localStorage.setItem(META_STORAGE_KEY, JSON.stringify(pageMeta));
      } catch (error) {
        console.warn("Ошибка сохранения метаданных в localStorage:", error);
      }
    }
    // Генерируем кастомное событие для обновления метаданных на страницах
    const event = new CustomEvent("pageMetaUpdated", {
      detail: { pageMeta },
    });
    window.dispatchEvent(event);
  }
};

// Ref для input файла изображения
const imageInputRef = ref<HTMLInputElement | null>(null);

// Ref для input файлов примеров работ
const examplesInputRef = ref<HTMLInputElement | null>(null);

// Обработчик клика по контейнеру изображения
const handleImageClick = () => {
  if (typeof window !== "undefined" && imageInputRef.value) {
    imageInputRef.value.click();
  }
};

// Обработчик загрузки изображения
const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !selectedPage.value) return;

  // Проверяем тип файла
  if (!file.type.startsWith("image/")) {
    message.value = {
      type: "error",
      text: "Пожалуйста, выберите изображение",
    };
    return;
  }

  // Проверяем размер файла (максимум 10 МБ)
  if (file.size > 10 * 1024 * 1024) {
    message.value = {
      type: "error",
      text: "Размер файла не должен превышать 10 МБ",
    };
    return;
  }

  try {
    // Читаем файл как base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      if (!base64Data) {
        message.value = {
          type: "error",
          text: "Ошибка при чтении файла",
        };
        return;
      }

      // Сохраняем base64 в метаданные страницы
      currentPageImage.value = base64Data;
      savePageMeta();

      toastMessage.value =
        "Изображение загружено. Нажмите 'Сохранить' для применения изменений.";
      showToast.value = true;
      setTimeout(() => {
        showToast.value = false;
      }, 3000);
    };

    reader.onerror = () => {
      message.value = {
        type: "error",
        text: "Ошибка при чтении файла",
      };
    };

    reader.readAsDataURL(file);
  } catch (error: any) {
    message.value = {
      type: "error",
      text: error.message || "Ошибка при загрузке изображения",
    };
  }
};

// Состояние открытых/закрытых карточек полей
const expandedFields = ref<Set<number>>(new Set());

// Состояние активной кнопки управления карточками
const activeButton = ref<"close" | "open" | null>(null);

// Переключить состояние карточки поля
const toggleFieldCard = (fieldIndex: number) => {
  if (expandedFields.value.has(fieldIndex)) {
    expandedFields.value.delete(fieldIndex);
  } else {
    expandedFields.value.add(fieldIndex);
  }
  // Сбрасываем состояние кнопок при ручном изменении
  activeButton.value = null;
};

// Проверить, открыта ли карточка
const isFieldExpanded = (fieldIndex: number) => {
  return expandedFields.value.has(fieldIndex);
};

// Свернуть все карточки
const collapseAllFields = () => {
  if (!selectedPage.value) return;
  const fields = config[selectedPage.value] || [];
  expandedFields.value.clear();
  activeButton.value = "close";
};

// Развернуть все карточки
const expandAllFields = () => {
  if (!selectedPage.value) return;
  const fields = config[selectedPage.value] || [];
  fields.forEach((_: OrderField, index: number) => {
    expandedFields.value.add(index);
  });
  activeButton.value = "open";
};

// Инициализировать метаданные страницы, если их нет
const initPageMeta = (pageKey: PageConfigKey) => {
  if (!pageMeta[pageKey]) {
    pageMeta[pageKey] = { productionDays: 1 };
  }
};

// Выбрать раздел
const selectSection = (section: SectionKey) => {
  selectedSection.value = section;
  // Сбрасываем выбранную страницу при смене раздела
  const firstPage = Object.keys(filteredPages.value)[0] as
    | PageConfigKey
    | undefined;
  selectedPage.value = firstPage || null;
};

// Обратный маппинг: ключ страницы -> путь маршрута
const keyToRouteMap: Record<PageConfigKey, string> = {
  // Типография
  tracing: "/printing/tracing",
  catalogs: "/printing/catalogs",
  replication: "/printing/replication",
  scan: "/printing/scan",
  diplom: "/printing/diplom",
  "booklet-laser": "/printing/booklet/laser-print",
  "booklet-ofset": "/printing/booklet/ofset-print",
  "visit-card-laser": "/printing/visit-card/laser-print",
  "visit-card-ofset": "/printing/visit-card/ofset-print",
  "visit-card-uf": "/printing/visit-card/uf-print",
  "stickers-print": "/printing/stickers/stickers-print",
  "plotter-paper": "/printing/stickers/plotter-paper",
  "bind-plastic": "/printing/bind/plastic",
  "bind-metal": "/printing/bind/metal",
  "bind-hard": "/printing/bind/hard",
  "lamination-doc": "/printing/lamination/doc",
  "lamination-large": "/printing/lamination/large",
  "large-print": "/printing/large/print",
  "large-scan": "/printing/large/scan",
  "large-plan": "/printing/large/plan",
  "scan-print": "/printing/scan/print",
  // Фотопечать
  "photo-test": "/photo/test",
  // Сувениры
  "gift-test": "/gift/test",
  // Издательство
  "publish-test": "/publish/test",
  // Гравюровка
  "engraver-test": "/engraver/test",
};

// Получить URL страницы по ключу
const getPageUrl = (pageKey: PageConfigKey | null): string | null => {
  if (!pageKey) return null;
  return keyToRouteMap[pageKey] || null;
};

// Функция выхода из системы
const handleLogout = async () => {
  try {
    // Используем серверный endpoint для выхода
    // Cookie удаляется автоматически сервером
    await $fetch("/api/admin/logout", {
      method: "POST",
    });

    // Перенаправляем на страницу входа
    await navigateTo("/admin/login");
  } catch (error) {
    // В случае ошибки все равно перенаправляем на вход
    await navigateTo("/admin/login");
  }
};

onMounted(() => {
  loadConfig();
});

// Следить за изменением выбранной страницы и открывать все карточки
watch(selectedPage, (newPage: PageConfigKey | null) => {
  if (newPage) {
    expandedFields.value.clear();
    const fields = config[newPage] || [];
    fields.forEach((_: OrderField, index: number) => {
      expandedFields.value.add(index);
    });
    // Инициализируем метаданные страницы, если их нет
    initPageMeta(newPage);
    // Сбрасываем состояние кнопок при смене страницы
    activeButton.value = null;
  }
});

// Следить за изменением раздела и сбрасывать выбранную страницу
watch(selectedSection, (newSection: SectionKey) => {
  const firstPage = Object.keys(filteredPages.value)[0] as
    | PageConfigKey
    | undefined;
  selectedPage.value = firstPage || null;
});

// Экспортируем функцию для сброса кэша при изменении конфигурации
watch(
  () => config,
  () => {
    // Можно добавить автосохранение или другие действия
  },
  { deep: true }
);
</script>

<template>
  <div class="admin-container">
    <div v-if="message" :class="['message', `message-${message.type}`]">
      {{ message.text }}
    </div>

    <div class="admin-content">
      <div class="admin-main">
        <div v-if="!selectedPage" class="empty-state">
          <p>Выберите страницу для редактирования</p>
        </div>

        <div v-else>
          <div class="page-header">
            <h2 :style="{ color: currentSectionColor }">
              {{ pageNames[selectedPage] }}
              <a
                v-if="selectedPage && getPageUrl(selectedPage)"
                :href="getPageUrl(selectedPage) || undefined"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-exit"
              >
                <img src="/assets/svg/exit.svg" alt="" />
              </a>
            </h2>

            <div class="page-header-actions">
              <div class="example-con">
                <button @click="handleExamplesButtonClick">
                  <img
                    class="example-preview-btn-img"
                    src="/assets/svg/exe.svg"
                    alt=""
                  />
                </button>
                <button
                  v-if="currentPageExamples.length > 0"
                  @click="openExamplesModal"
                  class="example-preview-btn"
                >
                  <img
                    class="example-preview-btn-img"
                    src="/assets/svg/eye.svg"
                    alt=""
                  />
                  ({{ currentPageExamples.length }})
                </button>
                <input
                  ref="examplesInputRef"
                  type="file"
                  accept="image/*"
                  multiple
                  style="display: none"
                  @change="handleExamplesUpload"
                />
              </div>
              <div class="makets-btn-con">
                <button
                  :class="{ active: currentShowMacketButton }"
                  @click="toggleMacketButton"
                >
                  Макет
                </button>
                <button
                  :class="{ active: currentShowDesignButton }"
                  :disabled="!currentShowMacketButton"
                  @click="toggleDesignButton"
                >
                  Дизайн
                </button>
              </div>
              <div class="form-group page-settings">
                <img src="/assets/svg/time-work.svg" alt="" />
                <input
                  v-if="selectedPage"
                  v-model.number="currentProductionDays"
                  type="number"
                  min="0"
                  placeholder="Введите количество дней"
                />
              </div>
              <button
                @click="addField(selectedPage)"
                class="btn btn-plus btn-small"
              >
                + Добавить поле
              </button>
            </div>
          </div>

          <div class="page-text-con">
            <div class="page-text-img-con" @click="handleImageClick">
              <div class="page-text-img-con-2">
                <img src="/img/login/2.svg" alt="" />
              </div>
              <img :src="currentPageImage" alt="Изображение страницы" />
              <input
                ref="imageInputRef"
                class="page-text-img"
                type="file"
                accept="image/*"
                @change="handleImageUpload"
              />
            </div>
            <textarea
              class="page-text-text"
              v-model="currentPageDescription"
              @input="savePageMeta"
              placeholder="Введите описание страницы (будет отображаться в .tab-order-name p)"
            ></textarea>
          </div>

          <div class="page-text-btn-open">
            <div class="adm-btn-con">
              <button 
                class="adm-btn-close"
                :class="{ active: activeButton === 'close' }"
                @click="collapseAllFields"
              >
                <img src="/assets/svg/adm-btn-close.svg" alt="">
              </button>
              <button 
                class="adm-btn-open"
                :class="{ active: activeButton === 'open' }"
                @click="expandAllFields"
              >
                <img src="/assets/svg/adm-btn-open.svg" alt="">
              </button>
            </div>

          </div>

          <div v-if="currentFields.length === 0" class="empty-fields">
            <p>На этой странице пока нет полей</p>
            <button @click="addField(selectedPage)" class="btn btn-primary">
              Добавить первое поле
            </button>
          </div>

          <div v-else class="fields-list">
            <div
              v-for="(field, fieldIndex) in currentFields"
              :key="field.id || fieldIndex"
              class="field-card"
              :class="{
                dragging: draggedFieldIndex === fieldIndex,
                'drag-over':
                  dragOverIndex === fieldIndex &&
                  draggedFieldIndex !== fieldIndex,
              }"
              draggable="true"
              @dragstart="handleDragStart($event, fieldIndex)"
              @dragend="handleDragEnd($event)"
              @dragover="handleDragOver($event, fieldIndex)"
              @dragleave="handleDragLeave($event)"
              @drop="handleDrop($event, fieldIndex)"
            >
              <div
                class="field-header"
                :class="{ expanded: isFieldExpanded(fieldIndex) }"
                @click="toggleFieldCard(fieldIndex)"
              >
                <!-- Handle для перетаскивания -->
                <div
                  class="field-drag-handle"
                  @mousedown.stop
                  @click.stop
                  title="Перетащите для изменения порядка"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="5" cy="5" r="1.5" fill="currentColor" />
                    <circle cx="10" cy="5" r="1.5" fill="currentColor" />

                    <circle cx="5" cy="10" r="1.5" fill="currentColor" />
                    <circle cx="10" cy="10" r="1.5" fill="currentColor" />

                    <circle cx="5" cy="15" r="1.5" fill="currentColor" />
                    <circle cx="10" cy="15" r="1.5" fill="currentColor" />
                  </svg>
                </div>
                <h3
                  :style="{
                    color: isFieldExpanded(fieldIndex)
                      ? currentSectionColor
                      : 'inherit',
                  }"
                >
                  {{ field.label || `Поле #${fieldIndex + 1}` }}
                  <span
                    class="field-header-arrow"
                    :class="{ expanded: isFieldExpanded(fieldIndex) }"
                  >
                    ›
                  </span>
                </h3>
                <button
                  v-if="
                    selectedPage && canDeleteField(selectedPage, fieldIndex)
                  "
                  @click.stop="confirmDeleteField(selectedPage, fieldIndex)"
                  class="btn btn-danger btn-small"
                >
                  Удалить
                </button>
              </div>

              <div
                class="field-form"
                :class="{ collapsed: !isFieldExpanded(fieldIndex) }"
              >
                <div class="form-group-con">
                  <div class="form-group">
                    <label>ID поля</label>
                    <input
                      v-model="field.id"
                      type="text"
                      placeholder="Уникальный идентификатор"
                    />
                  </div>

                  <div class="form-group">
                    <label>Тип поля</label>
                    <select
                      v-model="field.type"
                      @change="handleFieldTypeChange(field, fieldIndex)"
                    >
                      <option value="dropdown">Dropdown</option>
                      <option value="dropdown-multiply">Dropdown-multiply</option>
                      <option value="input">Input</option>
                      <option value="toggle">Toggle</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>Название</label>
                    <input
                      v-model="field.label"
                      type="text"
                      placeholder="Название поля"
                    />
                  </div>

                  <div v-if="field.type === 'dropdown' || field.type === 'dropdown-multiply'" class="form-group">
                    <label>Placeholder</label>
                    <input
                      v-model="field.placeholder"
                      type="text"
                      placeholder="Текст placeholder"
                    />
                  </div>

                  <div v-if="field.type === 'input'" class="form-group">
                    <label>Placeholder</label>
                    <input
                      v-model="field.placeholder"
                      type="text"
                      placeholder="Текст placeholder"
                    />
                  </div>

                  <div v-if="field.type === 'input'" class="form-group">
                    <label>Тип input</label>
                    <select v-model="field.inputType">
                      <option value="number">Number</option>
                      <option value="text">Text</option>
                    </select>
                  </div>

                  <div
                    v-if="
                      field.type === 'input' && field.inputType === 'number'
                    "
                    class="form-group"
                  >
                    <label>Минимум</label>
                    <input v-model.number="field.min" type="number" />
                  </div>

                  <div
                    v-if="
                      field.type === 'input' &&
                      field.id === 'quantity' &&
                      field.inputType === 'number'
                    "
                    class="form-group"
                    style="width: 100%"
                  >
                    <label>Пороги</label>
                    <input
                      :value="getThresholdsString(field)"
                      @input="(e) => handleThresholdsStringInput(field, e.target.value)"
                      type="text"
                      @blur="updateThresholds(fieldIndex)"
                    />
                    <small style="color: var(--grey); font-size: 11px; margin-top: 5px; display: block;">
                      через запятую, например: 5, 50, 100
                    </small>
                  </div>

                  <div v-if="field.type === 'toggle'" class="form-group">
                    <label>Цена</label>
                    <input v-model.number="field.price" type="number" />
                  </div>

                  <div v-if="field.type === 'toggle'" class="form-group">
                    <label>Tooltip</label>
                    <input
                      v-model="field.tooltip"
                      type="text"
                      placeholder="Подсказка"
                    />
                  </div>
                </div>

                <!-- Опции для dropdown и dropdown-multiply -->
                <div v-if="field.type === 'dropdown' || field.type === 'dropdown-multiply'" class="options-section">
                  <div class="options-header">
                    <label>Опции</label>
                    <button
                      v-if="selectedPage"
                      @click="addOption(selectedPage, fieldIndex)"
                      class="btn btn-small btn-plus"
                    >
                      + Добавить опцию
                    </button>
                  </div>

                  <div
                    v-for="(option, optionIndex) in field.options"
                    :key="optionIndex"
                    class="option-item"
                  >
                    <input
                      type="checkbox"
                      :checked="isDefaultOption(field, optionIndex)"
                      @change="setDefaultOption(fieldIndex, optionIndex)"
                      class="option-default-checkbox"
                    />
                    <input
                      v-model="option.label"
                      type="text"
                      placeholder="Название опции"
                      class="option-label"
                    />
                    <div class="option-price-wrapper" style="width: 30%; display: flex; flex-direction: column;">
                      <input
                        :value="getPriceStringForInput(option)"
                        @input="(e) => handlePriceStringInput(fieldIndex, optionIndex, e.target.value)"
                        @blur="(e) => handlePriceStringBlur(fieldIndex, optionIndex, e.target.value)"
                        type="text"
                        class="option-price"
                      />
 
                    </div>
                    <button
                      v-if="selectedPage"
                      @click="
                        confirmDeleteOption(
                          selectedPage,
                          fieldIndex,
                          optionIndex
                        )
                      "
                      class="btn btn-danger btn-small"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>

          <!-- Таблица цен для scan-print -->
          <div v-if="selectedPage === 'scan-print' && getPlotField" class="price-table-section">

            <div class="price-table-wrapper">
              <table class="price-table">
                <thead>
                  <tr class="price-table-controls-row">
                    <td :colspan="getPlotFieldOptionsCount + 1" style="padding: 15px; border: 1px solid #e0e0e0;">
                      <div style="display: flex; align-items: center; gap: 20px;">
                        <div class="price-table-switch">
                          <img 
                            class="tabl-color" 
                            :class="{ active: priceTableColorMode }"
                            src="/assets/svg/color.svg" 
                            alt=""
                            @click="priceTableColorMode = !priceTableColorMode"
                          /> 
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                          <select 
                            v-model="selectedFormat" 
                            class="price-table-format-select"
                          >
                            <option 
                              v-for="format in priceTableFormats" 
                              :key="format.value" 
                              :value="format.value"
                            >
                              {{ format.label }}
                            </option>
                          </select>
                          <button 
                            @click="addFormatOption" 
                            class="btn btn-small btn-plus"
                            style="white-space: nowrap;"
                          >
                            + Добавить
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th style="padding: 10px;">
 
                    </th>
                    <th v-for="option in getPlotFieldOptions" :key="option.label" style="padding: 10px; text-align: center;">
                      {{ option.label.replace(' г/м²', '') }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(label, qIndex) in quantityLabels" :key="qIndex">
                    <td style="padding: 10px; font-weight: 500; color: var(--green);">
                      {{ label }}
                    </td>
                    <td 
                      v-for="(option, oIndex) in getPlotFieldOptions" 
                      :key="oIndex"
                      style="padding: 5px;"
                    >
                      <input
                        type="number"
                        step="0.1"
                        :value="getPriceForDensityAndQuantity(option, qIndex)"
                        @input="(e) => handleDensityPriceChange(option, qIndex, e)"
                        class="price-table-input"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
      </div>

      <div class="admin-sidebar">
        <div class="admin-actions">
          <button
            @click="saveConfig"
            :disabled="saving"
            class="btn btn-primary"
          >
            {{ saving ? "Сохранение..." : "Сохранить" }}
          </button>
          <!-- <button
            @click="handleReload"
            :disabled="loading"
            :class="['btn-reload', { rotating: isReloading }]"
          >
            {{ loading ? "Загрузка..." : "" }}
            <img src="/assets/svg/reload.svg" alt="" />
          </button> -->
          <button @click="handleLogout" class="btn btn-logout">Выход</button>
        </div>
        <div class="section-con">
          <button
            class="btn"
            :class="{ active: selectedSection === 'printing' }"
            @click="selectSection('printing')"
            :style="{
              border:
                selectedSection === 'printing'
                  ? 'solid 1.5px var(--blue)'
                  : 'solid 1.5px transparent',
            }"
          >
            <img src="/img/main-btn/t.svg" alt="Типография" />
          </button>
          <button
            class="btn"
            :class="{ active: selectedSection === 'photo' }"
            @click="selectSection('photo')"
            :style="{
              border:
                selectedSection === 'photo'
                  ? 'solid 1.5px var(--red)'
                  : 'solid 1.5px transparent',
            }"
          >
            <img src="/img/main-btn/f.svg" alt="Фотопечать" />
          </button>
          <button
            class="btn"
            :class="{ active: selectedSection === 'gift' }"
            @click="selectSection('gift')"
            :style="{
              border:
                selectedSection === 'gift'
                  ? 'solid 1.5px var(--orange)'
                  : 'solid 1.5px transparent',
            }"
          >
            <img src="/img/main-btn/s.svg" alt="Сувениры" />
          </button>
          <button
            class="btn"
            :class="{ active: selectedSection === 'publish' }"
            @click="selectSection('publish')"
            :style="{
              border:
                selectedSection === 'publish'
                  ? 'solid 1.5px var(--green)'
                  : 'solid 1.5px transparent',
            }"
          >
            <img src="/img/main-btn/i.svg" alt="Издательство" />
          </button>
          <button
            class="btn"
            :class="{ active: selectedSection === 'engraver' }"
            @click="selectSection('engraver')"
            :style="{
              border:
                selectedSection === 'engraver'
                  ? 'solid 1.5px var(--blue_2)'
                  : 'solid 1.5px transparent',
            }"
          >
            <img src="/img/main-btn/g.svg" alt="Гравюровка" />
          </button>
        </div>

        <h2>Страницы ({{ sectionNames[selectedSection] }})</h2>
        <div class="page-list">
          <template v-if="Object.keys(filteredPages).length > 0">
            <button
              v-for="(name, key) in filteredPages"
              :key="key"
              @click="selectedPage = key"
              :class="['page-item', { active: selectedPage === key }]"
              :style="
                selectedPage === key
                  ? { background: currentSectionColor, color: 'white' }
                  : {}
              "
            >
              {{ name }}
              <span v-if="config[key]?.length" class="field-count">
                ({{ config[key]?.length }})
              </span>
            </button>
          </template>
          <div v-else class="empty-pages">
            <p>
              В разделе "{{ sectionNames[selectedSection] }}" пока нет страниц
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Модалка подтверждения удаления (вне контейнера для правильного z-index) -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="showDeleteModal"
        class="delete-modal"
        @click="closeDeleteModal"
      >
        <div class="delete-modal-content" @click.stop>
          <h3>Подтверждение удаления</h3>
          <p>
            {{
              deleteAction.message ||
              (deleteAction.type === "field"
                ? "Вы уверены, что хотите удалить это поле?"
                : deleteAction.type === "option"
                ? "Вы уверены, что хотите удалить эту опцию?"
                : "Вы уверены, что хотите удалить этот элемент?")
            }}
          </p>
          <div class="delete-modal-actions">
            <button @click="executeDelete" class="btn btn-danger">
              Удалить
            </button>
            <button @click="closeDeleteModal" class="btn btn-secondary">
              Отмена
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <Toast
    :message="toastMessage"
    :show="showToast"
    type="success"
    @close="closeToast"
  />

  <ExamplesModal
    :is-open="showExamplesModal"
    :examples="currentPageExamples"
    @close="closeExamplesModal"
  />
</template>

<style scoped>
.admin-container {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
}

.admin-header h1 {
  margin: 0;
  font-size: 24px;
}

.message {
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.message-success {
  background-color: transparent;
  color: var(--green);
}
.form-group-con {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
.message-error {
  background-color: #f8d7da;
  color: #721c24;
}

.admin-content {
  display: flex;
  gap: 20px;
  width: 100%;

  justify-content: space-between;
}

.admin-sidebar {
  background: transparent;
  padding: 0 20px;
  border-radius: 8px;
  height: fit-content;
  position: sticky;
  top: 20px;
  display: flex;
  flex-direction: column;
  height: 80vh;
  width: 25%;
  overflow: scroll;
}

.admin-actions {
  position: sticky;
  top: 0;
  background: #ffffff;
  padding: 10px 10px;
  margin: 0 0 20px 0;
  display: flex;
  z-index: 10;
  justify-content: space-around;
  border-radius: 10px;
  height: 7vh;
}

.admin-sidebar h2 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
}

.page-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  flex: 1;
  padding-right: 5px;
}

/* Стили для скроллбара page-list */
.page-list::-webkit-scrollbar {
  width: 6px;
}

.page-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.page-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.page-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}
.example-preview-btn-img {
  width: 20px;
}
.example-preview-btn {
  display: flex;
  gap: 5px;
}
.example-con button {
  padding: 2px 16px !important;
}
.example-preview-btn-img {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}
.example-preview-btn-img img {
  width: 20px;
}
.page-item {
  padding: 2px 10px;
  text-align: start;
  border: 0px solid var(--blue);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  background: transparent;
  color: var(--grey);
}

.page-item:hover {
  color: var(--blue);
}

/* .page-item.active стили теперь применяются динамически через :style */

.field-count {
  font-size: 12px;
  opacity: 0.7;
}
.btn-reload {
  background: transparent;
  border: none;
  cursor: pointer;
}

.btn-reload img {
  display: inline-block;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}

.btn-reload.rotating img {
  transform: rotate(360deg);
}

/* Плавное возвращение в исходное положение */
.btn-reload:not(.rotating) img {
  transform: rotate(0deg);
}
.admin-main {
  padding: 0px;
  border-radius: 8px;
  border: 0px solid #e0e0e0;
  width: 75%;
  height: 80vh;
  overflow: scroll;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 40px;
  border: 0px solid #e0e0e0;
  background: #ffffff;
  border-radius: 10px;
  height: 7vh;
  position: sticky;
  top: 0;
  z-index: 9;
  /* box-shadow: #00000010 0 10px 10px; */
}

.page-header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.makets-btn-con {
  display: flex;
  gap: 5px;
  border: 0px solid var(--grey);
  border-radius: 8px;
  padding: 2px;
  background: var(--back);
}

.makets-btn-con button {
  padding: 2px 16px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--grey);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.makets-btn-con button:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
}

.makets-btn-con button.active {
  background: var(--blue);
  color: white;
}

.makets-btn-con button.active:hover:not(:disabled) {
  background: #558dd5;
}

.makets-btn-con button:disabled {
  opacity: 0.5;
}

.example-con {
  display: flex;
  align-items: center;
  gap: 8px;
}

.example-con button {
  padding: 6px 16px;
  border: 1px solid var(--grey);
  border-radius: 6px;
  background: var(--white);
  color: var(--grey);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.example-con button:hover {
  background: var(--back);
  color: var(--blue);
  border-color: var(--blue);
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  display: flex;
  gap: 10px;
  width: 30%;
  line-height: 1;
  /* color теперь применяется динамически через :style */
}

.page-settings {
  display: flex;
  flex-direction: row !important;
  width: 110px !important;
  padding: 10px;
}
.page-settings img {
  height: 100%;
}
.page-settings input {
  width: 100%;
}

.empty-fields {
  text-align: center;
  padding: 60px 20px;
}

.empty-fields p {
  color: #999;
  margin-bottom: 20px;
}

.fields-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-flow: row;
  gap: 15px;
  width: 100%;
  align-items: start;
}

.fields-list > * {
  min-width: 0;
}

.field-card {
  border: 0px solid #ffffff;
  border-radius: 10px;
  padding: 0;
  background: transparent;
  width: 100%;
  position: relative;
  transition: opacity 0.2s ease;
}

.field-card.dragging {
  opacity: 0.5;
  cursor: grabbing;
}

.field-card.drag-over {
  border-top: 3px solid var(--blue);
  margin-top: 3px;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  padding: 5px 40px 5px 20px;
  border-radius: 10px;
  transition: background-color 0.2s;
  /* box-shadow: #00000010 0 10px 10px; */
  background: #ffffff;
  gap: 10px;
}

.field-drag-handle {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  color: var(--grey);
  padding: 2px;
  transition: color 0.2s ease, opacity 0.2s ease;
  user-select: none;
  opacity: 0.6;
}

.field-drag-handle:hover {
  color: var(--blue);
  opacity: 1;
}

.field-drag-handle:active {
  cursor: grabbing;
}

.field-header.expanded .field-drag-handle {
  opacity: 1;
}

.field-drag-handle {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  color: var(--grey);
  padding: 2px;
  transition: color 0.2s ease;
  user-select: none;
  opacity: 0.6;
}

.field-drag-handle:hover {
  color: var(--blue);
  opacity: 1;
}

.field-drag-handle:active {
  cursor: grabbing;
}

.field-header.expanded .field-drag-handle {
  opacity: 1;
}

/* .field-header.expanded h3 color теперь применяется динамически через :style */

.field-header h3 {
  margin: 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  font-weight: 500;
}

.field-header-arrow {
  display: inline-block;
  font-size: 20px;
  color: var(--grey);
  transition: transform 0.3s ease;
  transform: rotate(90deg);
  line-height: 1;
}

.field-header-arrow.expanded {
  transform: rotate(-90deg);
}

.field-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease, margin 0.3s ease;
  opacity: 1;
  justify-content: space-between;
  margin: 10px 20px;
  background: #fff;
  padding: 20px;
  border-radius: 10px;
}

.field-form.collapsed {
  max-height: 0;
  opacity: 0;
  margin: 0;
  padding: 0;
  gap: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 0;
  width: 48%;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select {
  padding: 2px 12px;
  border: 0px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  background: var(--back);
  color: var(--grey);
}

.options-section {
  border-top: 1px solid #e0e0e0;
  padding-top: 15px;
  margin-top: 10px;
}

.options-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.options-header label {
  font-size: 14px;
  font-weight: 500;
}

.option-item {
  display: flex;
  width: 100%;
  gap: 10px;
  align-items: center;
  padding: 0;
  background: transparent;
  border-radius: 4px;
  margin-bottom: 8px;
}

.option-default-checkbox {
  width: 14px;
  height: 14px;
  cursor: pointer;
  flex-shrink: 0;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  border: 1px solid var(--grey);
  border-radius: 50%;
  background: var(--white);
  transition: all 0.2s;
}

.option-default-checkbox:checked {
  background: var(--blue);
  border: 1px solid var(--blue);
}

.option-label {
  padding: 2px 10px;
  border: 0px solid #ddd;
  background: var(--white);
  border-radius: 4px;
  font-size: 12px;
  width: 100%;
  color: var(--grey);
}

.option-price {
  padding: 2px 10px;
  border: 0px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  background: var(--white);
  width: 100%;
  color: var(--grey);
}

.price-table-section {
  margin-top: 30px;
  padding: 0px;
  background: var(--white);
  border-radius: 8px;
  border: 0px solid #e0e0e0;
  overflow: hidden;
}

.price-table-wrapper {
  overflow-x: auto;
  width: 100%;
}

.price-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  background: white;
}

.price-table th {
  background: var(--white);
  border: 1px solid #e0e0e0;
  font-weight: 600;
  color: var(--blue);
  line-height: 1;
  padding: 0 10px;
  font-size: 14px;
}

.price-table td {
  border: 1px solid #e0e0e0;
  text-align: center;
}

.price-table-input {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
  background: white;
  color: var(--grey);
  transition: border-color 0.2s;
}

.price-table-input:focus {
  outline: none;
  border-color: var(--blue);
}

.price-table-controls-row {
  background: var(--white);
}

.price-table-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.tabl-color {
  width: 24px;
  height: 24px;
  cursor: pointer;
  transition: filter 0.3s;
  filter: grayscale(0%);
}

.tabl-color.active {
  filter: grayscale(100%);
}

.price-table-switch-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--grey);
  min-width: 40px;
}

.price-table-format-select {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  background: white;
  color: var(--grey);
  cursor: pointer;
  min-width: 120px;
}

.price-table-format-select:focus {
  outline: none;
  border-color: var(--blue);
}

.btn {
  padding: 2px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  font-weight: 500;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-plus {
  color: var(--green) !important;
  transition: var(--tran);
}
.btn-plus:hover {
  color: var(--white) !important;
  background: var(--green) !important;
}

.btn-primary {
  background: var(--green);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #4dc796;
}
.page-text-con {
  background: var(--white);
  border-radius: 8px;
  display: flex;
  gap: 10px;
  height: 10vh;
  justify-content: space-between;
  padding: 10px;
  transition: all 0.3s ease-in-out;
}
.page-text-con input {
  display: none;
}
.page-text-img-con-2 img {
  height: 40%;
  width: auto;
}
.page-text-img-con {
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease-in-out;
}
.page-text-text {
  background: var(--back);
  border: 0 solid #000;
  border-radius: 8px;
  color: var(--grey);
  font-size: 12px;
  padding: 10px 40px;
  resize: none;
  width: 100%;
}
.page-text-img-con-2 {
  align-items: center;
  background: #00000070;
  cursor: pointer;
  display: flex;
  height: 100%;
  justify-content: center;
  opacity: 0;
  position: absolute;
  width: 100%;
  z-index: 1;
}
.page-text-img-con img {
  height: 100%;
  -o-object-fit: cover;
  object-fit: cover;
  width: 100%;
}
.page-text-img-con-2 img {
  height: 40%;
  width: auto;
}
.page-text-img-con:hover .page-text-img-con-2 {
  opacity: 1;
}
.page-text-con:hover {
  height: 20vh;
}

.btn-secondary {
  background: transparent;
  color: var(--grey);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--grey);
  color: var(--white);
}
.btn-logout {
  color: var(--red);
  background: white;
}
.btn-logout:hover:not(:disabled) {
  background: var(--red);
  color: white;
}
.btn-exit {
  height: fit-content;
}
.btn-danger {
  background: var(--red);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: var(--red);
  color: white;
}

.btn-small {
  padding: 2px 12px;
  font-size: 12px;
  border-radius: 30px;
  color: var(--red);
  background: transparent;
}
.section-con {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin: 0 0 20px 0;
}
.section-con .btn {
  border: solid 1.5px transparent;
  padding: 5px;
  width: fit-content;
  height: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.empty-pages {
  padding: 20px;
  text-align: center;
  color: var(--grey);
  font-size: 14px;
}

.empty-pages p {
  margin: 0;
}
.page-text-btn-open{
    display: flex;
    padding: 10px 5px 5px 5px;
    justify-content: end;
    width: 100%;
  }
  .adm-btn-con{
    display: flex;
    gap:10px;
 
  }
  .adm-btn-con button{
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px 10px;
    cursor: pointer;
    border: none;
    /* border: solid 2px var(--blue); */
    border-radius: 5px; 
    background: var(--white);
    transition: var(--tran);
  }
  .adm-btn-con button:active{
    scale: 0.9;

  } 
  .adm-btn-con button.active{
    background: var(--blue);
  }
  .adm-btn-con button.active img{
    filter: brightness(0) invert(1);
  }

/* Планшеты */
@media (max-width: 1024px) {
  .admin-content {
    flex-direction: column;
    gap: 15px;
  }

  .admin-sidebar {
    position: static;
    width: 100%;
    height: auto;
    max-height: 50vh;
  }

  .admin-main {
    width: 100%;
    height: auto;
    max-height: 70vh;
  }

  .fields-list {
    grid-template-columns: 1fr;
  }
}

/* Мобильные устройства */
@media (max-width: 768px) {
  .admin-content {
    gap: 10px;
    flex-direction: column-reverse;
  }

  .admin-sidebar {
    width: 100%;
    padding: 0 10px;
    height: auto;
    max-height: 40vh;
    position: relative;
    top: 0;
  }

  .admin-actions {
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px;
    height: auto;
    min-height: auto;
    justify-content: center;
  }

  .admin-actions button {
    font-size: 12px;
    padding: 6px 12px;
    flex: 1;
    min-width: 100px;
  }

  .section-con {
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 15px;
  }

  .section-con .btn {
    font-size: 11px;
    padding: 4px 8px;
    flex: 1;
    min-width: 10%;
  }

  .page-list {
    max-height: 30vh;
  }

  .admin-main {
    width: 100%;
    height: auto;
    max-height: none;
    padding: 0;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 15px;
    height: auto;
    min-height: auto;
  }

  .page-header h2 {
    font-size: 16px;
    width: 100%;
    flex-wrap: wrap;
  }

  .page-header-actions {
    width: 100%;
    flex-direction: column;
    gap: 10px;
  }

  .page-settings {
    width: 100% !important;
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }

  .page-settings img {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  .page-settings input {
    flex: 1;
  }

  .fields-list {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .field-header {
    padding: 12px 15px;
    flex-wrap: wrap;
    gap: 10px;
  }
 
  .field-header h3 {
    font-size: 16px;
    flex: 1;
    min-width: 200px;
  }

  .field-header .btn-danger {
    font-size: 11px;
    padding: 4px 10px;
  }

  .field-form {
    margin: 8px 10px;
    padding: 15px;
  }

  .form-group-con {
    flex-direction: column;
    gap: 10px;
  }

  .form-group {
    width: 100% !important;
  }

  .option-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .option-label {
    width: 100%;
  }

  .option-price {
    width: 100%;
  }

  .btn {
    font-size: 12px;
    padding: 6px 15px;
  }

  .btn-small {
    font-size: 11px;
    padding: 4px 12px;
  }

  .empty-state,
  .empty-fields {
    padding: 40px 15px;
  }

  .empty-state p,
  .empty-fields p {
    font-size: 14px;
  }
}

/* Очень маленькие экраны */
@media (max-width: 480px) {
  .admin-sidebar {
    padding: 0 8px;
  }

  .admin-actions {
    padding: 6px;
  }

  .admin-actions button {
    font-size: 11px;
    padding: 5px 10px;
    min-width: 80px;
  }

  .section-con .btn {
    font-size: 10px;
    padding: 3px 6px;
  }

  .page-header {
    padding: 2px 10px;
    flex-direction: row;
    align-items: center;
  }

  .page-header h2 {
    font-size: 14px;
  }

  .field-header {
    padding: 10px 12px;
  }

  .field-header h3 {
    font-size: 14px;
  }

  .field-form {
    margin: 6px 8px;
    padding: 12px;
  }

  .form-group label {
    font-size: 12px;
  }

  .form-group input,
  .form-group select {
    font-size: 11px;
    padding: 4px 10px;
  }

  .btn {
    font-size: 11px;
    padding: 5px 12px;
  }

  .delete-modal-content {
    padding: 15px 20px;
    margin: 20px;
  }

  .delete-modal-content h3 {
    font-size: 18px;
  }

  .delete-modal-content p {
    font-size: 13px;
  }
}

/* Модалка подтверждения удаления */
.delete-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(3px);
  background: rgba(0, 0, 0, 0.3);
  pointer-events: auto;
}

.delete-modal-content {
  background: var(--white);
  border-radius: 10px;
  padding: 20px 40px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.delete-modal-content h3 {
  margin: 0 0 15px 0;
  font-size: 20px;
  color: var(--black);
}

.delete-modal-content p {
  margin: 0 0 25px 0;
  font-size: 14px;
  color: var(--grey);
}

.delete-modal-actions {
  display: flex;
  gap: 10px;
  justify-content: space-around;
}

/* Анимации модалки */
.modal-enter-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .delete-modal-content {
  animation: slideDown 0.3s ease-out;
}

.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-leave-active .delete-modal-content {
  animation: slideUp 0.3s ease-in;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
}

@keyframes slideDown {
  from {
    transform: translateY(-50px);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-50px);
  }
}
</style>
