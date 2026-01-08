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
        // Также сохраняем в localStorage как кэш
        saveConfigToStorage(loadedConfig);

        // Загружаем метаданные с сервера
        if (response.meta && typeof response.meta === "object") {
          Object.assign(pageMeta, response.meta);
        }
      }
    } catch (apiError) {
      // Если не удалось загрузить с сервера, используем localStorage как fallback
      console.warn(
        "Не удалось загрузить с сервера, используем localStorage:",
        apiError
      );
      const STORAGE_KEY = "order-fields-config";

      if (typeof window !== "undefined" && window.localStorage) {
        const savedConfig = localStorage.getItem(STORAGE_KEY);
        if (savedConfig) {
          try {
            const parsed = JSON.parse(savedConfig);
            if (parsed && typeof parsed === "object") {
              // Мерджим сохраненную конфигурацию с дефолтной
              loadedConfig = { ...orderFieldsConfig }; // Начинаем с дефолтной

              // Применяем сохраненные изменения только если они не пустые
              for (const key in parsed) {
                const pageKey = key as PageConfigKey;
                const savedFields = parsed[pageKey];

                // Если сохраненная конфигурация существует и не пустая, используем её
                if (Array.isArray(savedFields) && savedFields.length > 0) {
                  loadedConfig[pageKey] = savedFields;
                } else if (
                  Array.isArray(savedFields) &&
                  savedFields.length === 0
                ) {
                  // Если сохраненная конфигурация пустая, но в дефолтной есть поля - используем дефолтную
                  if (
                    !orderFieldsConfig[pageKey] ||
                    orderFieldsConfig[pageKey].length === 0
                  ) {
                    loadedConfig[pageKey] = [];
                  }
                  // Иначе оставляем дефолтную (она уже в loadedConfig)
                }
              }
            }
          } catch {
            // В случае ошибки используем только дефолтную конфигурацию
            loadedConfig = { ...orderFieldsConfig };
          }
        }
      }
    }

    // Убеждаемся, что все ключи из дефолтной конфигурации присутствуют
    // и правильно инициализированы в реактивном объекте
    // Используем явное присваивание для каждого ключа, чтобы сохранить реактивность
    for (const key in loadedConfig) {
      const pageKey = key as PageConfigKey;
      const fields = loadedConfig[pageKey] || [];

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

    // Загружаем метаданные страниц из localStorage
    const META_STORAGE_KEY = "order-fields-meta";
    if (typeof window !== "undefined" && window.localStorage) {
      const savedMeta = localStorage.getItem(META_STORAGE_KEY);
      if (savedMeta) {
        try {
          const parsedMeta = JSON.parse(savedMeta);
          if (parsedMeta && typeof parsedMeta === "object") {
            Object.assign(pageMeta, parsedMeta);
          }
        } catch (error) {
          // Игнорируем ошибку загрузки метаданных
        }
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
      configToSave[pageKey] = JSON.parse(JSON.stringify(config[pageKey] || []));
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
        } as any
      );

      if (response.success) {
        // Также сохраняем в localStorage как fallback/кэш
        saveConfigToStorage(configToSave);

        // Сохраняем метаданные страниц
        const META_STORAGE_KEY = "order-fields-meta";
        if (typeof window !== "undefined" && window.localStorage) {
          try {
            localStorage.setItem(META_STORAGE_KEY, JSON.stringify(pageMeta));
            // Генерируем кастомное событие для обновления метаданных на страницах
            const event = new CustomEvent("pageMetaUpdated", {
              detail: { pageMeta },
            });
            window.dispatchEvent(event);
          } catch (error) {
            // Игнорируем ошибку сохранения метаданных
          }
        }

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
      // Fallback: сохраняем только в localStorage, если API недоступен
      console.warn(
        "API недоступен, сохраняем только в localStorage:",
        apiError
      );
      const success = saveConfigToStorage(configToSave);

      if (!success) {
        throw new Error("Ошибка сохранения в localStorage");
      }

      // Сохраняем метаданные
      const META_STORAGE_KEY = "order-fields-meta";
      if (typeof window !== "undefined" && window.localStorage) {
        try {
          localStorage.setItem(META_STORAGE_KEY, JSON.stringify(pageMeta));
          const event = new CustomEvent("pageMetaUpdated", {
            detail: { pageMeta },
          });
          window.dispatchEvent(event);
        } catch (error) {
          // Игнорируем ошибку
        }
      }

      toastMessage.value = "Сохранено локально. API недоступен";
      showToast.value = true;
    }
  } catch (error: any) {
    message.value = {
      type: "error",
      text: `Ошибка сохранения: ${error.message || "Неизвестная ошибка"}`,
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

// Показать модалку для удаления поля
const confirmDeleteField = (pageKey: PageConfigKey, index: number) => {
  confirmDelete("field", pageKey, index);
};

// Выполнить удаление (после подтверждения)
const executeDelete = () => {
  const { type, pageKey, fieldIndex, optionIndex } = deleteAction.value;

  if (!pageKey || fieldIndex === null) {
    closeDeleteModal();
    return;
  }

  if (type === "field") {
    // Удалить поле
    if (config[pageKey]) {
      config[pageKey].splice(fieldIndex, 1);
    }
  } else if (type === "option" && optionIndex !== null) {
    // Удалить опцию
    const field = config[pageKey]?.[fieldIndex];
    if (field && field.type === "dropdown") {
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
    if (field.value === null || field.value === undefined) field.value = null;
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
  }
};

// Добавить опцию в dropdown
const addOption = (pageKey: PageConfigKey, fieldIndex: number) => {
  const field = config[pageKey]?.[fieldIndex];
  if (field && field.type === "dropdown") {
    field.options.push({ label: "Новая опция", price: 0 });
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

// Переключить состояние карточки поля
const toggleFieldCard = (fieldIndex: number) => {
  if (expandedFields.value.has(fieldIndex)) {
    expandedFields.value.delete(fieldIndex);
  } else {
    expandedFields.value.add(fieldIndex);
  }
};

// Проверить, открыта ли карточка
const isFieldExpanded = (fieldIndex: number) => {
  return expandedFields.value.has(fieldIndex);
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

          <!-- Настройки страницы -->

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
            >
              <div
                class="field-header"
                :class="{ expanded: isFieldExpanded(fieldIndex) }"
                @click="toggleFieldCard(fieldIndex)"
              >
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
                  v-if="selectedPage"
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

                  <div v-if="field.type === 'dropdown'" class="form-group">
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

                <!-- Опции для dropdown -->
                <div v-if="field.type === 'dropdown'" class="options-section">
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
                      v-model="option.label"
                      type="text"
                      placeholder="Название опции"
                      class="option-label"
                    />
                    <input
                      v-model.number="option.price"
                      type="number"
                      placeholder="Цена"
                      class="option-price"
                    />
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
  /* box-shadow: #00000010 0 10px 10px; */
}

.page-header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  display: flex;
  gap: 10px;
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
  padding: 5px 40px;
  border-radius: 10px;
  transition: background-color 0.2s;
  /* box-shadow: #00000010 0 10px 10px; */
  background: #ffffff;
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

.option-label {
  padding: 2px 10px;
  border: 0px solid #ddd;
  background: var(--back);
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
  background: var(--back);
  width: 30%;
  color: var(--grey);
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
  margin: 10px 0;
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
  height: 30vh;
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
