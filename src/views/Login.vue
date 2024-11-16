<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="bg-white p-4 rounded-lg shadow-lg w-96">
      <div class="flex items-center mb-4">
        <img src="@/assets/logo.svg" alt="Kyogre Logo" class="w-16 mr-2" />
        <h1 class="text-primary text-2xl font-bold">Kyogre</h1>
      </div>

      <h2 class="text-primary text-2xl font-bold text-center mb-6">{{ isLogin ? 'Inciar sesión' : 'Registrarse' }}</h2>

      <form @submit.prevent="isLogin ? handleLogin() : handleRegister()">
        <div class="mb-4">
          <label for="username" class="block text-background mb-2">Nombre de usuario</label>
          <input 
            v-model="username" 
            type="text" 
            id="username" 
            class="w-full p-2 border border-gray-300 rounded-lg"
            :class="{ 'border-red-500': errors.username }"
            required
          />
          <p v-if="errors.username" class="text-red-500 text-sm">{{ errors.username }}</p>
        </div>

        <div v-if="!isLogin" class="mb-4">
          <label for="email" class="block text-background mb-2">Email</label>
          <input 
            v-model="email" 
            type="email" 
            id="email" 
            class="w-full p-2 border border-gray-300 rounded-lg"
            :class="{ 'border-red-500': errors.email }"
            required
          />
          <p v-if="errors.email" class="text-red-500 text-sm">{{ errors.email }}</p>
        </div>

        <div class="mb-4">
          <label for="password" class="block text-background mb-2">Contraseña</label>
          <input 
            v-model="password" 
            type="password" 
            id="password" 
            class="w-full p-2 border border-gray-300 rounded-lg"
            :class="{ 'border-red-500': errors.password }"
            required
          />
          <p v-if="errors.password" class="text-red-500 text-sm">{{ errors.password }}</p>
        </div>

        <div v-if="!isLogin" class="mb-4">
          <label for="confirmPassword" class="block text-background mb-2">Confirmar Contraseña</label>
          <input 
            v-model="confirmPassword" 
            type="password" 
            id="confirmPassword" 
            class="w-full p-2 border border-gray-300 rounded-lg"
            :class="{ 'border-red-500': errors.confirmPassword }"
            required
          />
          <p v-if="errors.confirmPassword" class="text-red-500 text-sm">{{ errors.confirmPassword }}</p>
        </div>

        <button 
          type="submit" 
          class="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-accent transition-colors"
        >
          {{ isLogin ? 'Iniciar sesión' : 'Registrarse' }}
        </button>
      </form>

      <p class="text-center text-background mt-4">
        <button @click="toggleLogin" class="text-accent underline">
          {{ isLogin ? 'Crear cuenta' : 'Ya tienes una cuenta? Iniciar sesión' }}
        </button>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const isLogin = ref(true)
const username = ref('')
const password = ref('')
const email = ref('')
const confirmPassword = ref('')
const errors = ref({})

const store = useStore()
const router = useRouter()

const handleLogin = () => {
  errors.value = {}

  const registeredUser = store.state.user
  
  if (username.value === 'rubiolomatias01' && password.value === '123456') {
    store.dispatch('login', { username: username.value })
    router.push('/')
  } else if (registeredUser?.username === username.value && registeredUser?.password === password.value) {
    store.dispatch('login', { username: username.value })
    router.push('/')
  } else {
    errors.value.username = 'Usuario incorrecto.'
    errors.value.password = 'Contraseña incorrecta.'
  }
}

const handleRegister = () => {
  errors.value = {}

  if (!validateEmail(email.value)) {
    errors.value.email = 'Ingrese un correo electronico valido.'
  }
  if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'Las contraseñas no coinciden.'
  }
  if (password.value.length < 6) {
    errors.value.password = 'La contraseña debe tener mas de  6 caracteres.'
  }

  if (Object.keys(errors.value).length === 0) {
    store.commit('setUser', { username: username.value, password: password.value })
    isLogin.value = true
    clearFields()
    router.push('/')
  }
}

const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.[^<>()[\]\\.,;:\s@"]{2,}))$/i
  return re.test(String(email).toLowerCase())
}

const toggleLogin = () => {
  clearFields()
  isLogin.value = !isLogin.value
}

const clearFields = () => {
  username.value = ''
  password.value = ''
  email.value = ''
  confirmPassword.value = ''
  errors.value = {}
}
</script>

<style scoped>
.text-red-500 {
  color: #f56565;
}
.border-red-500 {
  border-color: #f56565;
}
</style>
