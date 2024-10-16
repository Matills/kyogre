<template>
  <div
    v-if="visible"
    class="fixed p-4 rounded-lg shadow-lg max-w-sm"
    :class="modalClass"
    :style="modalStyle"
  >
    <div class="flex items-center">
      <div>
        <h3 class="font-bold">{{ title }}</h3>
        <p>{{ message }}</p>
      </div>
      <button @click="closeModal" class="ml-auto text-white font-bold">x</button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'alert', 'error', 'info'].includes(value),
  },
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    default: '',
  },
  visible: {
    type: Boolean,
    default: false,
  },
  position: {
    type: String,
    default: 'right-top',
  },
})

const emit = defineEmits(['close'])

const closeModal = () => {
  emit('close')
}

const modalClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-500 text-white'
    case 'error':
      return 'bg-red-500 text-white'
    case 'alert':
      return 'bg-yellow-500 text-black'
    case 'info':
      return 'bg-blue-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
})

const modalStyle = computed(() => {
  const positions = {
    'right-top': { top: '1rem', right: '1rem' },
    'right-bottom': { bottom: '1rem', right: '1rem' },
    'left-top': { top: '1rem', left: '1rem' },
    'left-bottom': { bottom: '1rem', left: '1rem' },
  }
  return positions[props.position] || positions['right-top']
})
</script>
