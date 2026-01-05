import { ref, computed } from "vue";

// Типы для элементов меню
export interface MenuItem {
  id: string;
  text: string;
  category: string;
  categoryKey: string;
  link?: string;
}

// Данные меню
const menuItems: MenuItem[] = [
  // Типография
  {
    id: "t1",
    text: "Сканирование документа до А3",
    category: "Типография",
    categoryKey: "typography",
    link: "/printing/scan",
  },
  {
    id: "t2",
    text: "Широкоформатное сканирование",
    category: "Типография",
    categoryKey: "typography",
    link: "/printing/large/scan",
  },
  {
    id: "t3",
    text: "Печать и копирование до А3",
    category: "Типография",
    categoryKey: "typography",
    link: "/printing/scan/print",
  },
  {
    id: "t4",
    text: "Широкоформатная печать",
    category: "Типография",
    categoryKey: "typography",
    link: "/printing/large/print",
  },
  {
    id: "t5",
    text: "Печать листовок и буклетов",
    category: "Типография",
    categoryKey: "typography",
    link: "/printing/booklet/laser-print",
  },
  {
    id: "t6",
    text: "Печать визиток",
    category: "Типография",
    categoryKey: "typography",
    link: "/printing/visit-card/laser-print",
  },
  {
    id: "t7",
    text: "Печать брошюр и книг",
    category: "Типография",
    categoryKey: "typography",
    link: "/printing/catalogs",
  },
  {
    id: "t8",
    text: "Печать наклеек",
    category: "Типография",
    categoryKey: "typography",
    link: "/printing/stickers/stickers-print",
  },
  {
    id: "t9",
    text: "Печать курсовых и дипломных работ",
    category: "Типография",
    categoryKey: "typography",
    link: "/printing/diplom",
  },
  {
    id: "t10",
    text: "Печать черчежей",
    category: "Типография",
    categoryKey: "typography",
    link: "/printing/large/plan",
  },
  {
    id: "t11",
    text: "Печать на кальке",
    category: "Типография",
    categoryKey: "typography",
    link: "/printing/tracing",
  },
  {
    id: "t12",
    text: "Ламинирование документов",
    category: "Типография",
    categoryKey: "typography",
    link: "/printing/lamination/doc",
  },
  {
    id: "t13",
    text: "Широкоформатное ламинирование",
    category: "Типография",
    categoryKey: "typography",
    link: "/printing/lamination/large",
  },
  {
    id: "t14",
    text: "Переплет на металлическую пружину",
    category: "Типография",
    categoryKey: "typography",
    link: "/printing/bind/metal",
  },
  {
    id: "t15",
    text: "Переплет на пластиковую пружину",
    category: "Типография",
    categoryKey: "typography",
    link: "/printing/bind/plastic",
  },
  {
    id: "t16",
    text: "Твердый переплет",
    category: "Типография",
    categoryKey: "typography",
    link: "/printing/bind/hard",
  },
  {
    id: "t17",
    text: "Офсетная печать",
    category: "Типография",
    categoryKey: "typography",
  },
  {
    id: "t18",
    text: "Тиснение фольгой",
    category: "Типография",
    categoryKey: "typography",
  },
  {
    id: "t19",
    text: "Тиражирование на ризографе",
    category: "Типография",
    categoryKey: "typography",
    link: "/printing/replication",
  },

  // Фотопечать
  {
    id: "f1",
    text: "Печать фото",
    category: "Фотопечать",
    categoryKey: "photoprint",
  },
  {
    id: "f2",
    text: "Мгновенное фото на документы",
    category: "Фотопечать",
    categoryKey: "photoprint",
  },
  {
    id: "f3",
    text: "Предметная фотосъёмка",
    category: "Фотопечать",
    categoryKey: "photoprint",
  },
  {
    id: "f4",
    text: "Реставрация Фотографий",
    category: "Фотопечать",
    categoryKey: "photoprint",
  },
  {
    id: "f5",
    text: "Сканирование пленок",
    category: "Фотопечать",
    categoryKey: "photoprint",
  },
  {
    id: "f6",
    text: "Печать на CD/DVD",
    category: "Фотопечать",
    categoryKey: "photoprint",
  },
  {
    id: "f7",
    text: "Фотокниги",
    category: "Фотопечать",
    categoryKey: "photoprint",
  },
  {
    id: "f8",
    text: 'Транспарант "Бессмертный Полк"',
    category: "Фотопечать",
    categoryKey: "photoprint",
  },
  {
    id: "f9",
    text: "Багетная мастерская",
    category: "Фотопечать",
    categoryKey: "photoprint",
  },

  // Сувениры
  {
    id: "s1",
    text: "Календари",
    category: "Сувениры",
    categoryKey: "souvenirs",
  },
  {
    id: "s2",
    text: "Магниты на холодильник",
    category: "Сувениры",
    categoryKey: "souvenirs",
  },
  {
    id: "s3",
    text: "Печать фото на кружках",
    category: "Сувениры",
    categoryKey: "souvenirs",
  },
  {
    id: "s4",
    text: "Распечатка конвертов",
    category: "Сувениры",
    categoryKey: "souvenirs",
  },
  {
    id: "s5",
    text: "Печать на одежде",
    category: "Сувениры",
    categoryKey: "souvenirs",
  },
  {
    id: "s6",
    text: "Вышивка на одежде",
    category: "Сувениры",
    categoryKey: "souvenirs",
  },
  {
    id: "s7",
    text: "Изготовление этикеток на одежду",
    category: "Сувениры",
    categoryKey: "souvenirs",
  },
  {
    id: "s8",
    text: "Пластиковые папки и пакеты",
    category: "Сувениры",
    categoryKey: "souvenirs",
  },
  {
    id: "s9",
    text: "Изготовление значков",
    category: "Сувениры",
    categoryKey: "souvenirs",
  },
  {
    id: "s10",
    text: "Пенокартон",
    category: "Сувениры",
    categoryKey: "souvenirs",
  },
  {
    id: "s11",
    text: "Тампопечать",
    category: "Сувениры",
    categoryKey: "souvenirs",
  },
  {
    id: "s12",
    text: "Печать на металле",
    category: "Сувениры",
    categoryKey: "souvenirs",
  },

  // Издательство
  {
    id: "i1",
    text: "Набор текста (в том числе рукописного)",
    category: "Издательство",
    categoryKey: "publishing",
  },
  {
    id: "i2",
    text: "Корректура",
    category: "Издательство",
    categoryKey: "publishing",
  },
  {
    id: "i3",
    text: "Редакторская правка",
    category: "Издательство",
    categoryKey: "publishing",
  },
  {
    id: "i4",
    text: "Спуск полос",
    category: "Издательство",
    categoryKey: "publishing",
  },
  {
    id: "i5",
    text: "Полиграфическая верстка любой сложности",
    category: "Издательство",
    categoryKey: "publishing",
  },
  {
    id: "i6",
    text: "Авторам",
    category: "Издательство",
    categoryKey: "publishing",
  },
  {
    id: "i7",
    text: "Термоклеевое скрепление",
    category: "Издательство",
    categoryKey: "publishing",
  },

  // Гравировка
  {
    id: "g1",
    text: "Типографское клише",
    category: "Гравировка",
    categoryKey: "engraving",
  },
  {
    id: "g2",
    text: "Печати и штампы",
    category: "Гравировка",
    categoryKey: "engraving",
  },
  {
    id: "g3",
    text: "Лазерная гравировка",
    category: "Гравировка",
    categoryKey: "engraving",
  },
  {
    id: "g4",
    text: "Шильдики",
    category: "Гравировка",
    categoryKey: "engraving",
  },
  {
    id: "g5",
    text: "Гравированные таблички",
    category: "Гравировка",
    categoryKey: "engraving",
  },
  {
    id: "g6",
    text: "Гравировка на свадебных замках",
    category: "Гравировка",
    categoryKey: "engraving",
  },
  {
    id: "g7",
    text: "Гравировка на личных жетонах",
    category: "Гравировка",
    categoryKey: "engraving",
  },
  {
    id: "g8",
    text: "Термоклеймо",
    category: "Гравировка",
    categoryKey: "engraving",
  },
  {
    id: "g9",
    text: "Пломбиры",
    category: "Гравировка",
    categoryKey: "engraving",
  },
  {
    id: "g10",
    text: "Клише для тиснения на коже",
    category: "Гравировка",
    categoryKey: "engraving",
  },
  {
    id: "g11",
    text: "Клише для выжигания на дереве",
    category: "Гравировка",
    categoryKey: "engraving",
  },
  {
    id: "g12",
    text: "Ветеринарное клеймо",
    category: "Гравировка",
    categoryKey: "engraving",
  },
  {
    id: "g13",
    text: "Адресник для животных с гравировкой",
    category: "Гравировка",
    categoryKey: "engraving",
  },
];

