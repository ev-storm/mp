<script setup lang="ts">
import type { TileConfig } from "~/types/tiles";
import tilesConfigData from "~/data/tiles-config.json";

const tilesConfig = tilesConfigData as TileConfig;

useHead({
  title: "Главная",
  meta: [
    {
      name: "description",
      content: "",
    },
  ],
});
</script>

<template>
  <TileSystem :config="tilesConfig" />
</template>

<style scoped></style>
