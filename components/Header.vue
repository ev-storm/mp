<template>
  <header class="header">
    <div class="header-con">
      <div class="logo-con">
        <img src="/assets/svg/logo.svg" alt="" />
        <h1>Митино<br />Принт</h1>
      </div>
      <div class="header-link-con">
        <div class="header-link-up">
          <ul>
            <li>Магазин</li>
            <li class="mi">|</li>
            <li class="header-dropdown" @click="toggleAboutMenu">
              О компании
              <span
                class="header-dropdown-arrow"
                :class="{ open: isAboutMenuOpen }"
                >›</span
              >
              <ul
                class="header-dropdown-list"
                :class="{ open: isAboutMenuOpen }"
              >
                <li>О компании</li>
                <li>Контакты и адрес</li>
                <li>Документация</li>
                <li>Оплата и доставка</li>
                <li>Вакансии</li>
                <li>FAQ</li>
              </ul>
            </li>
            <li class="mi">|</li>
            <li>Портфолио</li>
            <li class="mi">|</li>
            <li>Тех. требования</li>
          </ul>
          <div class="header-link-up-contact-con">
            <div class="header-link-up-contact">
              <h1>8 495 794-81-15</h1>
              <p>mitino-print@yandex.ru</p>
            </div>
            <img src="/assets/svg/mail.svg" alt="" />
          </div>
        </div>
        <div
          class="header-link-main"
          :class="{ 'search-focused': isSearchFocused }"
        >
          <MainButton
            text="Типография"
            svg-path="/img/main-btn/t.svg"
            color="var(--blue)"
          />
          <MainButton
            text="Фотопечать"
            svg-path="/img/main-btn/f.svg"
            color="var(--red)"
          />
          <MainButton
            text="Сувениры"
            svg-path="/img/main-btn/s.svg"
            color="var(--orange)"
          />
          <MainButton
            text="Издательство"
            svg-path="/img/main-btn/i.svg"
            color="var(--green)"
          />
          <MainButton
            text="Гравюровка"
            svg-path="/img/main-btn/g.svg"
            color="var(--blue_2)"
          />
          <div class="search-container" ref="searchContainerRef">
            <input
              class="main-search"
              type="search"
              placeholder="Поиск"
              v-model="searchInputValue"
              @input="onSearchInput"
              @focus="onSearchFocus"
              @blur="onSearchBlur"
              @keydown.down.prevent="navigateDown"
              @keydown.up.prevent="navigateUp"
              @keydown.enter.prevent="onEnter"
              @keydown.escape="closeDropdown"
            />
            <div
              class="search-dropdown"
              :class="{
                open: isSearchDropdownOpen && filteredItems.length > 0,
              }"
            >
              <div
                v-for="(item, index) in filteredItems"
                :key="item.id"
                class="search-result-item"
                :class="{ selected: index === selectedIndex }"
                :style="{
                  '--category-color': getCategoryColor(item.categoryKey),
                }"
                @mousedown.prevent="selectItem(item)"
                @mouseenter="selectedIndex = index"
              >
                <span class="search-result-text">{{ item.text }}</span>
                <span class="search-result-category">{{ item.category }}</span>
              </div>
              <div
                v-if="filteredItems.length === 0 && searchInputValue.trim()"
                class="search-no-results"
              >
                Ничего не найдено
              </div>
            </div>
          </div>
        </div>
        <div class="map">
          <p v-if="breadcrumb">
            <NuxtLink :to="breadcrumb.mainLink">{{ breadcrumb.main }}</NuxtLink>
            <span v-if="breadcrumb.sub">|</span>
            <NuxtLink v-if="breadcrumb.sub" :to="breadcrumb.subLink">{{
              breadcrumb.sub
            }}</NuxtLink>
            <span v-if="breadcrumb.third">|</span>
            <NuxtLink v-if="breadcrumb.third" :to="breadcrumb.thirdLink">{{
              breadcrumb.third
            }}</NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useMenuSearch } from "~/composables/useMenuSearch";

// @ts-ignore - useRoute is auto-imported by Nuxt
const route = useRoute();

const isSearchFocused = ref(false);
const isAboutMenuOpen = ref(false);
const searchContainerRef = ref<HTMLElement | null>(null);
const searchInputValue = ref("");

// Composable для поиска по меню
const {
  isSearchDropdownOpen,
  selectedIndex,
  filteredItems,
  searchItems,
  selectItem,
  selectFirstOrHighlighted,
  navigateDown,
  navigateUp,
  closeDropdown,
  getCategoryColor,
} = useMenuSearch();

