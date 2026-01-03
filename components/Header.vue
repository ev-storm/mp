<template>
  <header class="header">
    <div class="header-con">
      <div class="logo-con">
        <img src="/assets/svg/logo.svg" alt="" />
        <h1>Митино<br />Принт</h1>
      </div>
      <div class="header-link-con">
        <div class="header-link-up">
          <ul>
            <li>Магазин</li>
            <li class="mi">|</li>
            <li>О компании</li>
            <li class="mi">|</li>
            <li>Портфолио</li>
            <li class="mi">|</li>
            <li>Тех. требования</li>
          </ul>
          <div class="header-link-up-contact-con">
            <div class="header-link-up-contact">
              <h1>8 495 794-81-15</h1>
              <p>mitino-print@yandex.ru</p>
            </div>
            <img src="/assets/svg/mail.svg" alt="" />
          </div>
        </div>
        <div
          class="header-link-main"
          :class="{ 'search-focused': isSearchFocused }"
        >
          <MainButton
            text="Типография"
            svg-path="/img/main-btn/t.svg"
            color="var(--blue)"
          />
          <MainButton
            text="Фотопечать"
            svg-path="/img/main-btn/f.svg"
            color="var(--red)"
          />
          <MainButton
            text="Сувениры"
            svg-path="/img/main-btn/s.svg"
            color="var(--orange)"
          />
          <MainButton
            text="Издательство"
            svg-path="/img/main-btn/i.svg"
            color="var(--green)"
          />
          <MainButton
            text="Гравюровка"
            svg-path="/img/main-btn/g.svg"
            color="var(--blue_2)"
          />
          <input
            class="main-search"
            type="search"
            placeholder="Поиск"
            @focus="isSearchFocused = true"
            @blur="isSearchFocused = false"
          />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface NavItem {
  path: string;
  label: string;
}

interface Props {
  navItems?: NavItem[];
}

const props = withDefaults(defineProps<Props>(), {
  navItems: () => [
    { path: "/", label: "Главная" },
    { path: "/about", label: "О нас" },
  ],
});

const isSearchFocused = ref(false);
</script>

<style scoped>
.header {
  width: 100%;
  height: 13vh;
  background-color: var(--back);
  position: fixed;
  top: 0;
  z-index: 100;
  padding: 0 0;
  display: flex;
  justify-content: center;
}
.header-con {
  max-width: 1800px;
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.logo-con {
  display: flex;
  align-items: center;
}
.logo-con img {
  width: 70px;
  margin: 10px 15px;
}
.logo-con h1 {
  display: flex;
  font-weight: 500;
  text-align: end;
  font-size: 22px;
  line-height: 1.2;
  text-transform: uppercase;
}
.header-link-con {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: end;
  width: 85%;
}
.header-link-up {
  display: flex;
  align-items: center;
  margin: 10px 15px;
}
.header-link-up ul {
  display: flex;

  cursor: pointer;
}
.header-link-up-contact-con {
  display: flex;
  align-items: start;
}
.header-link-up-contact {
  display: flex;
  flex-direction: column;
  align-items: end;
  margin: 0 15px 0 30px;
}
.header-link-up-contact-con img {
  width: 55px;
}
.header-link-up-contact h1 {
  font-weight: 500;
  color: var(--blue);
  line-height: 0.8;
}
.header-link-main {
  display: flex;
  justify-content: flex-end;
}
.header-link-main input {
  font-size: var(--f-2);
}
.header-link-up ul li {
  font-size: var(--f-2);
  color: var(--grey);
  margin: 0 10px;
}
.mi {
  cursor: default;
}
.main-search {
  width: 150px;
  border-radius: 5px;
  padding: 2px 20px;
  margin: 5px 15px;
  background: var(--white);
  border-style: none;
  transition: all 0.5s ease-in-out;
}
.main-search:focus {
  width: 550px;
}

/* Плавно скрываем текст в кнопках при фокусе на поиск */
.header-link-main.search-focused :deep(.main-btn h2) {
  max-width: 0;
  opacity: 0;
  padding: 0;
  margin: 0;
}

/* Скрываем текст в кнопках при ширине экрана меньше 1300px */
@media (max-width: 1400px) {
  .header-link-main :deep(.main-btn h2) {
    max-width: 0;
    opacity: 0;
    padding: 0;
    margin: 0;
  }
  .logo-con h1 {
    display: none;
  }
}
/* 
.main-btn {
  background: #ffffff;
  border-style: none;
  margin: 0px 20px;
  cursor: pointer;
  padding: 0px 30px;
  border-radius: 5px;
  line-height: 1.8;
  transition: all 0.2s ease-in-out;
}
.main-btn:hover {
  color: #ffffff;
}
.main-btn::before {
  content: "";
  display: inline-block;
  width: 25px;
  height: 25px;
  margin-right: 8px;
  vertical-align: middle;
  background-color: currentColor;
  -webkit-mask-size: contain;
  mask-size: contain;
}

.btn-t {
  color: var(--blue);
}
.btn-t:hover {
  background: var(--blue);
}
.btn-t::before {
  -webkit-mask: url(/assets/svg/main-btn/t.svg) no-repeat center;
  mask: url(/assets/svg/main-btn/t.svg) no-repeat center;
}
.btn-f {
  color: var(--red);
}
.btn-f:hover {
  background: var(--red);
}
.btn-f::before {
  -webkit-mask: url(/assets/svg/main-btn/f.svg) no-repeat center;
  mask: url(/assets/svg/main-btn/f.svg) no-repeat center;
} */
</style>