// Глобальное состояние поиска
const searchQuery = ref("");
const highlightedItemId = ref<string | null>(null);
const isSearchDropdownOpen = ref(false);
const selectedIndex = ref(-1);

// Функция транслитерации: русская раскладка -> английская
// Например: "печать" -> "gtxfnm"
const transliterateRuToEn = (text: string): string => {
  const ruToEn: Record<string, string> = {
    а: "f",
    б: ",",
    в: "d",
    г: "u",
    д: "l",
    е: "t",
    ё: "`",
    ж: ";",
    з: "p",
    и: "b",
    й: "q",
    к: "r",
    л: "k",
    м: "v",
    н: "y",
    о: "j",
    п: "g",
    р: "h",
    с: "c",
    т: "n",
    у: "e",
    ф: "a",
    х: "[",
    ц: "w",
    ч: "x",
    ш: "i",
    щ: "o",
    ъ: "]",
    ы: "s",
    ь: "m",
    э: "'",
    ю: ".",
    я: "z",
    А: "F",
    Б: "<",
    В: "D",
    Г: "U",
    Д: "L",
    Е: "T",
    Ё: "~",
    Ж: ":",
    З: "P",
    И: "B",
    Й: "Q",
    К: "R",
    Л: "K",
    М: "V",
    Н: "Y",
    О: "J",
    П: "G",
    Р: "H",
    С: "C",
    Т: "N",
    У: "E",
    Ф: "A",
    Х: "{",
    Ц: "W",
    Ч: "X",
    Ш: "I",
    Щ: "O",
    Ъ: "}",
    Ы: "S",
    Ь: "M",
    Э: '"',
    Ю: ">",
    Я: "Z",
  };

  return text
    .split("")
    .map((char) => ruToEn[char] || char)
    .join("");
};

