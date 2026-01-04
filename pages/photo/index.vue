<script setup>
definePageMeta({
  key: route => route.fullPath,
});

useHead({
  title: "Фотопечать",
  meta: [
    {
      name: "description",
      content: "",
    },
  ],
});
</script>

<template>
  <div class="main-carts-con">
    <MainCarts
      title="Фото на документы"
      img="/img/main-carts/photo/1.svg"
      color="var(--red)"
      hoverBg="var(--red)"
    />
    <MainCarts
      title="Печать фото"
      img="/img/main-carts/photo/2.svg"
      color="var(--red)"
      hoverBg="var(--red)"
    />
    <MainCarts
      title="Сканирование пленок"
      img="/img/main-carts/photo/3.svg"
      color="var(--red)"
      hoverBg="var(--red)"
    />
    <MainCarts
      title="Фотокниги"
      img="/img/main-carts/photo/4.svg"
      color="var(--red)"
      hoverBg="var(--red)"
    />
    <MainCarts
      title="Печать на CD/DVD"
      img="/img/main-carts/photo/5.svg"
      color="var(--red)"
      hoverBg="var(--red)"
    />
    <MainCarts
      title="Транспарант «Бессмертный Полк»"
      img="/img/main-carts/photo/6.svg"
      color="var(--red)"
      hoverBg="var(--red)"
    />
  </div>
</template>

<style scoped></style>

