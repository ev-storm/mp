<script setup lang="ts">
import { ref, onMounted, watch } from "vue";

const props = defineProps<{
  title: string;
  img: string;
  color: string;
  hoverBg: string;
  link?: string;
}>();

const svgContainer = ref<HTMLElement | null>(null);

async function loadSvg() {
  if (!svgContainer.value) return;
  try {
    const response = await fetch(props.img);
    const svgText = await response.text();
    svgContainer.value.innerHTML = svgText;

    // Добавляем stroke-dasharray ко всем path, stroke-dashoffset = 0 (видимый)
    const paths = svgContainer.value.querySelectorAll(
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

onMounted(() => loadSvg());
watch(() => props.img, loadSvg);
</script>

<template>
  <NuxtLink
    v-if="link"
    :to="link"
    class="main-carts"
    :style="{ '--icon-color': color, '--hover-bg': hoverBg }"
  >
    <div ref="svgContainer" class="svg-icon"></div>
    <h2 :style="{ color }">{{ title }}</h2>
  </NuxtLink>
  <div
    v-else
    class="main-carts"
    :style="{ '--icon-color': color, '--hover-bg': hoverBg }"
  >
    <div ref="svgContainer" class="svg-icon"></div>
    <h2 :style="{ color }">{{ title }}</h2>
  </div>
</template>

<style scoped>
.main-carts {
  width: 40%;
  max-width: 500px;
  height: 200px;
  background: var(--white);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
  border-radius: 6px;
  margin: 10px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.main-carts:hover {
  background: var(--hover-bg);
  box-shadow: #00000030 0px 5px 20px;
  scale: 1.05;
}
.main-carts:active {
  scale: 1.02;
}
.main-carts:hover h2 {
  color: #fff !important;
}
.main-carts h2 {
  width: 70%;
  font-size: 20px;
  word-wrap: break-word;
  line-height: 1.2;
}
.svg-icon {
  width: 25%;
  margin-left: 75%;
}
.svg-icon :deep(svg) {
  width: 100%;
  height: auto;
}
.svg-icon :deep(path),
.svg-icon :deep(line),
.svg-icon :deep(circle),
.svg-icon :deep(rect),
.svg-icon :deep(polyline),
.svg-icon :deep(polygon) {
  stroke: var(--icon-color);
  fill: none;
}
.main-carts:hover .svg-icon :deep(path),
.main-carts:hover .svg-icon :deep(line),
.main-carts:hover .svg-icon :deep(circle),
.main-carts:hover .svg-icon :deep(rect),
.main-carts:hover .svg-icon :deep(polyline),
.main-carts:hover .svg-icon :deep(polygon) {
  stroke: #fff;
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

@media (max-width: 799px) {
  .main-carts {
    width: 100%;
  }
  .svg-icon {
    width: 35%;
    margin-left: 70%;
  }
  .svg-icon svg {
    width: 80%;
  }
  .main-carts h2[data-v-aac3728f] {
    margin-top: -10%;
  }
}
</style>
