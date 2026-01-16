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
   
  ],

  // Брошюры и каталоги
  catalogs: [
    
  ],

  // Тиражирование на ризографе
  replication: [
   
  ],

  // Сканирование документа
  scan: [
   
  ],

  // Печать курсовых и дипломных работ
  diplom: [
   
  ],

  // Печать листовок и буклетов (лазерная)
  "booklet-laser": [
    
  ],

  // Печать листовок и буклетов (офсетная)
  "booklet-ofset": [
   
  ],

  // Печать визиток (лазерная)
  "visit-card-laser": [
    
  ],

  // Печать визиток (офсетная)
  "visit-card-ofset": [
   
  ],

  // Печать визиток (УФ)
  "visit-card-uf": [
   
  ],

  // Наклейки и плоттерная резка
  "stickers-print": [
   
  ],

  // Плоттерная бумага
  "plotter-paper": [
   
  ],

  // Переплет (пластик)
  "bind-plastic": [
   
  ],

  // Переплет (металл)
  "bind-metal": [
    
  ],

  // Переплет (твердый)
  "bind-hard": [
    
  ],

  // Ламинирование документов
  "lamination-doc": [
   
  ],

  // Широкоформатное ламинирование
  "lamination-large": [
   
  ],

  // Широкоформатная печать
  "large-print": [
  
  ],

  // Широкоформатное сканирование
  "large-scan": [
  
  ],

  // Печать чертежей
  "large-plan": [
   
  ],

  // Печать документа до А3
  "scan-print": [
   
  ],

  // Фотопечать
  "photo-test": [
  
  ],

  // Сувениры
  "gift-test": [
   
  ],

  // Издательство
  "publish-test": [
   
  ],

  // Гравюровка
  "engraver-test": [
    
  ],
};

/**
 * Получить конфигурацию полей для страницы
 * @param key - ключ страницы
 * @returns копия конфигурации полей (чтобы не изменять оригинал)
 */
export function getOrderFieldsConfig(key: PageConfigKey): OrderField[] {
  const pageConfig = orderFieldsConfig[key];

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
 * Заглушка: сохранение конфигурации в localStorage отключено.
 * Оставлено для совместимости, всегда возвращает false и ничего не пишет.
 */
export function saveConfigToStorage(
  _config: Record<PageConfigKey, OrderField[]>
): boolean {
  // Нам больше не нужно локальное сохранение конфигурации.
  return false;
}

/**
 * Метаданные страниц (срок изготовления и другие параметры)
 */
export interface PageMeta {
  productionDays?: number; // Количество дней для изготовления
  description?: string; // Текст описания для страницы (отображается в .tab-order-name p)
  imageUrl?: string; // URL изображения для страницы (отображается в .tab-option-img img)
  showMacketButton?: boolean; // Показывать ли кнопку загрузки макета (tab-order-macket)
  showDesignButton?: boolean; // Показывать ли кнопку заказа дизайна (tab-order-macket-des)
  examples?: string[]; // Массив URL изображений примеров работ
}

/**
 * Получить метаданные страницы
 * Сейчас метаданные по умолчанию минимальные и не читаются из localStorage.
 * Актуальные метаданные берутся на клиенте через API `/api/order-fields-config`.
 */
export function getPageMeta(key: PageConfigKey): PageMeta {
  // Базовое значение по умолчанию; реальные данные приходят с сервера.
  return { productionDays: 1 };
}

/**
 * Сброс кэша больше не требуется, оставлено для совместимости.
 */
export function clearMetaCache() {
  // no-op
}

/**
 * Сбросить кэш конфигурации (для обновления после сохранения)
 * Сейчас конфигурация берётся напрямую из `orderFieldsConfig`,
 * поэтому функция ничего не делает и оставлена для совместимости.
 */
export function clearConfigCache() {
  // no-op
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