// Функция обратной транслитерации: английская раскладка -> русская
// Например: "gtxfnm" -> "печать"
const transliterateEnToRu = (text: string): string => {
  const enToRu: Record<string, string> = {
    f: "а",
    ",": "б",
    d: "в",
    u: "г",
    l: "д",
    t: "е",
    "`": "ё",
    ";": "ж",
    p: "з",
    b: "и",
    q: "й",
    r: "к",
    k: "л",
    v: "м",
    y: "н",
    j: "о",
    g: "п",
    h: "р",
    c: "с",
    n: "т",
    e: "у",
    a: "ф",
    "[": "х",
    w: "ц",
    x: "ч",
    i: "ш",
    o: "щ",
    "]": "ъ",
    s: "ы",
    m: "ь",
    "'": "э",
    ".": "ю",
    z: "я",
    F: "А",
    "<": "Б",
    D: "В",
    U: "Г",
    L: "Д",
    T: "Е",
    "~": "Ё",
    ":": "Ж",
    P: "З",
    B: "И",
    Q: "Й",
    R: "К",
    K: "Л",
    V: "М",
    Y: "Н",
    J: "О",
    G: "П",
    H: "Р",
    C: "С",
    N: "Т",
    E: "У",
    A: "Ф",
    "{": "Х",
    W: "Ц",
    X: "Ч",
    I: "Ш",
    O: "Щ",
    "}": "Ъ",
    S: "Ы",
    M: "Ь",
    '"': "Э",
    ">": "Ю",
    Z: "Я",
  };

  return text
    .split("")
    .map((char) => enToRu[char] || char)
    .join("");
};

