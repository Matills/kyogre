<template>
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div :class="`border-t-4 ${borderColor} rounded-lg p-6`">
                <div class="flex items-center mb-4">
                    <span class="material-symbols-outlined mr-3" :class="iconColor">{{ icon }}</span>
                    <h2 :class="`${titleColor} text-xl font-semibold`">{{ title }}</h2>
                </div>
                <p class="text-black mb-6">{{ message }}</p>
                <div class="flex justify-end items-center">
                    <button @click="cancel" class="px-4 py-2 mr-4 border border-gray-400 text-black rounded">{{ botonCancel }}</button>
                    <button @click="confirm" :class="`${btnColor} px-4 py-2 rounded text-white`">{{ botonConfirm }}</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { computed } from 'vue'

export default {
  props: {
    title: String,
    message: String,
    botonConfirm: String,
    botonCancel: String,
    type: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const styles = {
      success: {
        icon: 'check_circle',
        color: 'text-[#73B474]',
        border: 'border-[#73B474]',
        bg: 'bg-[#73B474]'
      },
      error: {
        icon: 'cancel',
        color: 'text-[#D76565]',
        border: 'border-[#D76565]',
        bg: 'bg-[#D76565]'
      },
      alert: {
        icon: 'warning',
        color: 'text-[#D1B204]',
        border: 'border-[#D1B204]',
        bg: 'bg-[#D1B204]'
      },
      info: {
        icon: 'info',
        color: 'text-[#0DA99E]',
        border: 'border-[#0DA99E]',
        bg: 'bg-[#0DA99E]'
      },
      loading: {
        icon: 'progress_activity',
        color: 'text-[#48C9C0]',
        border: 'border-[#48C9C0]',
        bg: 'bg-[#48C9C0]'
      }
    }

    const style = computed(() => styles[props.type] || {
      icon: '',
      color: 'text-black',
      border: 'border-gray-500',
      bg: 'bg-gray-500'
    })

    return {
      icon: computed(() => style.value.icon),
      iconColor: computed(() => style.value.color),
      titleColor: computed(() => style.value.color),
      borderColor: computed(() => style.value.border),
      btnColor: computed(() => style.value.bg)
    }
  },
  methods: {
    confirm() {
      this.$emit('confirm')
    },
    cancel() {
      this.$emit('cancel')
    }
  }
}
</script>