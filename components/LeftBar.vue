<template>
  <aside class="left-bar">
    <ul class="menu-list">
      <li class="menu-item left-t">
        <div class="menu-title" @click="toggleMenu('typography')">
          Типография
          <span class="arrow" :class="{ open: openMenus.typography }">›</span>
        </div>
        <ul class="submenu" :class="{ open: openMenus.typography }">
          <li
            data-menu-id="t1"
            :class="{ highlighted: highlightedItemId === 't1' }"
          >
            <NuxtLink
              to="/printing/scan"
              :class="{
                'active-parent': route.path === '/printing/scan',
              }"
              >Сканирование документа до А3</NuxtLink
            >
          </li>
          <li
            data-menu-id="t2"
            :class="{ highlighted: highlightedItemId === 't2' }"
          >
            <NuxtLink
              to="/printing/large/scan"
              :class="{
                'active-parent': route.path.startsWith('/printing/large/scan'),
              }"
              >Широкоформатное сканирование</NuxtLink
            >
          </li>
          <li class="divider"></li>
          <li
            data-menu-id="t3"
            :class="{ highlighted: highlightedItemId === 't3' }"
          >
            <NuxtLink
              to="/printing/scan/print"
              :class="{
                'active-parent': route.path.startsWith('/printing/scan/print'),
              }"
              >Печать и копирование до А3</NuxtLink
            >
          </li>
          <li
            data-menu-id="t4"
            :class="{ highlighted: highlightedItemId === 't4' }"
          >
            <NuxtLink
              to="/printing/large/print"
              :class="{
                'active-parent': route.path.startsWith('/printing/large/print'),
              }"
              >Широкоформатная печать</NuxtLink
            >
          </li>
          <li
            data-menu-id="t5"
            :class="{ highlighted: highlightedItemId === 't5' }"
          >
            <NuxtLink
              to="/printing/catalogs"
              :class="{
                'active-parent': route.path.startsWith('/printing/catalogs'),
              }"
              >Печать листовок и буклетов</NuxtLink
            >
          </li>
          <li
            data-menu-id="t6"
            :class="{ highlighted: highlightedItemId === 't6' }"
          >
            <NuxtLink
              to="/printing/visit-card/laser-print"
              :class="{
                'active-parent': route.path.startsWith('/printing/visit-card'),
              }"
              >Печать визиток</NuxtLink
            >
          </li>
          <li
            data-menu-id="t7"
            :class="{ highlighted: highlightedItemId === 't7' }"
          >
            <NuxtLink
              to="/printing/catalogs"
              :class="{
                'active-parent': route.path.startsWith('/printing/catalogs'),
              }"
              >Печать брошюр и книг</NuxtLink
            >
          </li>
          <li
            data-menu-id="t8"
            :class="{ highlighted: highlightedItemId === 't8' }"
          >
            <NuxtLink
              to="/printing/stickers/stickers-print"
              :class="{
                'active-parent': route.path.startsWith('/printing/stickers'),
              }"
              >Наклейки и плоттерная резка</NuxtLink
            >
          </li>
          <li
            data-menu-id="t9"
            :class="{ highlighted: highlightedItemId === 't9' }"
          >
            <NuxtLink
              to="/printing/diplom"
              :class="{
                'active-parent': route.path.startsWith('/printing/diplom'),
              }"
              >Печать курсовых и дипломных работ</NuxtLink
            >
          </li>
          <li
            data-menu-id="t10"
            :class="{ highlighted: highlightedItemId === 't10' }"
          >
            <NuxtLink
              to="/printing/large/plan"
              :class="{
                'active-parent': route.path.startsWith('/printing/large/plan'),
              }"
              >Печать черчежей</NuxtLink
            >
          </li>
          <li
            data-menu-id="t11"
            :class="{ highlighted: highlightedItemId === 't11' }"
          >
            <NuxtLink
              to="/printing/tracing"
              :class="{
                'active-parent': route.path.startsWith('/printing/tracing'),
              }"
              >Печать на кальке</NuxtLink
            >
          </li>
          <li class="divider"></li>
          <li
            data-menu-id="t12"
            :class="{ highlighted: highlightedItemId === 't12' }"
          >
            <NuxtLink
              to="/printing/lamination/doc"
              :class="{
                'active-parent':
                  route.path.startsWith('/printing/lamination/doc') ||
                  route.path.startsWith('/printing/lamination/more'),
              }"
              >Ламинирование документов</NuxtLink
            >
          </li>
          <li
            data-menu-id="t13"
            :class="{ highlighted: highlightedItemId === 't13' }"
          >
            <NuxtLink
              to="/printing/lamination/large"
              :class="{
                'active-parent':
                  route.path.startsWith('/printing/lamination/large') ||
                  route.path.startsWith('/printing/lamination/more'),
              }"
              >Широкоформатное ламинирование</NuxtLink
            >
          </li>
          <li class="divider"></li>
          <li
            data-menu-id="t14"
            :class="{ highlighted: highlightedItemId === 't14' }"
          >
            <NuxtLink
              to="/printing/bind/metal"
              :class="{
                'active-parent': route.path.startsWith('/printing/bind/metal'),
              }"
              >Переплет на металлическую пружину</NuxtLink
            >
          </li>
          <li
            data-menu-id="t15"
            :class="{ highlighted: highlightedItemId === 't15' }"
          >
            <NuxtLink
              to="/printing/bind/plastic"
              :class="{
                'active-parent': route.path.startsWith(
                  '/printing/bind/plastic'
                ),
              }"
              >Переплет на пластиковую пружину</NuxtLink
            >
          </li>
          <li
            data-menu-id="t16"
            :class="{ highlighted: highlightedItemId === 't16' }"
          >
            <NuxtLink
              to="/printing/bind/hard"
              :class="{
                'active-parent': route.path.startsWith('/printing/bind/hard'),
              }"
              >Твердый переплет</NuxtLink
            >
          </li>
          <li class="divider"></li>
          <li
            data-menu-id="t17"
            :class="{ highlighted: highlightedItemId === 't17' }"
          >
            Офсетная печать
          </li>
          <li
            data-menu-id="t18"
            :class="{ highlighted: highlightedItemId === 't18' }"
          >
            Тиснение фольгой
          </li>
          <li
            data-menu-id="t19"
            :class="{ highlighted: highlightedItemId === 't19' }"
          >
            <NuxtLink
              to="/printing/replication"
              :class="{
                'active-parent': route.path.startsWith('/printing/replication'),
              }"
              >Тиражирование на ризографе</NuxtLink
            >
          </li>
        </ul>
      </li>

      <li class="menu-item left-f">
        <div class="menu-title" @click="toggleMenu('photoprint')">
          Фотопечать
          <span class="arrow" :class="{ open: openMenus.photoprint }">›</span>
        </div>
        <ul class="submenu" :class="{ open: openMenus.photoprint }">
          <li
            data-menu-id="f1"
            :class="{ highlighted: highlightedItemId === 'f1' }"
          >
            Печать фото
          </li>
          <li
            data-menu-id="f2"
            :class="{ highlighted: highlightedItemId === 'f2' }"
          >
            Мгновенное фото на документы
          </li>
          <li
            data-menu-id="f3"
            :class="{ highlighted: highlightedItemId === 'f3' }"
          >
            Предметная фотосъёмка
          </li>
          <li class="divider"></li>
          <li
            data-menu-id="f4"
            :class="{ highlighted: highlightedItemId === 'f4' }"
          >
            Реставрация Фотографий
          </li>
          <li
            data-menu-id="f5"
            :class="{ highlighted: highlightedItemId === 'f5' }"
          >
            Сканирование пленок
          </li>
          <li
            data-menu-id="f6"
            :class="{ highlighted: highlightedItemId === 'f6' }"
          >
            Печать на CD/DVD
          </li>
          <li
            data-menu-id="f7"
            :class="{ highlighted: highlightedItemId === 'f7' }"
          >
            Фотокниги
          </li>
          <li
            data-menu-id="f8"
            :class="{ highlighted: highlightedItemId === 'f8' }"
          >
            Транспарант "Бессмертный Полк"
          </li>
          <li
            data-menu-id="f9"
            :class="{ highlighted: highlightedItemId === 'f9' }"
          >
            Багетная мастерская
          </li>
        </ul>
      </li>

      <li class="menu-item left-s">
        <div class="menu-title" @click="toggleMenu('souvenirs')">
          Сувениры
          <span class="arrow" :class="{ open: openMenus.souvenirs }">›</span>
        </div>
        <ul class="submenu" :class="{ open: openMenus.souvenirs }">
          <li
            data-menu-id="s1"
            :class="{ highlighted: highlightedItemId === 's1' }"
          >
            Календари
          </li>
          <li
            data-menu-id="s2"
            :class="{ highlighted: highlightedItemId === 's2' }"
          >
            Магниты на холодильник
          </li>
          <li
            data-menu-id="s3"
            :class="{ highlighted: highlightedItemId === 's3' }"
          >
            Печать фото на кружках
          </li>
          <li
            data-menu-id="s4"
            :class="{ highlighted: highlightedItemId === 's4' }"
          >
            Распечатка конвертов
          </li>
          <li
            data-menu-id="s5"
            :class="{ highlighted: highlightedItemId === 's5' }"
          >
            Печать на одежде
          </li>
          <li
            data-menu-id="s6"
            :class="{ highlighted: highlightedItemId === 's6' }"
          >
            Вышивка на одежде
          </li>
          <li
            data-menu-id="s7"
            :class="{ highlighted: highlightedItemId === 's7' }"
          >
            Изготовление этикеток на одежду
          </li>
          <li
            data-menu-id="s8"
            :class="{ highlighted: highlightedItemId === 's8' }"
          >
            Пластиковые папки и пакеты
          </li>
          <li
            data-menu-id="s9"
            :class="{ highlighted: highlightedItemId === 's9' }"
          >
            Изготовление значков
          </li>
          <li class="divider"></li>
          <li
            data-menu-id="s10"
            :class="{ highlighted: highlightedItemId === 's10' }"
          >
            Пенокартон
          </li>
          <li
            data-menu-id="s11"
            :class="{ highlighted: highlightedItemId === 's11' }"
          >
            Тампопечать
          </li>
          <li
            data-menu-id="s12"
            :class="{ highlighted: highlightedItemId === 's12' }"
          >
            Печать на металле
          </li>
        </ul>
      </li>

      <li class="menu-item left-i">
        <div class="menu-title" @click="toggleMenu('publishing')">
          Издательство
          <span class="arrow" :class="{ open: openMenus.publishing }">›</span>
        </div>
        <ul class="submenu" :class="{ open: openMenus.publishing }">
          <li
            data-menu-id="i1"
            :class="{ highlighted: highlightedItemId === 'i1' }"
          >
            Набор текста (в том числе рукописного)
          </li>
          <li
            data-menu-id="i2"
            :class="{ highlighted: highlightedItemId === 'i2' }"
          >
            Корректура
          </li>
          <li
            data-menu-id="i3"
            :class="{ highlighted: highlightedItemId === 'i3' }"
          >
            Редакторская правка
          </li>
          <li
            data-menu-id="i4"
            :class="{ highlighted: highlightedItemId === 'i4' }"
          >
            Спуск полос
          </li>
          <li
            data-menu-id="i5"
            :class="{ highlighted: highlightedItemId === 'i5' }"
          >
            Полиграфическая верстка любой сложности
          </li>
          <li
            data-menu-id="i6"
            :class="{ highlighted: highlightedItemId === 'i6' }"
          >
            Авторам
          </li>
          <li
            data-menu-id="i7"
            :class="{ highlighted: highlightedItemId === 'i7' }"
          >
            Термоклеевое скрепление
          </li>
        </ul>
      </li>

      <li class="menu-item left-g">
        <div class="menu-title" @click="toggleMenu('engraving')">
          Гравировка
          <span class="arrow" :class="{ open: openMenus.engraving }">›</span>
        </div>
        <ul class="submenu" :class="{ open: openMenus.engraving }">
          <li
            data-menu-id="g1"
            :class="{ highlighted: highlightedItemId === 'g1' }"
          >
            Типографское клише
          </li>
          <li
            data-menu-id="g2"
            :class="{ highlighted: highlightedItemId === 'g2' }"
          >
            Печати и штампы
          </li>
          <li class="divider"></li>
          <li
            data-menu-id="g3"
            :class="{ highlighted: highlightedItemId === 'g3' }"
          >
            Лазерная гравировка
          </li>
          <li
            data-menu-id="g4"
            :class="{ highlighted: highlightedItemId === 'g4' }"
          >
            Шильдики
          </li>
          <li
            data-menu-id="g5"
            :class="{ highlighted: highlightedItemId === 'g5' }"
          >
            Гравированные таблички
          </li>
          <li
            data-menu-id="g6"
            :class="{ highlighted: highlightedItemId === 'g6' }"
          >
            Гравировка на свадебных замках
          </li>
          <li
            data-menu-id="g7"
            :class="{ highlighted: highlightedItemId === 'g7' }"
          >
            Гравировка на личных жетонах
          </li>
          <li
            data-menu-id="g8"
            :class="{ highlighted: highlightedItemId === 'g8' }"
          >
            Термоклеймо
          </li>
          <li
            data-menu-id="g9"
            :class="{ highlighted: highlightedItemId === 'g9' }"
          >
            Пломбиры
          </li>
          <li
            data-menu-id="g10"
            :class="{ highlighted: highlightedItemId === 'g10' }"
          >
            Клише для тиснения на коже
          </li>
          <li
            data-menu-id="g11"
            :class="{ highlighted: highlightedItemId === 'g11' }"
          >
            Клише для выжигания на дереве
          </li>
          <li
            data-menu-id="g12"
            :class="{ highlighted: highlightedItemId === 'g12' }"
          >
            Ветеринарное клеймо
          </li>
          <li
            data-menu-id="g13"
            :class="{ highlighted: highlightedItemId === 'g13' }"
          >
            Адресник для животных с гравировкой
          </li>
        </ul>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from "vue";