// ==================== ТРИГРАММЫ ДЛЯ НЕЧЕТКОГО ПОИСКА ====================

// Функция генерации триграмм из текста
const generateTrigrams = (text: string): Set<string> => {
  const normalized = text.toLowerCase().trim();
  if (normalized.length === 0) return new Set();

  const trigrams = new Set<string>();
  // Добавляем пробелы в начало и конец для лучшего сопоставления границ слов
  const padded = `  ${normalized}  `;

  for (let i = 0; i <= padded.length - 3; i++) {
    trigrams.add(padded.slice(i, i + 3));
  }

  return trigrams;
};

// Функция подсчета схожести триграмм (коэффициент Дайса - Dice coefficient)
const calculateSimilarity = (
  queryTrigrams: Set<string>,
  textTrigrams: Set<string>
): number => {
  if (queryTrigrams.size === 0 || textTrigrams.size === 0) return 0;

  let intersection = 0;
  for (const trigram of queryTrigrams) {
    if (textTrigrams.has(trigram)) {
      intersection++;
    }
  }

  // Коэффициент Дайса: 2 * |A ∩ B| / (|A| + |B|)
  // Возвращает значение от 0 до 1
  return (2 * intersection) / (queryTrigrams.size + textTrigrams.size);
};

// Кэш триграмм элементов меню для оптимизации (избегаем повторных вычислений)
const menuItemTrigramsCache = new Map<string, Set<string>>();
const menuItemTrigramsRuToEnCache = new Map<string, Set<string>>();

// Получение триграмм с кэшированием
const getMenuItemTrigrams = (itemText: string): Set<string> => {
  const normalized = itemText.toLowerCase();
  if (!menuItemTrigramsCache.has(normalized)) {
    menuItemTrigramsCache.set(normalized, generateTrigrams(normalized));
  }
  return menuItemTrigramsCache.get(normalized)!;
};

// Получение триграмм транслитерации с кэшированием
const getMenuItemTrigramsRuToEn = (itemText: string): Set<string> => {
  const normalized = itemText.toLowerCase();
  if (!menuItemTrigramsRuToEnCache.has(normalized)) {
    const transliterated = transliterateRuToEn(normalized);
    menuItemTrigramsRuToEnCache.set(
      normalized,
      generateTrigrams(transliterated)
    );
  }
  return menuItemTrigramsRuToEnCache.get(normalized)!;
};

// ========================================================================