// Обработчики поиска
const onSearchInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  searchItems(target.value);
};

const onSearchFocus = () => {
  isSearchFocused.value = true;
  if (searchInputValue.value.trim()) {
    searchItems(searchInputValue.value);
  }
};

const onSearchBlur = () => {
  isSearchFocused.value = false;
  // Небольшая задержка для обработки клика по элементу
  setTimeout(() => {
    closeDropdown();
  }, 150);
};

const onEnter = () => {
  selectFirstOrHighlighted();
  searchInputValue.value = "";
};

const toggleAboutMenu = () => {
  isAboutMenuOpen.value = !isAboutMenuOpen.value;
};

// Закрытие меню при клике вне
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".header-dropdown")) {
    isAboutMenuOpen.value = false;
  }
};

// Добавляем слушатель при монтировании
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

// Маппинг маршрута -> { main, mainLink, sub, subLink, third, thirdLink }
interface Breadcrumb {
  main: string;
  mainLink: string;
  sub: string;
  subLink: string;
  third: string;
  thirdLink: string;
}

const breadcrumbMap: Record<string, Breadcrumb> = {
  "/": {
    main: "Главная",
    mainLink: "/",
    sub: "",
    subLink: "",
    third: "",
    thirdLink: "",
  },
  // Типография
  "/printing": {
    main: "Типография",
    mainLink: "/printing",
    sub: "",
    subLink: "",
    third: "",
    thirdLink: "",
  },
  "/printing/visit-card/laser-print": {
    main: "Типография",
    mainLink: "/printing",
    sub: "Печать визиток",
    subLink: "/printing/visit-card/laser-print",
    third: "Лазерная печать",
    thirdLink: "/printing/visit-card/laser-print",
  },
  "/printing/visit-card/uf-print": {
    main: "Типография",
    mainLink: "/printing",
    sub: "Печать визиток",
    subLink: "/printing/visit-card/laser-print",
    third: "УФ печать",
    thirdLink: "/printing/visit-card/uf-print",
  },
  "/printing/visit-card/ofset-print": {
    main: "Типография",
    mainLink: "/printing",
    sub: "Печать визиток",
    subLink: "/printing/visit-card/laser-print",
    third: "Офсетная печать",
    thirdLink: "/printing/visit-card/ofset-print",
  },
  // Печать листовок и буклетов
  "/printing/booklet/laser-print": {
    main: "Типография",
    mainLink: "/printing",
    sub: "Печать листовок и буклетов",
    subLink: "/printing/booklet/laser-print",
    third: "Лазерная печать",
    thirdLink: "/printing/booklet/laser-print",
  },
  "/printing/booklet/ofset-print": {
    main: "Типография",
    mainLink: "/printing",
    sub: "Печать листовок и буклетов",
    subLink: "/printing/booklet/laser-print",
    third: "Офсетная печать",
    thirdLink: "/printing/booklet/ofset-print",
  },
  // Печать наклеек
  "/printing/stickers/stickers-print": {
    main: "Типография",
    mainLink: "/printing",
    sub: "Наклейки и плоттерная резка",
    subLink: "/printing/stickers/stickers-print",
    third: "Печать наклеек",
    thirdLink: "/printing/stickers/stickers-print",
  },
  "/printing/stickers/plotter-paper": {
    main: "Типография",
    mainLink: "/printing",
    sub: "Наклейки и плоттерная резка",
    subLink: "/printing/stickers/stickers-print",
    third: "Плоттерная резка",
    thirdLink: "/printing/stickers/plotter-paper",
  },
  // Фотопечать
  "/photo": {
    main: "Фотопечать",
    mainLink: "/photo",
    sub: "",
    subLink: "",
    third: "",
    thirdLink: "",
  },
  // Сувениры
  "/gift": {
    main: "Сувениры",
    mainLink: "/gift",
    sub: "",
    subLink: "",
    third: "",
    thirdLink: "",
  },
  // Издательство
  "/publish": {
    main: "Издательство",
    mainLink: "/publish",
    sub: "",
    subLink: "",
    third: "",
    thirdLink: "",
  },
  // Гравировка
  "/engraver": {
    main: "Гравировка",
    mainLink: "/engraver",
    sub: "",
    subLink: "",
    third: "",
    thirdLink: "",
  },
};

const breadcrumb = computed(() => {
  return breadcrumbMap[route.path] || breadcrumbMap["/"];
});
</script>

