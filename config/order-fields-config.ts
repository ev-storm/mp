// Единая конфигурация полей заказа для всех страниц
// Этот файл можно будет в дальнейшем интегрировать с админ-панелью

import type { OrderField } from "~/types/order-fields";

// Тип для ключа страницы
export type PageConfigKey =
  // Типография
  | "tracing" // Печать на кальке
  | "catalogs" // Брошюры и каталоги
  | "replication" // Тиражирование на ризографе
  | "scan" // Сканирование документа
  | "diplom" // Печать курсовых и дипломных работ
  | "booklet-laser" // Печать листовок и буклетов (лазерная)
  | "booklet-ofset" // Печать листовок и буклетов (офсетная)
  | "visit-card-laser" // Печать визиток (лазерная)
  | "visit-card-ofset" // Печать визиток (офсетная)
  | "visit-card-uf" // Печать визиток (УФ)
  | "stickers-print" // Наклейки и плоттерная резка
  | "plotter-paper" // Плоттерная бумага
  | "bind-plastic" // Переплет (пластик)
  | "bind-metal" // Переплет (металл)
  | "bind-hard" // Переплет (твердый)
  | "lamination-doc" // Ламинирование документов
  | "lamination-large" // Широкоформатное ламинирование
  | "large-print" // Широкоформатная печать
  | "large-scan" // Широкоформатное сканирование
  | "large-plan" // Печать чертежей
  | "scan-print" // Печать документа до А3
  // Фотопечать
  | "photo-test" // Тестовая страница фотопечати
  // Сувениры
  | "gift-test" // Тестовая страница сувениров
  // Издательство
  | "publish-test" // Тестовая страница издательства
  // Гравюровка
  | "engraver-test"; // Тестовая страница гравюровки

