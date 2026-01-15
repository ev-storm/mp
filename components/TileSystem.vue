<script setup lang="ts">
import type { Tile, TileConfig } from "~/types/tiles";
import { ref, onMounted, nextTick } from "vue";

const props = defineProps<{
  config: TileConfig;
}>();

const GRID_COLUMNS = 4; // Всегда 4 сегмента от prev-carts-con
const SEGMENT_SIZE = 40; // 1 сегмент = 20vh

// Функция загрузки SVG (аналогично MainCarts)
async function loadSvg(imgPath: string, container: HTMLElement | null) {
  if (!container || !imgPath) return;

  try {
    const response = await fetch(imgPath);
    const svgText = await response.text();
    container.innerHTML = svgText;

    // Добавляем stroke-dasharray ко всем path, stroke-dashoffset = 0 (видимый)
    const paths = container.querySelectorAll(
      "path, line, circle, rect, polyline, polygon"
    );
    paths.forEach((path) => {
      const el = path as SVGGeometryElement;
      if (el.getTotalLength) {
        const length = el.getTotalLength();
        el.style.strokeDasharray = `${length}`;
        el.style.strokeDashoffset = "0";
        el.style.setProperty("--path-length", `${length}`);
      }
    });
  } catch (e) {
    console.error("Failed to load SVG:", e);
  }
}

// Функция для установки ref и загрузки SVG
const setSvgRef = (el: any, imgPath: string | undefined) => {
  if (el && imgPath && el instanceof HTMLElement) {
    nextTick(() => {
      loadSvg(imgPath, el);
    });
  }
};

const getColor = (color?: string): string => {
  if (!color) return "";
  const colorMap: Record<string, string> = {
    blue: "var(--blue)",
    orange: "var(--orange)",
    red: "var(--red)",
    green: "var(--green)",
  };
  return colorMap[color] || "";
};

// Все tile рассчитываются от prev-carts-con (4 сегмента)
// width: 1 = 20vh, width: 2 = 40vh, width: 3 = 60vh, width: 4 = 80vh
const getTileWidth = (width: number): string => {
  return `${width * SEGMENT_SIZE}vh`;
};

// height: 1 = 20vh, height: 2 = 40vh, height: 3 = 60vh
const getTileHeight = (height: number): string => {
  return `${height * SEGMENT_SIZE}vh`;
};

// Расчет ширины контейнера в сегментах (от 1 до 4)
const calculateContainerWidth = (
  children: Tile[] | undefined,
  direction?: string
): number => {
  if (!children) return 0;

  // По умолчанию direction = "row", только если явно указано "column"
  const isColumn = direction === "column";

  // Для row - суммируем ширины всех дочерних элементов
  if (!isColumn) {
    return children.reduce((sum, child) => {
      if (child.type === "tile" && child.width) {
        return sum + child.width;
      } else if (child.children) {
        // Рекурсивно считаем ширину вложенного контейнера
        // По умолчанию row, только если явно указано column
        const childDirection = child.direction === "column" ? "column" : "row";
        return sum + calculateContainerWidth(child.children, childDirection);
      }
      return sum;
    }, 0);
  }

  // Для column - берем максимальную ширину
  return Math.max(
    ...children.map((child) => {
      if (child.type === "tile" && child.width) {
        return child.width;
      } else if (child.children) {
        const childDirection = child.direction === "column" ? "column" : "row";
        return calculateContainerWidth(child.children, childDirection);
      }
      return 0;
    })
  );
};

// Маппинг title -> link для известных страниц
const titleToLinkMap: Record<string, string> = {
  "Печать наклеек и плотерная резка": "/printing/stickers/stickers-print",
  "Печать листовок и буклетов": "/printing/booklet/laser-print",
  "Печать визиток": "/printing/visit-card/laser-print",
  "Печать и сканирование до А3": "/printing/scan/print",
  "Тиражированиена ризографе": "/printing/replication",
  "Тиражирование на ризографе": "/printing/replication",
  "Набор текста (в том числе рукописного)": "/",
  Ламинирование: "/printing/lamination/more",
};

// Получение ссылки для tile
const getTileLink = (tile: Tile): string => {
  // Если link указан в JSON, используем его
  if (tile.link) {
    return tile.link;
  }
  // Если есть title, ищем в маппинге
  if (tile.title) {
    const mappedLink = titleToLinkMap[tile.title];
    if (mappedLink) {
      return mappedLink;
    }
  }
  // Иначе на главную
  return "/";
};
</script>

