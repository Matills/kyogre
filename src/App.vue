<template>
  <div class="flex min-h-screen bg-gray-100">
    <Navbar v-if="isAuthenticated" />
    <div class="flex-1">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue';
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const isAuthenticated = computed(() => !!store.state.user);
</script>

<style>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
</style>