<style scoped>
.header {
  width: 100%;
  height: 13vh;
  background-color: var(--back);
  position: fixed;
  top: 0;
  z-index: 100;
  padding: 0 0;
  display: flex;
  justify-content: center;
}
.header-con {
  max-width: 1800px;
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.logo-con {
  display: flex;
  align-items: center;
}
.logo-con img {
  width: 70px;
  margin: 10px 15px;
}
.logo-con h1 {
  display: flex;
  font-weight: 500;
  text-align: end;
  font-size: 22px;
  line-height: 1.2;
  text-transform: uppercase;
}
.header-link-con {
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: end;
  width: 85%;
}
.header-link-up {
  display: flex;
  align-items: center;
  margin: 10px 15px;
}
.header-link-up ul {
  display: flex;

  cursor: pointer;
}
.header-link-up-contact-con {
  display: flex;
  align-items: start;
}
.header-link-up-contact {
  display: flex;
  flex-direction: column;
  align-items: end;
  margin: 0 15px 0 30px;
}
.header-link-up-contact-con img {
  width: 40px;
  margin-top: 4px;
}
.header-link-up-contact h1 {
  font-weight: 500;
  color: var(--blue);
  line-height: 0.8;
}
.header-link-main {
  display: flex;
  justify-content: flex-start;
  width: 80%;
}
.header-link-main input {
  font-size: var(--f-2);
}
.header-link-up ul li {
  font-size: var(--f-2);
  color: var(--grey);
  margin: 0 10px;
}
.mi {
  cursor: default;
  color: #bcbcbc !important;
}

/* Header dropdown */
.header-dropdown {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-dropdown-arrow {
  scale: 1.5;
  transition: transform 0.3s ease;
  display: inline-block;
  margin-left: 8px;
}

.header-dropdown-arrow.open {
  transform: rotate(90deg);
}

.header-dropdown-list {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--white);
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  margin-top: 10px;
  padding: 8px 0;
  min-width: 180px;
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 200;
  display: flex;
  flex-direction: column;
}

.header-dropdown-list.open {
  max-height: 300px;
  opacity: 1;
}

.header-dropdown-list li {
  padding: 6px 20px;
  font-size: var(--f-p);
  color: var(--grey);
  transition: all 0.2s ease;
  white-space: nowrap;
  margin: 0 !important;
}

.header-dropdown-list li:hover {
  background: var(--back);
  color: var(--blue);
}
.search-map-con {
  display: flex;
  align-items: center;
}
.map {
  margin-right: 15px;
}
.map p {
  font-size: 10px;
}
.map p a {
  color: var(--grey);
  text-decoration: none;
  transition: color 0.2s ease;
}
.map p a:hover {
  color: var(--blue);
}
.map p span {
  margin: 0 10px;
  cursor: default;
}
.main-search {
  width: 100%;
  border-radius: 5px;
  padding: 2px 20px;
  margin: 5px 15px;
  background: var(--white);
  border-style: solid;
  border-width: 2px;
  border-color: transparent;
  transition: var(--tran);
}
.main-search:focus {
  width: 100%;
  border-width: 2px;
  border-color: var(--blue);
}

/* Search container & dropdown */
.search-container {
  position: relative;
  width: 100%;
  margin: 5px 15px;
}

.search-container .main-search {
  margin: 0;
  width: 100%;
}

.search-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--white);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 300;
}

.search-dropdown.open {
  max-height: 400px;
  opacity: 1;
  padding: 8px 0;
}

.search-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.15s ease;
  border-left: 3px solid transparent;
}

.search-result-item:hover,
.search-result-item.selected {
  background: var(--back);
  border-left-color: var(--category-color);
}

.search-result-text {
  font-size: var(--f-p);
  color: var(--black);
  font-weight: 500;
}

.search-result-category {
  font-size: 10px;
  color: var(--category-color);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.search-no-results {
  padding: 16px;
  text-align: center;
  color: var(--grey);
  font-size: var(--f-p);
}

.header-link-main.search-focused :deep(.main-btn h2) {
  max-width: 0;
  opacity: 0;
  padding: 0;
  margin: 0;
}

/* Скрываем текст в кнопках при ширине экрана меньше 1300px */
@media (max-width: 1400px) {
  .header-link-main :deep(.main-btn h2) {
    max-width: 0;
    opacity: 0;
    padding: 0;
    margin: 0;
  }
  .logo-con h1 {
    display: none;
  }
}
</style>
