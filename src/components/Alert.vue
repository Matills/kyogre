<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="alert fixed p-4 rounded-lg shadow-lg max-w-sm"
      :class="modalClass"
      :style="modalStyle"
      role="alert"
      aria-live="assertive"
    >
      <div class="flex justify-between items-start">
        <div class="flex items-center">
          <span class="material-symbols-outlined text-white">{{ icon }}</span>
          <h3 class="font-bold ml-2">{{ title }}</h3>
        </div>
        <button @click="closeModal" class="text-white font-bold text-lg">
          x
        </button>
      </div>
      <p>{{ message }}</p>
      <div v-if="confirmable" class="mt-4 flex justify-end">
        <button @click="confirm" class="bg-white text-black font-bold px-4 py-2 rounded-lg mr-2">Confirm</button>
        <button @click="closeModal" class="text-white font-bold px-4 py-2 rounded-lg">Cancel</button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['success', 'alert', 'error', 'info', 'loading'].includes(value),
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  visible: {
    type: Boolean,
    default: false,
  },
  position: {
    type: String,
    default: 'right-top',
  },
  confirmable: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'confirm']);

const closeModal = () => {
  emit('close');
};

const confirm = () => {
  emit('confirm');
  closeModal();
};

const icons = {
  success: 'check_circle',
  error: 'cancel',
  alert: 'warning',
  info: 'info',
  loading: 'progress_activity',
};

const icon = computed(() => icons[props.type] || '');

const styles = {
  success: 'bg-[#73B474] text-white',
  error: 'bg-[#D76565] text-white',
  alert: 'bg-[#E2C734] text-white',
  info: 'bg-[#0DA99E] text-white',
  loading: 'bg-[#48C9C0] text-white',
};

const modalClass = computed(() => styles[props.type] || '');

const modalStyle = computed(() => {
  const positions = {
    'right-top': { top: '1rem', right: '1rem' },
    'right-bottom': { bottom: '1rem', right: '1rem' },
    'left-top': { top: '1rem', left: '1rem' },
    'left-bottom': { bottom: '1rem', left: '1rem' },
  };
  return positions[props.position] || positions['right-top'];
});
</script>

<style scoped>
.alert {
  z-index: 999;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
