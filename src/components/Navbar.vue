<template>
  <nav class="h-screen w-64 bg-white flex flex-col items-start p-4">
    <div @click="goHome" class="flex items-center mb-8 cursor-pointer">
      <img src="@/assets/logo.svg" alt="Logo" class="h-12 mr-3" />
      <span class="text-2xl font-bold text-primary">Kyogre</span>
    </div>

    <div class="flex items-center mb-4">
      <span class="material-symbols-outlined  text-primary">account_circle</span>
      <span class="ml-2 text-sm font-semibold text-primary">{{ username }}</span>
    </div>

    <ul class="flex flex-col space-y-4 w-full">
      <li v-for="link in links" :key="link.name" class="w-full">
        <router-link
          v-if="link.name !== 'Cerrar sesión'"
          :to="link.route"
          class="text-sm relative transition-colors duration-300 ease-out"
          :class="{
            'text-primary': isActive(link.route),
            'text-black hover:text-primary': !isActive(link.route)
          }"
          @mouseover="hover(link.name)"
          @mouseleave="hover('')"
        >
          {{ link.name }}
        </router-link>

        <span
          v-else
          @click="logout"
          class="text-sm relative cursor-pointer transition-colors duration-300 ease-out hover:text-red-600"
          :class="{
            'text-red-600': isActive(link.route),
            'text-primary': !isActive(link.route)
          }"
          @mouseover="hover(link.name)"
          @mouseleave="hover('')"
        >
          {{ link.name }}
        </span>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';

const store = useStore();
const router = useRouter();
const route = useRoute();
const hovered = ref('');

const username = store.state.user?.username || 'Guest';

const goHome = () => {
  router.push('/home');
};

const links = [
  { name: 'Comprar / Vender', route: '/trading' },
  { name: 'Historial de movimientos', route: '/history' },
  { name: 'Análisis de inversiones', route: '/investment' },
  { name: 'Cerrar sesión', route: '/login' },
];

const isActive = (linkRoute) => route.path === linkRoute;

const hover = (name) => {
  hovered.value = name;
};

const logout = () => {
  store.dispatch('logout');
  router.push('/login');
};
</script>