import { useMenuSearch } from "~/composables/useMenuSearch";

// @ts-ignore - useRoute is auto-imported by Nuxt
const route = useRoute();

// Composable для поиска
const { highlightedItemId, menuItems } = useMenuSearch();

const openMenus = ref({
  typography: false,
  photoprint: false,
  souvenirs: false,
  publishing: false,
  engraving: false,
});

// Отслеживаем изменение highlightedItemId для открытия меню и скролла
watch(highlightedItemId, async (newId: string | null) => {
  if (newId) {
    // Найти элемент в menuItems
    const item = menuItems.find((m) => m.id === newId);
    if (item) {
      // Открыть соответствующее меню
      const categoryKey = item.categoryKey as keyof typeof openMenus.value;
      if (categoryKey && !openMenus.value[categoryKey]) {
        openMenus.value[categoryKey] = true;
      }

      // Дождаться обновления DOM и прокрутить к элементу
      await nextTick();
      setTimeout(() => {
        const element = document.querySelector(`[data-menu-id="${newId}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  }
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

  // Открываем нужное меню (проверяем и вложенные маршруты)
  let menuKey = routeToMenuMap[path];
  if (!menuKey) {
    // Проверяем родительские маршруты
    if (path.startsWith("/printing")) menuKey = "typography";
    else if (path.startsWith("/photo")) menuKey = "photoprint";
    else if (path.startsWith("/gift")) menuKey = "souvenirs";
    else if (path.startsWith("/publish")) menuKey = "publishing";
    else if (path.startsWith("/engraver")) menuKey = "engraving";
  }
  if (menuKey) {
    openMenus.value[menuKey] = true;
  }
};

// Отслеживаем изменения маршрута
watch(
  () => route.path,
  (newPath: string) => {
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
  height: 80vh;
  width: 20%;
  background: var(--white);
  overflow-y: auto;
  max-height: 1000px;
  margin: 0 20px;
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
  height: 2px;
  background-color: var(--back);
  margin: 10px 0;
  cursor: default;
}

.submenu li a {
  color: inherit;
  text-decoration: none;
}

/* Active link styles */
.left-t .submenu li a.router-link-active,
.left-t .submenu li a.active-parent {
  color: var(--blue);
  font-weight: 600;
}
.left-f .submenu li a.router-link-active,
.left-f .submenu li a.active-parent {
  color: var(--red);
  font-weight: 600;
}
.left-s .submenu li a.router-link-active,
.left-s .submenu li a.active-parent {
  color: var(--orange);
  font-weight: 600;
}
.left-i .submenu li a.router-link-active,
.left-i .submenu li a.active-parent {
  color: var(--green);
  font-weight: 600;
}
.left-g .submenu li a.router-link-active,
.left-g .submenu li a.active-parent {
  color: var(--blue_2);
  font-weight: 600;
}

/* Highlighted search result styles */
.submenu li.highlighted {
  position: relative;
  animation: highlightPulse 3s ease-out;
  border-radius: 4px;
}

.left-t .submenu li.highlighted {
  background: linear-gradient(
    90deg,
    rgba(107, 160, 229, 0.2) 0%,
    transparent 100%
  );
  color: var(--blue);
  font-weight: 600;
}

.left-f .submenu li.highlighted {
  background: linear-gradient(
    90deg,
    rgba(234, 96, 103, 0.2) 0%,
    transparent 100%
  );
  color: var(--red);
  font-weight: 600;
}

.left-s .submenu li.highlighted {
  background: linear-gradient(
    90deg,
    rgba(255, 156, 94, 0.2) 0%,
    transparent 100%
  );
  color: var(--orange);
  font-weight: 600;
}

.left-i .submenu li.highlighted {
  background: linear-gradient(
    90deg,
    rgba(69, 170, 130, 0.2) 0%,
    transparent 100%
  );
  color: var(--green);
  font-weight: 600;
}

.left-g .submenu li.highlighted {
  background: linear-gradient(
    90deg,
    rgba(52, 178, 232, 0.2) 0%,
    transparent 100%
  );
  color: var(--blue_2);
  font-weight: 600;
}

@keyframes highlightPulse {
  0% {
    box-shadow: 0 0 0 0 currentColor;
  }
  20% {
    box-shadow: 0 0 8px 2px currentColor;
  }
  100% {
    box-shadow: 0 0 0 0 transparent;
  }
}
</style>
