<template>
  <aside class="left-bar">
    <ul class="menu-list">
      <li class="menu-item left-t">
        <div class="menu-title" @click="toggleMenu('typography')">
          Типография
          <span class="arrow" :class="{ open: openMenus.typography }">›</span>
        </div>
        <ul class="submenu" :class="{ open: openMenus.typography }">
          <li>Сканирование документа до А3</li>
          <li>Широкоформатное сканирование</li>
          <li class="divider"></li>
          <li>Печать и копирование до А3</li>
          <li>Широкоформатная печать</li>
          <li>Печать листовок и буклетов</li>
          <li>Печать визиток</li>
          <li>Печать брошюр и книг</li>
          <li>Печать наклеек</li>
          <li>Печать курсовых и дипломных работ</li>
          <li>Печать черчежей</li>
          <li>Печать на кальке</li>
          <li class="divider"></li>
          <li>Ламинирование документов</li>
          <li>Широкоформатное ламинирование</li>
          <li class="divider"></li>
          <li>Переплет на металлическую пружину</li>
          <li>Переплет на пластиковую пружину</li>
          <li>Твердый переплет</li>
          <li class="divider"></li>
          <li>Офсетная печать</li>
          <li>Тиснение фольгой</li>
          <li>Тиражирование на ризографе</li>
        </ul>
      </li>

      <li class="menu-item left-f">
        <div class="menu-title" @click="toggleMenu('photoprint')">
          Фотопечать
          <span class="arrow" :class="{ open: openMenus.photoprint }">›</span>
        </div>
        <ul class="submenu" :class="{ open: openMenus.photoprint }">
          <li>Печать фото</li>
          <li>Мгновенное фото на документы</li>
          <li>Предметная фотосъёмка</li>
          <li class="divider"></li>
          <li>Реставрация Фотографий</li>
          <li>Сканирование пленок</li>
          <li>Печать на CD/DVD</li>
          <li>Фотокниги</li>
          <li>Транспарант "Бессмертный Полк"</li>
          <li>Багетная мастерская</li>
        </ul>
      </li>

      <li class="menu-item left-s">
        <div class="menu-title" @click="toggleMenu('souvenirs')">
          Сувениры
          <span class="arrow" :class="{ open: openMenus.souvenirs }">›</span>
        </div>
        <ul class="submenu" :class="{ open: openMenus.souvenirs }">
          <li>Календари</li>
          <li>Магниты на холодильник</li>
          <li>Печать фото на кружках</li>
          <li>Распечатка конвертов</li>
          <li>Печать на одежде</li>
          <li>Вышивка на одежде</li>
          <li>Изготовление этикеток на одежду</li>
          <li>Пластиковые папки и пакеты</li>
          <li>Изготовление значков</li>
          <li class="divider"></li>
          <li>Пенокартон</li>
          <li>Тампопечать</li>
          <li>Печать на металле</li>
        </ul>
      </li>

      <li class="menu-item left-i">
        <div class="menu-title" @click="toggleMenu('publishing')">
          Издательство
          <span class="arrow" :class="{ open: openMenus.publishing }">›</span>
        </div>
        <ul class="submenu" :class="{ open: openMenus.publishing }">
          <li>Набор текста (в том числе рукописного)</li>
          <li>Корректура</li>
          <li>Редакторская правка</li>
          <li>Спуск полос</li>
          <li>Полиграфическая верстка любой сложности</li>
          <li>Авторам</li>
          <li>Термоклеевое скрепление</li>
        </ul>
      </li>

      <li class="menu-item left-g">
        <div class="menu-title" @click="toggleMenu('engraving')">
          Гравировка
          <span class="arrow" :class="{ open: openMenus.engraving }">›</span>
        </div>
        <ul class="submenu" :class="{ open: openMenus.engraving }">
          <li>Типографское клише</li>
          <li>Печати и штампы</li>
          <li class="divider"></li>
          <li>Лазерная гравировка</li>
          <li>Шильдики</li>
          <li>Гравированные таблички</li>
          <li>Гравировка на свадебных замках</li>
          <li>Гравировка на личных жетонах</li>
          <li>Термоклеймо</li>
          <li>Пломбиры</li>
          <li>Клише для тиснения на коже</li>
          <li>Клише для выжигания на дереве</li>
          <li>Ветеринарное клеймо</li>
          <li>Адресник для животных с гравировкой</li>
        </ul>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";

// @ts-ignore - useRoute is auto-imported by Nuxt
const route = useRoute();

const openMenus = ref({
  typography: false,
  photoprint: false,
  souvenirs: false,
  publishing: false,
  engraving: false,
});

// Маппинг маршрута на ключ меню
const routeToMenuMap: Record<string, keyof typeof openMenus.value> = {
  "/printing": "typography",
  "/photo": "photoprint",
  "/gift": "souvenirs",
  "/publish": "publishing",
  "/engraver": "engraving",
};

// Функция для открытия нужного меню и закрытия остальных
const openMenuByRoute = (path: string) => {
  // Закрываем все меню
  Object.keys(openMenus.value).forEach((key) => {
    openMenus.value[key as keyof typeof openMenus.value] = false;
  });

  // Открываем нужное меню
  const menuKey = routeToMenuMap[path];
  if (menuKey) {
    openMenus.value[menuKey] = true;
  }
};

// Отслеживаем изменения маршрута
watch(
  () => route.path,
  (newPath) => {
    openMenuByRoute(newPath);
  },
  { immediate: true }
);

// При монтировании компонента открываем соответствующее меню
onMounted(() => {
  openMenuByRoute(route.path);
});

const toggleMenu = (menu: keyof typeof openMenus.value) => {
  openMenus.value[menu] = !openMenus.value[menu];
};
</script>

<style scoped>
.left-bar {
  height: 92%;
  width: 20%;
  background: var(--white);
  overflow-y: auto;
  max-height: 1000px;
  min-height: 600px;
  margin: 20px;
  border-radius: 8px;
  padding: 20px;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.left-t .menu-title {
  color: var(--blue);
}
.left-f .menu-title {
  color: var(--red);
}
.left-s .menu-title {
  color: var(--orange);
}
.left-i .menu-title {
  color: var(--green);
}
.left-g .menu-title {
  color: var(--blue_2);
}

.menu-title {
  font-weight: 500;
  font-size: var(--f-2);
  margin-bottom: 10px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  transition: color 0.2s ease;
}

/* .menu-title:hover {
  color: var(--blue);
} */

.arrow {
  font-size: 20px;
  color: var(--grey);
  transition: transform 0.3s ease;
  display: inline-block;
}

.arrow.open {
  transform: rotate(90deg);
}

.submenu {
  list-style: none;
  padding: 0;
  margin: 0;
  padding-left: 15px;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease;
  opacity: 0;
}

.submenu.open {
  max-height: 1000px;
  opacity: 1;
}

.submenu li {
  font-size: var(--f-p);
  color: var(--grey);
  margin-bottom: 8px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.left-t .submenu li:hover {
  color: var(--blue);
}
.left-f .submenu li:hover {
  color: var(--red);
}
.left-s .submenu li:hover {
  color: var(--orange);
}
.left-i .submenu li:hover {
  color: var(--green);
}
.left-g .submenu li:hover {
  color: var(--blue_2);
}

.submenu .divider {
  height: 1px;
  background-color: var(--back);
  margin: 10px 0;
  cursor: default;
}
</style>