// Конфигурация полей для каждой страницы
export const orderFieldsConfig: Record<PageConfigKey, OrderField[]> = {
  // Печать на кальке
  tracing: [
    {
      id: "format",
      type: "dropdown",
      label: "Формат",
      placeholder: "Выберите формат",
      options: [
        { label: "А6 (105×148 мм)", price: 3 },
        { label: "А5 (148×210 мм)", price: 5 },
        { label: "А4 (210×297 мм)", price: 8 },
        { label: "А3 (297×420 мм)", price: 15 },
        { label: "Евро (99×210 мм)", price: 6 },
      ],
      value: null,
    },
    {
      id: "color",
      type: "dropdown",
      label: "Цвет печати",
      placeholder: "Выберите цвет печати",
      options: [
        { label: "Черно-белая", price: 0 },
        { label: "Цветная", price: 50 },
      ],
      value: null,
    },
    {
      id: "quantity",
      type: "input",
      label: "Тираж",
      placeholder: "Введите количество",
      inputType: "number",
      min: 1,
      value: null,
    },
  ],

  // Брошюры и каталоги
  catalogs: [
    {
      id: "paper",
      type: "dropdown",
      label: "Бумага",
      placeholder: "Выберите вплотность бумаги",
      options: [
        { label: "80 г/м²", price: 898989 },
        { label: "115 г/м²", price: 5 },
        { label: "130 г/м²", price: 10 },
        { label: "150 г/м²", price: 15 },
        { label: "170 г/м²", price: 20 },
        { label: "200 г/м²", price: 25 },
        { label: "250 г/м²", price: 35 },
        { label: "300 г/м²", price: 45 },
      ],
      value: null,
    },
    {
      id: "cover",
      type: "dropdown",
      label: "Вид обложки",
      placeholder: "Выберите тип обложки",
      options: [
        { label: "прозрачный пластик", price: 0 },
        { label: "матовый  пластик", price: 5 },
        { label: "плотная бумага", price: 10 },
      ],
      value: null,
    },
    {
      id: "bind",
      type: "dropdown",
      label: "Тип крепления",
      placeholder: "Выберите тип переплета",
      options: [
        { label: "скоба", price: 0 },
        { label: "клеевое", price: 5 },
      ],
      value: null,
    },
    {
      id: "format",
      type: "dropdown",
      label: "Формат",
      placeholder: "Выберите формат",
      options: [
        { label: "А6 (105×148 мм)", price: 3 },
        { label: "А5 (148×210 мм)", price: 5 },
        { label: "А4 (210×297 мм)", price: 8 },
        { label: "А3 (297×420 мм)", price: 15 },
        { label: "Евро (99×210 мм)", price: 6 },
      ],
      value: null,
    },
    {
      id: "quantity",
      type: "input",
      label: "Тираж",
      placeholder: "Введите количество",
      inputType: "number",
      min: 1,
      value: null,
    },
  ],

  // Тиражирование на ризографе
  replication: [
    {
      id: "format",
      type: "dropdown",
      label: "Формат",
      placeholder: "Выберите формат",
      options: [
        { label: "А6 (105×148 мм)", price: 333333333 },
        { label: "А5 (148×210 мм)", price: 5 },
        { label: "А4 (210×297 мм)", price: 8 },
        { label: "А3 (297×420 мм)", price: 15 },
        { label: "Евро (99×210 мм)", price: 6 },
      ],
      value: null,
    },
    {
      id: "sides",
      type: "dropdown",
      label: "Стороны",
      placeholder: "Выберите стороны печати",
      options: [
        { label: "Односторонняя", price: 0 },
        { label: "Двусторонняя", price: 100 },
      ],
      value: null,
    },
    {
      id: "color-paper",
      type: "dropdown",
      label: "Цвет бумаги",
      placeholder: "Выберите цвет бумаги",
      options: [
        { label: "Синий", price: 0 },
        { label: "Красный", price: 100 },
        { label: "Белый", price: 100 },
        { label: "Желтый", price: 100 },
      ],
      value: null,
    },
    {
      id: "quantity",
      type: "input",
      label: "Тираж",
      placeholder: "Введите количество",
      inputType: "number",
      min: 1,
      value: null,
    },
  ],

  // Сканирование документа
  scan: [
    {
      id: "format",
      type: "dropdown",
      label: "Формат",
      placeholder: "Выберите формат",
      options: [
        { label: "А6 (105×148 мм)", price: 3 },
        { label: "А5 (148×210 мм)", price: 5 },
        { label: "А4 (210×297 мм)", price: 8 },
        { label: "А3 (297×420 мм)", price: 15 },
        { label: "Евро (99×210 мм)", price: 6 },
      ],
      value: null,
    },
    {
      id: "color",
      type: "dropdown",
      label: "Цвет печати",
      placeholder: "Выберите цвет печати",
      options: [
        { label: "Черно-белая", price: 0 },
        { label: "Цветная", price: 50 },
      ],
      value: null,
    },
    {
      id: "quantity",
      type: "input",
      label: "Тираж",
      placeholder: "Введите количество",
      inputType: "number",
      min: 1,
      value: null,
    },
    {
      id: "sides",
      type: "dropdown",
      label: "Стороны",
      placeholder: "Выберите стороны печати",
      options: [
        { label: "Односторонняя", price: 0 },
        { label: "Двусторонняя", price: 100 },
      ],
      value: null,
    },
    {
      id: "scan-type",
      type: "dropdown",
      label: "Вид сканирования",
      placeholder: "Cкорость сканирования",
      options: [
        { label: "Автоподачик", price: 200 },
        { label: "Потоковая", price: 100 },
      ],
      value: null,
    },
    {
      id: "TextVue",
      type: "toggle",
      label: "Разпознования текста",
      tooltip: "Разпознования текста...",
      price: 300,
      value: false,
    },
  ],

  // Печать курсовых и дипломных работ
  diplom: [
    {
      id: "paper",
      type: "dropdown",
      label: "Бумага",
      placeholder: "Выберите вплотность бумаги",
      options: [
        { label: "80 г/м²", price: 0 },
        { label: "115 г/м²", price: 5 },
        { label: "130 г/м²", price: 10 },
        { label: "150 г/м²", price: 15 },
        { label: "170 г/м²", price: 20 },
        { label: "200 г/м²", price: 25 },
        { label: "250 г/м²", price: 35 },
        { label: "300 г/м²", price: 45 },
      ],
      value: null,
    },
    {
      id: "format",
      type: "dropdown",
      label: "Формат",
      placeholder: "Выберите формат",
      options: [
        { label: "А6 (105×148 мм)", price: 3 },
        { label: "А5 (148×210 мм)", price: 5 },
        { label: "А4 (210×297 мм)", price: 8 },
        { label: "А3 (297×420 мм)", price: 15 },
        { label: "Евро (99×210 мм)", price: 6 },
      ],
      value: null,
    },
    {
      id: "quantity",
      type: "input",
      label: "Тираж",
      placeholder: "Введите количество",
      inputType: "number",
      min: 1,
      value: null,
    },
  ],

  // Заглушки для страниц, которые еще не созданы
  "booklet-laser": [],
  "booklet-ofset": [],
  "visit-card-laser": [],
  "visit-card-ofset": [],
  "visit-card-uf": [],
  "stickers-print": [],
  "plotter-paper": [],
  "bind-plastic": [],
  "bind-metal": [],
  "bind-hard": [],
  "lamination-doc": [],
  "lamination-large": [],
  "large-print": [],
  "large-scan": [],
  "large-plan": [],
  "scan-print": [],

  // Фотопечать
  "photo-test": [
    {
      id: "format",
      type: "dropdown",
      label: "Формат",
      placeholder: "Выберите формат",
      options: [
        { label: "10×15 см", price: 10 },
        { label: "15×20 см", price: 20 },
        { label: "20×30 см", price: 30 },
        { label: "30×40 см", price: 50 },
      ],
      value: null,
    },
    {
      id: "paper-type",
      type: "dropdown",
      label: "Тип бумаги",
      placeholder: "Выберите тип бумаги",
      options: [
        { label: "Глянцевая", price: 0 },
        { label: "Матовая", price: 5 },
        { label: "Сатиновая", price: 10 },
      ],
      value: null,
    },
    {
      id: "quantity",
      type: "input",
      label: "Количество",
      placeholder: "Введите количество",
      inputType: "number",
      min: 1,
      value: null,
    },
  ],

  // Сувениры
  "gift-test": [
    {
      id: "product-type",
      type: "dropdown",
      label: "Тип продукта",
      placeholder: "Выберите тип продукта",
      options: [
        { label: "Кружка", price: 300 },
        { label: "Футболка", price: 500 },
        { label: "Брелок", price: 150 },
        { label: "Магнит", price: 100 },
      ],
      value: null,
    },
    {
      id: "size",
      type: "dropdown",
      label: "Размер",
      placeholder: "Выберите размер",
      options: [
        { label: "S", price: 0 },
        { label: "M", price: 50 },
        { label: "L", price: 100 },
        { label: "XL", price: 150 },
      ],
      value: null,
    },
    {
      id: "quantity",
      type: "input",
      label: "Количество",
      placeholder: "Введите количество",
      inputType: "number",
      min: 1,
      value: null,
    },
  ],

  // Издательство
  "publish-test": [
    {
      id: "book-type",
      type: "dropdown",
      label: "Тип издания",
      placeholder: "Выберите тип издания",
      options: [
        { label: "Книга", price: 500 },
        { label: "Журнал", price: 300 },
        { label: "Каталог", price: 400 },
        { label: "Брошюра", price: 200 },
      ],
      value: null,
    },
    {
      id: "pages",
      type: "input",
      label: "Количество страниц",
      placeholder: "Введите количество страниц",
      inputType: "number",
      min: 1,
      value: null,
    },
    {
      id: "binding",
      type: "dropdown",
      label: "Переплет",
      placeholder: "Выберите тип переплета",
      options: [
        { label: "Мягкий", price: 0 },
        { label: "Твердый", price: 500 },
        { label: "Скрепка", price: 50 },
      ],
      value: null,
    },
    {
      id: "quantity",
      type: "input",
      label: "Тираж",
      placeholder: "Введите тираж",
      inputType: "number",
      min: 1,
      value: null,
    },
  ],

  // Гравюровка
  "engraver-test": [
    {
      id: "service-type",
      type: "dropdown",
      label: "Тип услуги",
      placeholder: "Выберите тип услуги",
      options: [
        { label: "Печати и штампы", price: 500 },
        { label: "Лазерная гравировка", price: 800 },
        { label: "Шильдики", price: 300 },
        { label: "Пломбиры", price: 600 },
        { label: "Термоклеймо", price: 400 },
      ],
      value: null,
    },
    {
      id: "material",
      type: "dropdown",
      label: "Материал",
      placeholder: "Выберите материал",
      options: [
        { label: "Резина", price: 0 },
        { label: "Металл", price: 200 },
        { label: "Пластик", price: 100 },
      ],
      value: null,
    },
    {
      id: "quantity",
      type: "input",
      label: "Количество",
      placeholder: "Введите количество",
      inputType: "number",
      min: 1,
      value: null,
    },
  ],
};

