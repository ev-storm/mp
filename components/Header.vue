<template>
  <header class="header">
    <div class="header-con">
      <div class="logo-con">
        <NuxtLink to="/">
          <img src="/assets/svg/logo.svg" alt="" />
        </NuxtLink>
        <h1>Митино<br />Принт</h1>
      </div>
      <div class="header-link-con">
        <button
          class="burger-menu-btn"
          :class="{ open: isMobileMenuOpen }"
          @click="toggleMobileMenu"
          aria-label="Открыть меню"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
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
            <ul class="header-dropdown-list" :class="{ open: isAboutMenuOpen }">
              <li>О компании</li>
              <li>
                <NuxtLink to="/about/contacts">Контакты и адрес</NuxtLink>
              </li>
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
          <img
            src="/assets/svg/mail.svg"
            alt=""
            @click="openContactModal"
            style="cursor: pointer"
          />
        </div>
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
            @mousedown.prevent="handleItemClick(item)"
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

    <!-- Мобильное меню -->
    <div class="mobile-menu" :class="{ open: isMobileMenuOpen }">
      <ul class="mobile-menu-list">
        <li class="mobile-menu-item">Магазин</li>
        <li class="mobile-menu-item mobile-menu-dropdown">
          <div class="mobile-menu-title" @click="toggleMobileAboutMenu">
            О компании
            <span
              class="mobile-menu-arrow"
              :class="{ open: isMobileAboutMenuOpen }"
              >›</span
            >
          </div>
          <ul
            class="mobile-menu-sublist"
            :class="{ open: isMobileAboutMenuOpen }"
          >
            <li>О компании</li>
            <li><NuxtLink to="/about/contacts">Контакты и адрес</NuxtLink></li>
            <li>Документация</li>
            <li>Оплата и доставка</li>
            <li>Вакансии</li>
            <li>FAQ</li>
          </ul>
        </li>
        <li class="mobile-menu-item">Портфолио</li>
        <li class="mobile-menu-item">Тех. требования</li>
      </ul>
      <div class="mobile-menu-contact">
        <div class="mobile-menu-contact-info">
          <h1>8 495 794-81-15</h1>
          <p>mitino-print@yandex.ru</p>
        </div>
        <img
          src="/assets/svg/mail.svg"
          alt=""
          @click="openContactModal"
          style="cursor: pointer"
        />
      </div>
    </div>
  </header>

  <ContactModal
    :isOpen="isContactModalOpen"
    @close="closeContactModal"
    @submit="handleContactSubmit"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useMenuSearch } from "~/composables/useMenuSearch";
import { useMobileMenuState } from "~/composables/useMobileMenuState";
import { useContactModal } from "~/composables/useContactModal";

// @ts-ignore - useRoute and useRouter are auto-imported by Nuxt
const route = useRoute();
// @ts-ignore
const router = useRouter();

const isSearchFocused = ref(false);
const isAboutMenuOpen = ref(false);
const isMobileAboutMenuOpen = ref(false);
const searchContainerRef = ref<HTMLElement | null>(null);
const searchInputValue = ref("");

const { isContactModalOpen, openContactModal, closeContactModal } =
  useContactModal();

// Composable для синхронизации состояния мобильных меню
const { isMobileMenuOpen, toggleMobileMenu } = useMobileMenuState();

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

const navigateToItem = (item: any) => {
  if (item.link) {
    router.push(item.link);
  } else {
    router.push("/");
  }
  searchInputValue.value = "";
  closeDropdown();
};

const onEnter = () => {
  const items = filteredItems.value;
  if (items.length > 0) {
    const index = selectedIndex.value >= 0 ? selectedIndex.value : 0;
    navigateToItem(items[index]);
  }
};

const handleItemClick = (item: any) => {
  selectItem(item);
  navigateToItem(item);
};

const toggleAboutMenu = () => {
  isAboutMenuOpen.value = !isAboutMenuOpen.value;
};

const toggleMobileAboutMenu = () => {
  isMobileAboutMenuOpen.value = !isMobileAboutMenuOpen.value;
};

const handleContactSubmit = (formData: any, file: File | null) => {
  console.log("Contact form submitted:", formData, file);
  // Здесь можно добавить логику отправки формы
  closeContactModal();
};

