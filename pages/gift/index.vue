<script setup>
definePageMeta({
  key: (route) => route.fullPath,
});

useHead({
  title: "Сувениры",
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
      title="Одежда"
      img="/img/main-carts/gift/1.svg"
      color="var(--orange)"
      hoverBg="var(--orange)"
    />
    <MainCarts
      title="Кружки"
      img="/img/main-carts/gift/2.svg"
      color="var(--orange)"
      hoverBg="var(--orange)"
    />
    <MainCarts
      title="Багетная мастерская"
      img="/img/main-carts/gift/3.svg"
      color="var(--orange)"
      hoverBg="var(--orange)"
    />
    <MainCarts
      title="Магниты на холодильник"
      img="/img/main-carts/gift/4.svg"
      color="var(--orange)"
      hoverBg="var(--orange)"
    />
    <MainCarts
      title="Календари"
      img="/img/main-carts/gift/5.svg"
      color="var(--orange)"
      hoverBg="var(--orange)"
    />
    <div class="main-carts"></div>
  </div>
</template>

<style scoped></style>