<template>
  <div class="prev-carts-con">
    <!-- tile-con: всегда row, 100% от prev-carts-con -->
    <div v-for="(tileCon, index) in config.tiles" :key="index" class="tile-con">
      <template
        v-for="(child, childIndex) in tileCon.children"
        :key="childIndex"
      >
        <!-- tile: простая плитка, всегда от prev-carts-con -->
        <div
          v-if="child.type === 'tile'"
          class="tile"
          :style="{
            width: getTileWidth(child.width || 0),
            height: getTileHeight(child.height || 1),
          }"
        >
          <NuxtLink
            :to="getTileLink(child)"
            class="tile-card"
            :style="{
              backgroundColor: getColor(child.color),
            }"
          >
            <div v-if="child.img" class="tile-card-img-con">
              <div
                :ref="(el) => setSvgRef(el, child.img)"
                class="tile-card-svg"
              ></div>
            </div>

            <h1 v-if="child.title">{{ child.title }}</h1>
          </NuxtLink>
        </div>

        <!-- tile-sub-con: по умолчанию row, только если явно указано column -->
        <div
          v-else-if="child.type === 'tile-sub-con'"
          class="tile-sub-con"
          :style="{
            flexDirection: child.direction === 'column' ? 'column' : 'row',
            width: getTileWidth(
              calculateContainerWidth(child.children, child.direction)
            ),
          }"
        >
          <template
            v-for="(subChild, subIndex) in child.children"
            :key="subIndex"
          >
            <!-- tile внутри tile-sub-con -->
            <div
              v-if="subChild.type === 'tile'"
              class="tile"
              :style="{
                width: getTileWidth(subChild.width || 0),
                height: getTileHeight(subChild.height || 1),
              }"
            >
              <NuxtLink
                :to="getTileLink(subChild)"
                class="tile-card"
                :style="{
                  backgroundColor: getColor(subChild.color),
                }"
              >
                <div v-if="subChild.img" class="tile-card-img-con">
                  <div
                    :ref="(el) => setSvgRef(el, subChild.img)"
                    class="tile-card-svg"
                  ></div>
                </div>
                <h1 v-if="subChild.title">{{ subChild.title }}</h1>
              </NuxtLink>
            </div>

            <!-- tile-sub-sub-con (вложенный tile-sub-con) -->
            <div
              v-else-if="subChild.type === 'tile-sub-sub-con'"
              class="tile-sub-sub-con"
              :style="{
                flexDirection:
                  subChild.direction === 'column' ? 'column' : 'row',
                width: getTileWidth(
                  calculateContainerWidth(subChild.children, subChild.direction)
                ),
              }"
            >
              <div
                v-for="(subSubChild, subSubIndex) in subChild.children"
                :key="subSubIndex"
                class="tile"
                :style="{
                  width: getTileWidth(subSubChild.width || 0),
                  height: getTileHeight(subSubChild.height || 1),
                }"
              >
                <NuxtLink
                  :to="getTileLink(subSubChild)"
                  class="tile-card"
                  :style="{
                    backgroundColor: getColor(subSubChild.color),
                  }"
                >
                  <div v-if="subSubChild.img" class="tile-card-img-con">
                    <div
                      :ref="(el) => setSvgRef(el, subSubChild.img)"
                      class="tile-card-svg"
                    ></div>
                  </div>
                  <h1 v-if="subSubChild.title">{{ subSubChild.title }}</h1>
                </NuxtLink>
              </div>
            </div>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* 1. prev-carts-con - главный фрейм (4,n), всегда column, 100% ширины */
.prev-carts-con {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 0px;
  height: 87vh;
  overflow: scroll;
}

/* 2. tile-con - всегда row, 100% от prev-carts-con */
.tile-con {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
}

/* 3. tile-sub-con - может быть column или row */
.tile-sub-con {
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
}

/* tile-sub-sub-con (вложенный tile-sub-con) */
.tile-sub-sub-con {
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
}

.tile {
  padding: 10px;
  flex-grow: 0;
  flex-shrink: 0;
}

.tile-card {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  flex-direction: column;
  justify-content: space-between;
  padding: 4vh;
  display: flex;
  cursor: pointer;
  transition: var(--tran2);
  text-decoration: none;
  color: inherit;
}
.tile-card:hover {
  scale: 0.98;
  box-shadow: #00000030 0 0px 10px;
}
.tile-card-img-con {
  width: 100%;
  display: flex;
  justify-content: end;
}
.tile-card-svg {
  width: 20vh;
  height: 20vh;
}

.tile-card-svg :deep(svg) {
  width: 100%;
  height: 100%;
}

.tile-card-svg :deep(path),
.tile-card-svg :deep(line),
.tile-card-svg :deep(circle),
.tile-card-svg :deep(rect),
.tile-card-svg :deep(polyline),
.tile-card-svg :deep(polygon) {
  stroke: var(--white);
  fill: none;
}

.tile-card:hover .tile-card-svg :deep(path),
.tile-card:hover .tile-card-svg :deep(line),
.tile-card:hover .tile-card-svg :deep(circle),
.tile-card:hover .tile-card-svg :deep(rect),
.tile-card:hover .tile-card-svg :deep(polyline),
.tile-card:hover .tile-card-svg :deep(polygon) {
  stroke: var(--white);
  animation: draw-stroke 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes draw-stroke {
  0% {
    stroke-dashoffset: var(--path-length, 1000);
  }
  100% {
    stroke-dashoffset: 0;
  }
}
.tile-card h1 {
  color: var(--white);
  font-size: 25px;
  line-height: 1.1;
  font-weight: 500;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

@media (max-width: 799px) {
  .tile-con {
    flex-direction: column;
    width: 100% !important;
  }

  .tile-sub-con {
    flex-direction: column;
    width: 100% !important;
  }

  .tile-sub-sub-con {
    flex-direction: column;
    width: 100% !important;
  }

  .tile {
    width: 100% !important;
  }
}
</style>
