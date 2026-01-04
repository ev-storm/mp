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
  { id: "t1", text: "Сканирование документа до А3", category: "Типография", categoryKey: "typography" },
  { id: "t2", text: "Широкоформатное сканирование", category: "Типография", categoryKey: "typography" },
  { id: "t3", text: "Печать и копирование до А3", category: "Типография", categoryKey: "typography" },
  { id: "t4", text: "Широкоформатная печать", category: "Типография", categoryKey: "typography" },
  { id: "t5", text: "Печать листовок и буклетов", category: "Типография", categoryKey: "typography", link: "/printing/booklet/laser-print" },
  { id: "t6", text: "Печать визиток", category: "Типография", categoryKey: "typography", link: "/printing/visit-card/laser-print" },
  { id: "t7", text: "Печать брошюр и книг", category: "Типография", categoryKey: "typography" },
  { id: "t8", text: "Печать наклеек", category: "Типография", categoryKey: "typography" },
  { id: "t9", text: "Печать курсовых и дипломных работ", category: "Типография", categoryKey: "typography" },
  { id: "t10", text: "Печать черчежей", category: "Типография", categoryKey: "typography" },
  { id: "t11", text: "Печать на кальке", category: "Типография", categoryKey: "typography" },
  { id: "t12", text: "Ламинирование документов", category: "Типография", categoryKey: "typography" },
  { id: "t13", text: "Широкоформатное ламинирование", category: "Типография", categoryKey: "typography" },
  { id: "t14", text: "Переплет на металлическую пружину", category: "Типография", categoryKey: "typography" },
  { id: "t15", text: "Переплет на пластиковую пружину", category: "Типография", categoryKey: "typography" },
  { id: "t16", text: "Твердый переплет", category: "Типография", categoryKey: "typography" },
  { id: "t17", text: "Офсетная печать", category: "Типография", categoryKey: "typography" },
  { id: "t18", text: "Тиснение фольгой", category: "Типография", categoryKey: "typography" },
  { id: "t19", text: "Тиражирование на ризографе", category: "Типография", categoryKey: "typography" },
  
  // Фотопечать
  { id: "f1", text: "Печать фото", category: "Фотопечать", categoryKey: "photoprint" },
  { id: "f2", text: "Мгновенное фото на документы", category: "Фотопечать", categoryKey: "photoprint" },
  { id: "f3", text: "Предметная фотосъёмка", category: "Фотопечать", categoryKey: "photoprint" },
  { id: "f4", text: "Реставрация Фотографий", category: "Фотопечать", categoryKey: "photoprint" },
  { id: "f5", text: "Сканирование пленок", category: "Фотопечать", categoryKey: "photoprint" },
  { id: "f6", text: "Печать на CD/DVD", category: "Фотопечать", categoryKey: "photoprint" },
  { id: "f7", text: "Фотокниги", category: "Фотопечать", categoryKey: "photoprint" },
  { id: "f8", text: "Транспарант \"Бессмертный Полк\"", category: "Фотопечать", categoryKey: "photoprint" },
  { id: "f9", text: "Багетная мастерская", category: "Фотопечать", categoryKey: "photoprint" },
  
  // Сувениры
  { id: "s1", text: "Календари", category: "Сувениры", categoryKey: "souvenirs" },
  { id: "s2", text: "Магниты на холодильник", category: "Сувениры", categoryKey: "souvenirs" },
  { id: "s3", text: "Печать фото на кружках", category: "Сувениры", categoryKey: "souvenirs" },
  { id: "s4", text: "Распечатка конвертов", category: "Сувениры", categoryKey: "souvenirs" },
  { id: "s5", text: "Печать на одежде", category: "Сувениры", categoryKey: "souvenirs" },
  { id: "s6", text: "Вышивка на одежде", category: "Сувениры", categoryKey: "souvenirs" },
  { id: "s7", text: "Изготовление этикеток на одежду", category: "Сувениры", categoryKey: "souvenirs" },
  { id: "s8", text: "Пластиковые папки и пакеты", category: "Сувениры", categoryKey: "souvenirs" },
  { id: "s9", text: "Изготовление значков", category: "Сувениры", categoryKey: "souvenirs" },
  { id: "s10", text: "Пенокартон", category: "Сувениры", categoryKey: "souvenirs" },
  { id: "s11", text: "Тампопечать", category: "Сувениры", categoryKey: "souvenirs" },
  { id: "s12", text: "Печать на металле", category: "Сувениры", categoryKey: "souvenirs" },
  
  // Издательство
  { id: "i1", text: "Набор текста (в том числе рукописного)", category: "Издательство", categoryKey: "publishing" },
  { id: "i2", text: "Корректура", category: "Издательство", categoryKey: "publishing" },
  { id: "i3", text: "Редакторская правка", category: "Издательство", categoryKey: "publishing" },
  { id: "i4", text: "Спуск полос", category: "Издательство", categoryKey: "publishing" },
  { id: "i5", text: "Полиграфическая верстка любой сложности", category: "Издательство", categoryKey: "publishing" },
  { id: "i6", text: "Авторам", category: "Издательство", categoryKey: "publishing" },
  { id: "i7", text: "Термоклеевое скрепление", category: "Издательство", categoryKey: "publishing" },
  
  // Гравировка
  { id: "g1", text: "Типографское клише", category: "Гравировка", categoryKey: "engraving" },
  { id: "g2", text: "Печати и штампы", category: "Гравировка", categoryKey: "engraving" },
  { id: "g3", text: "Лазерная гравировка", category: "Гравировка", categoryKey: "engraving" },
  { id: "g4", text: "Шильдики", category: "Гравировка", categoryKey: "engraving" },
  { id: "g5", text: "Гравированные таблички", category: "Гравировка", categoryKey: "engraving" },
  { id: "g6", text: "Гравировка на свадебных замках", category: "Гравировка", categoryKey: "engraving" },
  { id: "g7", text: "Гравировка на личных жетонах", category: "Гравировка", categoryKey: "engraving" },
  { id: "g8", text: "Термоклеймо", category: "Гравировка", categoryKey: "engraving" },
  { id: "g9", text: "Пломбиры", category: "Гравировка", categoryKey: "engraving" },
  { id: "g10", text: "Клише для тиснения на коже", category: "Гравировка", categoryKey: "engraving" },
  { id: "g11", text: "Клише для выжигания на дереве", category: "Гравировка", categoryKey: "engraving" },
  { id: "g12", text: "Ветеринарное клеймо", category: "Гравировка", categoryKey: "engraving" },
  { id: "g13", text: "Адресник для животных с гравировкой", category: "Гравировка", categoryKey: "engraving" },
];

// Глобальное состояние поиска
const searchQuery = ref("");
const highlightedItemId = ref<string | null>(null);
const isSearchDropdownOpen = ref(false);
const selectedIndex = ref(-1);

export function useMenuSearch() {
  // Фильтрация элементов по запросу
  const filteredItems = computed(() => {
    const query = searchQuery.value.toLowerCase().trim();
    if (!query) return [];
    
    return menuItems.filter(item => 
      item.text.toLowerCase().includes(query)
    ).slice(0, 8); // Ограничиваем до 8 результатов
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
      selectItem(items[index]);
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
      selectedIndex.value = selectedIndex.value <= 0 
        ? items.length - 1 
        : selectedIndex.value - 1;
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