export function useMenuSearch() {
  // Фильтрация элементов по запросу с использованием триграмм
  const filteredItems = computed(() => {
    const query = searchQuery.value.toLowerCase().trim();
    if (!query) return [];

    // Для очень коротких запросов (1-2 символа) используем быстрый поиск без триграмм
    if (query.length <= 2) {
      const transliteratedRuToEn = transliterateRuToEn(query);
      const transliteratedEnToRu = transliterateEnToRu(query);

      return menuItems
        .filter((item) => {
          const itemText = item.text.toLowerCase();
          const transliteratedItemText =
            transliterateRuToEn(itemText).toLowerCase();

          // Ищем по оригинальному тексту
          if (itemText.includes(query)) return true;

          // Ищем по транслитерированному тексту
          if (transliteratedItemText.includes(query)) return true;

          // Если запрос на английской раскладке, конвертируем обратно и ищем
          if (
            transliteratedEnToRu !== query &&
            itemText.includes(transliteratedEnToRu)
          )
            return true;

          // Если запрос на английской раскладке, ищем в транслите элементов
          if (transliteratedItemText.includes(transliteratedRuToEn))
            return true;

          return false;
        })
        .slice(0, 8);
    }

    // Для длинных запросов используем триграммы для нечеткого поиска
    // Генерируем триграммы запроса (включая транслитерацию)
    const queryTrigrams = generateTrigrams(query);
    const queryRuToEnTrigrams = generateTrigrams(transliterateRuToEn(query));
    const queryEnToRuTrigrams = generateTrigrams(transliterateEnToRu(query));

    // Массив результатов с оценкой релевантности
    const results: Array<{ item: MenuItem; score: number }> = [];

    for (const item of menuItems) {
      const itemText = item.text.toLowerCase();

      // 1. Точное совпадение или полное вхождение (максимальный приоритет)
      if (itemText === query || itemText.includes(query)) {
        results.push({ item, score: 1.0 });
        continue;
      }

      // 2. Поиск по триграммам оригинального текста
      const itemTrigrams = getMenuItemTrigrams(itemText);
      const originalSimilarity = calculateSimilarity(
        queryTrigrams,
        itemTrigrams
      );

      // 3. Поиск по триграммам транслитерации
      const itemTrigramsRuToEn = getMenuItemTrigramsRuToEn(itemText);
      const translitSimilarityRuToEn = calculateSimilarity(
        queryRuToEnTrigrams,
        itemTrigramsRuToEn
      );
      const translitSimilarityEnToRu = calculateSimilarity(
        queryEnToRuTrigrams,
        itemTrigramsRuToEn
      );

      const maxTranslitSimilarity = Math.max(
        translitSimilarityRuToEn,
        translitSimilarityEnToRu
      );

      // 4. Берем максимальную схожесть из всех вариантов
      const maxSimilarity = Math.max(originalSimilarity, maxTranslitSimilarity);

      // 5. Добавляем только если схожесть выше порога (0.2 = 20%)
      // Порог можно настроить: меньше = больше результатов, больше = точнее
      if (maxSimilarity >= 0.2) {
        results.push({ item, score: maxSimilarity });
      }
    }

    // Сортируем по релевантности (score от большего к меньшему) и берем топ-8
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((result) => result.item);
  });

  // Поиск элемента
  const searchItems = (query: string) => {
    searchQuery.value = query;
    selectedIndex.value = -1;
    isSearchDropdownOpen.value = query.trim().length > 0;
  };

  // Выбор элемента из списка
  const selectItem = (item: MenuItem) => {
    highlightedItemId.value = item.id;
    searchQuery.value = "";
    isSearchDropdownOpen.value = false;
    selectedIndex.value = -1;

    // Автоматически сбросить подсветку через 3 секунды
    setTimeout(() => {
      highlightedItemId.value = null;
    }, 3000);
  };

  // Выбор первого или выделенного результата
  const selectFirstOrHighlighted = () => {
    const items = filteredItems.value;
    if (items.length > 0) {
      const index = selectedIndex.value >= 0 ? selectedIndex.value : 0;
      const item = items[index];
      if (item) {
        selectItem(item);
      }
    }
  };

  // Навигация по списку
  const navigateDown = () => {
    const items = filteredItems.value;
    if (items.length > 0) {
      selectedIndex.value = (selectedIndex.value + 1) % items.length;
    }
  };

  const navigateUp = () => {
    const items = filteredItems.value;
    if (items.length > 0) {
      selectedIndex.value =
        selectedIndex.value <= 0 ? items.length - 1 : selectedIndex.value - 1;
    }
  };

  // Закрыть dropdown
  const closeDropdown = () => {
    isSearchDropdownOpen.value = false;
    selectedIndex.value = -1;
  };

  // Очистить подсветку
  const clearHighlight = () => {
    highlightedItemId.value = null;
  };

  // Получить цвет категории
  const getCategoryColor = (categoryKey: string): string => {
    const colors: Record<string, string> = {
      typography: "var(--blue)",
      photoprint: "var(--red)",
      souvenirs: "var(--orange)",
      publishing: "var(--green)",
      engraving: "var(--blue_2)",
    };
    return colors[categoryKey] || "var(--grey)";
  };

  return {
    searchQuery,
    highlightedItemId,
    isSearchDropdownOpen,
    selectedIndex,
    filteredItems,
    menuItems,
    searchItems,
    selectItem,
    selectFirstOrHighlighted,
    navigateDown,
    navigateUp,
    closeDropdown,
    clearHighlight,
    getCategoryColor,
  };
}