// Кэш для загруженной конфигурации
let cachedConfig: Record<PageConfigKey, OrderField[]> | null = null;

const STORAGE_KEY = "order-fields-config";

/**
 * Загрузить конфигурацию из localStorage или использовать дефолтную
 */
function loadConfig(): Record<PageConfigKey, OrderField[]> {
  // Если есть кэш, используем его
  if (cachedConfig) {
    return cachedConfig;
  }

  // Всегда начинаем с дефолтной конфигурации
  let loadedConfig: Record<PageConfigKey, OrderField[]> = {
    ...orderFieldsConfig,
  };

  // Пытаемся загрузить из localStorage (только в браузере)
  if (
    import.meta.client &&
    typeof window !== "undefined" &&
    window.localStorage
  ) {
    try {
      const savedConfig = localStorage.getItem(STORAGE_KEY);
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        // Валидируем, что это объект
        if (parsedConfig && typeof parsedConfig === "object") {
          // Мерджим сохраненную конфигурацию с дефолтной
          // Это гарантирует, что новые страницы будут доступны
          loadedConfig = {
            ...orderFieldsConfig, // Дефолтная конфигурация (включая новые страницы)
            ...parsedConfig, // Сохраненные изменения перезапишут дефолтные
          };
        }
      }
    } catch (error) {
      console.warn(
        "Не удалось загрузить конфигурацию из localStorage, используем дефолтную:",
        error
      );
    }
  }

  cachedConfig = loadedConfig;
  return loadedConfig;
}

