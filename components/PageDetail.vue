<script setup lang="ts">
const props = defineProps<{
  title?: string;
  content?: string;
  content2?: string;
  image?: string;
}>();
</script>

<template>
  <div v-if="title || content || image" class="page-detail">
    <div class="page-detail-content-con">
      <div class="page-detail-content">
        <h1 v-if="title" class="page-detail-title">{{ title }}</h1>
        <div v-if="content" class="page-detail-text" v-html="content"></div>
      </div>
      <div v-if="image" class="page-detail-image">
        <img :src="image" :alt="title || 'Изображение'" />
      </div>
    </div>

    <div v-if="content2" class="page-detail-text2" v-html="content2"></div>
  </div>
</template>

<style scoped>
.page-detail {
  width: 100%;
  background: var(--white);
  border-radius: 8px;
  padding: 40px 100px;
  margin-bottom: 20px;
  display: flex;
  gap: 40px;
  flex-direction: column;
}
.page-detail-content-con {
  display: flex;
}

.page-detail-content {
  flex: 1;
  min-width: 0;
}

.page-detail-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--black);
  margin-bottom: 20px;
  line-height: 1.3;
}

.page-detail-text {
  font-size: var(--f-p);
  color: var(--grey);
  line-height: 1.8;
  width: 70%;
}
.page-detail-text2 {
  font-size: var(--f-p);
  color: var(--grey);
  line-height: 1.8;
  width: 100%;
}

.page-detail-text :deep(p) {
  margin-bottom: 16px;
}

.page-detail-text :deep(p:last-child) {
  margin-bottom: 0;
}

.page-detail-text :deep(ul),
.page-detail-text :deep(ol) {
  margin-left: 20px;
  margin-bottom: 16px;
}

.page-detail-text :deep(li) {
  margin-bottom: 8px;
}

.page-detail-image {
  flex: 0 0 45%;
  max-width: 45%;
  height: auto;
  border-radius: 8px;
  overflow: hidden;
}

.page-detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Адаптивность */
@media (max-width: 1200px) {
  .page-detail {
    flex-direction: column;
    padding: 30px;
  }

  .page-detail-image {
    flex: 1;
    max-width: 100%;
    width: 100%;
  }
}
</style>
