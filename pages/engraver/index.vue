<script setup>
definePageMeta({
  key: (route) => route.fullPath,
});

useHead({
  title: "Гравировка",
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
      title="Печати и штампы "
      img="/img/main-carts/engraver/1.svg"
      color="var(--blue_2)"
      hoverBg="var(--blue_2)"
    />
    <MainCarts
      title="Лазерная гравировка"
      img="/img/main-carts/engraver/1.svg"
      color="var(--blue_2)"
      hoverBg="var(--blue_2)"
    />
    <MainCarts
      title="Шильдики"
      img="/img/main-carts/engraver/1.svg"
      color="var(--blue_2)"
      hoverBg="var(--blue_2)"
    />
    <MainCarts
      title="Пломбиры"
      img="/img/main-carts/engraver/1.svg"
      color="var(--blue_2)"
      hoverBg="var(--blue_2)"
    />
    <MainCarts
      title="Термоклеймо"
      img="/img/main-carts/engraver/1.svg"
      color="var(--blue_2)"
      hoverBg="var(--blue_2)"
    />
    <MainCarts
      title="Клише для выжигания на дереве"
      img="/img/main-carts/engraver/1.svg"
      color="var(--blue_2)"
      hoverBg="var(--blue_2)"
    />
    <MainCarts
      title="Клише для тиснения на коже"
      img="/img/main-carts/engraver/1.svg"
      color="var(--blue_2)"
      hoverBg="var(--blue_2)"
    />
    <div class="main-carts"></div>
  </div>
</template>

<style scoped></style>