/**
 * Сохранить конфигурацию в localStorage
 */
export function saveConfigToStorage(
  config: Record<PageConfigKey, OrderField[]>
): boolean {
  if (
    import.meta.client &&
    typeof window !== "undefined" &&
    window.localStorage
  ) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      // Обновляем кэш
      cachedConfig = { ...config };
      return true;
    } catch (error) {
      console.error("Ошибка сохранения конфигурации в localStorage:", error);
      return false;
    }
  }
  return false;
}

/**
 * Получить конфигурацию полей для страницы
 * @param key - ключ страницы
 * @returns копия конфигурации полей (чтобы не изменять оригинал)
 */
export function getOrderFieldsConfig(key: PageConfigKey): OrderField[] {
  const config = loadConfig();
  const pageConfig = config[key];

  if (!pageConfig || pageConfig.length === 0) {
    console.warn(
      `Конфигурация для ключа "${key}" не найдена. Возвращаю пустой массив.`
    );
    return [];
  }

  // Создаем глубокую копию, чтобы не изменять оригинальную конфигурацию
  return JSON.parse(JSON.stringify(pageConfig)) as OrderField[];
}

/**
 * Синхронная версия для совместимости
 * @deprecated Используйте getOrderFieldsConfig
 */
export function getOrderFieldsConfigSync(key: PageConfigKey): OrderField[] {
  return getOrderFieldsConfig(key);
}

/**
 * Сбросить кэш конфигурации (для обновления после сохранения)
 */
export function clearConfigCache() {
  cachedConfig = null;
}

/**
 * Метаданные страниц (срок изготовления и другие параметры)
 */
export interface PageMeta {
  productionDays?: number; // Количество дней для изготовления
}

const META_STORAGE_KEY = "order-fields-meta";
let cachedMeta: Record<PageConfigKey, PageMeta> | null = null;

/**
 * Получить метаданные страницы
 * Всегда читает из localStorage для получения актуальных данных
 */
export function getPageMeta(key: PageConfigKey): PageMeta {
  // Всегда читаем из localStorage для получения актуальных данных
  if (
    import.meta.client &&
    typeof window !== "undefined" &&
    window.localStorage
  ) {
    try {
      const savedMeta = localStorage.getItem(META_STORAGE_KEY);
      if (savedMeta) {
        const parsedMeta = JSON.parse(savedMeta);
        if (parsedMeta && typeof parsedMeta === "object") {
          const meta = parsedMeta as Record<PageConfigKey, PageMeta>;
          if (meta[key]) {
            return meta[key];
          }
        }
      }
    } catch (error) {
      console.warn("Не удалось загрузить метаданные страниц:", error);
    }
  }

  // Возвращаем дефолтные метаданные
  return { productionDays: 1 };
}

/**
 * Сбросить кэш метаданных
 */
export function clearMetaCache() {
  cachedMeta = null;
}

/**
 * Получить ключ страницы по маршруту
 * @param routePath - путь маршрута (например, "/printing/tracing")
 * @returns ключ конфигурации или null
 */
export function getPageConfigKeyFromRoute(
  routePath: string
): PageConfigKey | null {
  // Маппинг путей к ключам конфигурации
  const routeToKeyMap: Record<string, PageConfigKey> = {
    "/printing/tracing": "tracing",
    "/printing/catalogs": "catalogs",
    "/printing/replication": "replication",
    "/printing/scan": "scan",
    "/printing/diplom": "diplom",
    "/printing/booklet/laser-print": "booklet-laser",
    "/printing/booklet/ofset-print": "booklet-ofset",
    "/printing/visit-card/laser-print": "visit-card-laser",
    "/printing/visit-card/ofset-print": "visit-card-ofset",
    "/printing/visit-card/uf-print": "visit-card-uf",
    "/printing/stickers/stickers-print": "stickers-print",
    "/printing/stickers/plotter-paper": "plotter-paper",
    "/printing/bind/plastic": "bind-plastic",
    "/printing/bind/metal": "bind-metal",
    "/printing/bind/hard": "bind-hard",
    "/printing/lamination/doc": "lamination-doc",
    "/printing/lamination/large": "lamination-large",
    "/printing/large/print": "large-print",
    "/printing/large/scan": "large-scan",
    "/printing/large/plan": "large-plan",
    "/printing/scan/print": "scan-print",
    // Фотопечать
    "/photo/test": "photo-test",
    // Сувениры
    "/gift/test": "gift-test",
    // Издательство
    "/publish/test": "publish-test",
    // Гравюровка
    "/engraver/test": "engraver-test",
  };

  return routeToKeyMap[routePath] || null;
}
