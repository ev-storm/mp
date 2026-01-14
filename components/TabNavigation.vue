<script setup lang="ts">
export interface TabItem {
  to: string;
  label: string;
}

const props = defineProps<{
  tabs: TabItem[];
}>();
</script>

<template>
  <div class="tab-btn-con">
    <NuxtLink
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="tab-btn"
      :class="{
        active: $route.path === tab.to,
      }"
    >
      {{ tab.label }}
    </NuxtLink>
  </div>
</template>

<style scoped>
.tab-btn {
  border-style: none;
  font-size: var(--f-p);
  background: var(--white);
  border-radius: 5px;
  margin-right: 30px;
  margin-bottom: 10px;
  padding: 4px 20px;
  cursor: pointer;
  color: var(--grey);
  transition: var(--tran);
}
.tab-btn-con {
  height: 5vh;
}
.tab-btn.active {
  scale: 1.04;
  color: var(--blue);
  box-shadow: #00000015 0 5px 10px;
}
</style>