// Закрываем подменю при закрытии мобильного меню
watch(isMobileMenuOpen, (newValue: boolean) => {
  if (!newValue) {
    isMobileAboutMenuOpen.value = false;
  }
});

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
  // Ламинирование
  "/printing/lamination/doc": {
    main: "Типография",
    mainLink: "/printing",
    sub: "Ламинирование документов",
    subLink: "/printing/lamination/doc",
    third: "",
    thirdLink: "",
  },
  "/printing/lamination/large": {
    main: "Типография",
    mainLink: "/printing",
    sub: "Широкоформатное ламинирование",
    subLink: "/printing/lamination/large",
    third: "",
    thirdLink: "",
  },
  "/printing/lamination/more": {
    main: "Типография",
    mainLink: "/printing",
    sub: "Ламинирование документов",
    subLink: "/printing/lamination/doc",
    third: "Дополнительно",
    thirdLink: "/printing/lamination/more",
  },
  // Тиражирование на ризографе
  "/printing/replication": {
    main: "Типография",
    mainLink: "/printing",
    sub: "Тиражирование на ризографе",
    subLink: "/printing/replication",
    third: "",
    thirdLink: "",
  },
  "/printing/replication/more": {
    main: "Типография",
    mainLink: "/printing",
    sub: "Тиражирование на ризографе",
    subLink: "/printing/replication",
    third: "Дополнительно",
    thirdLink: "/printing/replication/more",
  },
  // Печать на кальке
  "/printing/tracing": {
    main: "Типография",
    mainLink: "/printing",
    sub: "Печать на кальке",
    subLink: "/printing/tracing",
    third: "",
    thirdLink: "",
  },
  "/printing/tracing/more": {
    main: "Типография",
    mainLink: "/printing",
    sub: "Печать на кальке",
    subLink: "/printing/tracing",
    third: "Дополнительно",
    thirdLink: "/printing/tracing/more",
  },
  // Печать и сканирование до А3
  "/printing/scan": {
    main: "Типография",
    mainLink: "/printing",
    sub: "Сканирование документа до А3",
    subLink: "/printing/scan",
    third: "",
    thirdLink: "",
  },
  "/printing/scan/print": {
    main: "Типография",
    mainLink: "/printing",
    sub: "Печать и копирование до А3",
    subLink: "/printing/scan/print",
    third: "",
    thirdLink: "",
  },
  // Широкоформатная печать и сканирование
  "/printing/large/print": {
    main: "Типография",
    mainLink: "/printing",
    sub: "Широкоформатная печать",
    subLink: "/printing/large/print",
    third: "",
    thirdLink: "",
  },
  "/printing/large/scan": {
    main: "Типография",
    mainLink: "/printing",
    sub: "Широкоформатное сканирование",
    subLink: "/printing/large/scan",
    third: "",
    thirdLink: "",
  },
  "/printing/large/plan": {
    main: "Типография",
    mainLink: "/printing",
    sub: "Печать чертежей",
    subLink: "/printing/large/plan",
    third: "",
    thirdLink: "",
  },
  // Переплет
  "/printing/bind/metal": {
    main: "Типография",
    mainLink: "/printing",
    sub: "Переплет на металлическую пружину",
    subLink: "/printing/bind/metal",
    third: "",
    thirdLink: "",
  },
  "/printing/bind/plastic": {
    main: "Типография",
    mainLink: "/printing",
    sub: "Переплет на пластиковую пружину",
    subLink: "/printing/bind/plastic",
    third: "",
    thirdLink: "",
  },
  "/printing/bind/hard": {
    main: "Типография",
    mainLink: "/printing",
    sub: "Твердый переплет",
    subLink: "/printing/bind/hard",
    third: "",
    thirdLink: "",
  },
  "/printing/diplom": {
    main: "Типография",
    mainLink: "/printing",
    sub: "Печать курсовых и дипломных работ",
    subLink: "/printing/diplom",
    third: "",
    thirdLink: "",
  },
  "/printing/catalogs": {
    main: "Типография",
    mainLink: "/printing",
    sub: "Печать листовок и буклетов",
    subLink: "/printing/catalogs",
    third: "",
    thirdLink: "",
  },
  "/printing/catalogs/ofset": {
    main: "Типография",
    mainLink: "/printing",
    sub: "Печать листовок и буклетов",
    subLink: "/printing/catalogs",
    third: "Офсетная печать",
    thirdLink: "/printing/catalogs/ofset",
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
  height: 15vh;
  position: fixed;
  top: 0;
  z-index: 100;
  padding: 0 0;
  display: flex;
  justify-content: start;
  align-items: center;
  flex-direction: column;
}
.header-con {
  max-width: 1800px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  background-color: var(--back);
  padding-top: 15px;
}
.logo-con {
  display: flex;
  align-items: center;
  margin-bottom: -3vh;
  z-index: 10;
}
.logo-con a {
  display: inline-block;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.logo-con a:active {
  transform: scale(0.98);
}

.logo-con img {
  width: 60px;
  margin: 0px 10px 0px 35px;
  cursor: pointer;
  display: block;
}
.logo-con h1 {
  display: flex;
  font-weight: 500;
  text-align: end;
  font-size: 20px;
  line-height: 1.2;
  text-transform: uppercase;
}
.header-link-con {
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: end;
  width: fit-content;
}
.header-link-up {
  display: flex;
  align-items: center;
  margin: 0px 15px;
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
  cursor: pointer;
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
  width: 100%;
  max-width: 1800px;
  justify-content: flex-end;
  background-color: var(--back);
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
  box-shadow: #00000010 0 2px 15px;
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
  margin: 0;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  max-width: 1800px;
  background: var(--back);
  padding: 5px 30px;
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
  transition: all 0.4s ease;
}
.main-search:focus {
  width: 100%;
  border-width: 2px;
  border-color: var(--blue);
}

.search-container {
  position: relative;
  width: 10%;
  margin: 5px 15px;
  transition: all 0.4s ease-in-out;
  display: flex;
  justify-content: center;
}

.search-container:has(.main-search:focus) {
  width: 50%;
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
  box-shadow: #00000010 0 2px 15px;
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
}

/* Бургер меню и скрытие header-link-up при ширине экрана меньше 800px */
.burger-menu-btn {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 10px 15px;
  z-index: 101;
}

.burger-menu-btn span {
  width: 100%;
  height: 3px;
  background-color: var(--black);
  border-radius: 3px;
  transition: all 0.3s ease;
  position: relative;
}

/* Анимация бургера в крестик */
.burger-menu-btn.open span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.burger-menu-btn.open span:nth-child(2) {
  opacity: 0;
  transform: scale(0);
}

.burger-menu-btn.open span:nth-child(3) {
  transform: rotate(-45deg) translate(10px, -10px);
}

.mobile-menu {
  display: none;
}

@media (max-width: 799px) {
  .header {
    width: 100vw;
    height: 12vh;
    background: var(--back);
    padding-top: 0;
  }
  .search-container .main-search {
    background: var(--back);
  }
  .search-container:has(.main-search:focus) {
    width: 100%;
  }
  .search-dropdown {
    top: calc(100% + 20px);
  }
  .logo-con {
    margin-bottom: 0vh;
    z-index: 10;
  }
  .search-container {
    position: relative;
    transition: all 0.4s ease-in-out;
    width: 20%;
    margin: 5px;
  }
  .main-btn {
    background: var(--white);
    margin: 0;
    padding: 2px 19px;
    border-radius: 5px;
    transition: all 0.4s ease;
  }
  .header-con {
    max-width: 100vw;
    align-items: center;
    background: var(--back);
  }
  .map {
    width: 90%;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  .header-link-main {
    max-width: fit-content;
    background: #ffffff;
    width: 94vw;
    min-width: 94vw;
    border-radius: 5px;
    justify-content: space-between;
    box-shadow: #00000010 0 2px 15px;
  }
  .header-link-main.search-focused :deep(.main-btn) {
    opacity: 0;
    max-width: 0;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
  .header-link-up {
    display: none !important;
  }

  .burger-menu-btn {
    display: flex;
  }

  .header-link-con {
    justify-content: flex-end;
  }
  .logo-con img {
    width: 40px;
    margin: 10px 15px;
  }

  /* Мобильное меню */
  .mobile-menu {
    display: flex;
    position: fixed;
    top: 20vh;
    right: -100%;
    width: 60%;
    max-width: 400px;
    height: fit-content;
    min-height: 40vh;
    background: var(--white);
    box-shadow: #00000030 0 2px 15px;
    z-index: 700;
    transition: right 0.3s ease;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    margin: 0 15px;
    border-radius: 8px;
  }

  .mobile-menu.open {
    right: 0;
  }

  .mobile-menu-close {
    background: transparent;
    border: none;
    font-size: 32px;
    color: var(--grey);
    cursor: pointer;
    line-height: 1;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease;
  }

  .mobile-menu-close:hover {
    color: var(--blue);
  }

  .mobile-menu-list {
    list-style: none;
    padding: 0;
    margin: 0;
    flex: 1;
    padding: 10px 0;
  }

  .mobile-menu-item {
    padding: 10px 20px;
    font-size: var(--f-2);
    color: var(--grey);
    border-bottom: 1px solid var(--back);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .mobile-menu-item:not(.mobile-menu-dropdown):hover {
    background: var(--back);
    color: var(--blue);
  }
  .logo-con h1 {
    font-weight: 500;
    font-size: 16px;
  }

  .mobile-menu-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
  }

  .mobile-menu-arrow {
    font-size: 20px;
    transition: transform 0.3s ease;
    color: var(--grey);
  }

  .mobile-menu-arrow.open {
    transform: rotate(90deg);
  }

  .mobile-menu-sublist {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transition: all 0.3s ease;
  }

  .mobile-menu-sublist.open {
    max-height: 400px;
    opacity: 1;
    padding-top: 10px;
  }

  .mobile-menu-sublist li {
    padding: 10px 20px;
    font-size: var(--f-2);
    color: var(--grey);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .mobile-menu-sublist li:hover {
    background: var(--back);
    color: var(--blue);
  }

  .mobile-menu-contact {
    display: flex;
    align-items: start;
    padding: 20px;
    border-top: 1px solid var(--back);
    gap: 15px;
  }

  .mobile-menu-contact-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex: 1;
  }

  .mobile-menu-contact-info h1 {
    font-weight: 500;
    color: var(--blue);
    line-height: 0.8;
    font-size: var(--f-1);
    margin: 0 0 8px 0;
  }

  .mobile-menu-contact-info p {
    font-size: var(--f-p);
    color: var(--grey);
    margin: 0;
  }

  .mobile-menu-contact img {
    width: 32px;
    height: 32px;
    margin-top: 4px;
  }
  .map {
    display: none;
  }
}
</style>
