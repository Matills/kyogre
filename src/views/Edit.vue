<template>
  <div class="min-h-screen flex flex-col items-start justify-start bg-background text-white p-4">
    <h1 class="text-2xl font-bold text-primary mb-6">Editar Transacción</h1>
    
    <div v-if="loading" class="flex items-center justify-center min-w-full min-h-[500px]">
      <Spinner :visible="loading" />
    </div>

    <div v-else>
      <div class="mb-4">
        <div class="mb-4">
          <label for="crypto_amount" class="block text-sm font-medium">Monto en Criptomonedas</label>
          <div class="flex">
            <input
              id="crypto_amount"
              v-model.number="transaction.crypto_amount"
              @input="validatePositive"
              type="number"
              min="0"
              class="p-2 w-full bg-white text-black rounded-l-lg"
              required
            />
            <select v-model="transaction.crypto_code" class="p-2 bg-white text-black rounded-r-lg">
              <option v-for="coin in allCoins" :key="coin.sigla" :value="coin.sigla">{{ coin.sigla }}</option>
            </select>
          </div>
        </div>

        <div class="mb-4">
          <label for="money" class="block text-sm font-medium">Monto en Pesos Argentinos</label>
          <input
            id="money"
            v-model.number="transaction.money"
            @input="validatePositive"
            type="number"
            min="0"
            class="p-2 w-full bg-white text-black rounded-lg"
            required
          />
        </div>

        <div class="flex">
          <button @click="updateTransactionData" class="bg-primary text-white py-2 px-4 rounded-lg hover:bg-secondary transition-colors mr-2">Actualizar</button>
          <button @click="openConfirmModal" class="bg-[#D76565] text-white py-2 px-4 rounded-lg">Eliminar Registro</button>
        </div>
      </div>
    </div>

    <AlertModal
      v-if="showAlert"
      :type="alertType"
      :title="alertTitle"
      :message="alertMessage"
      :visible="showAlert"
      @close="showAlert = false"
      position="right-top"
    />

    <ConfirmModal
      v-if="showModal"
      :title="'Eliminar Transacción'"
      :message="'¿Estás seguro de que deseas eliminar esta transacción?'"
      :botonConfirm="'Eliminar'"
      :botonCancel="'Cancelar'"
      @confirm="confirmDelete"
      @cancel="closeConfirmModal"
    />
  </div>
</template>
  
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTransaction, updateTransaction, deleteTransaction } from '@/api/transaccionService'
import AlertModal from '@/components/Alert.vue'
import ConfirmModal from '@/components/Modal.vue'
import Spinner from '@/components/Spinner.vue'
import coins from '@/data/coins.js'

const route = useRoute()
const router = useRouter()
const transaction = ref({
  _id: '',
  crypto_code: '',
  crypto_amount: '',
  money: '',
})
const loading = ref(true)
const showAlert = ref(false)
const alertType = ref('error')
const alertTitle = ref('')
const alertMessage = ref('')
const allCoins = coins
const showModal = ref(false)

const fetchTransaction = async () => {
  try {
    const idTransaction = route.params.idTransaction
    const fetchedTransaction = await getTransaction(idTransaction)
    transaction.value = fetchedTransaction
    transaction.value.crypto_code = fetchedTransaction.crypto_code.toUpperCase()
  } catch (error) {
    showAlert.value = true
    alertType.value = 'error'
    alertTitle.value = 'Error'
    alertMessage.value = 'No se pudo obtener la transacción.'
    setTimeout(() => {
        showAlert.value = false
    }, 3000)
  } finally {
    loading.value = false
  }
}

const validatePositive = () => {
  if (transaction.value.crypto_amount < 0) {
    transaction.value.crypto_amount = 0
  }
  if (transaction.value.money < 0) {
    transaction.value.money = 0
  }
}

const updateTransactionData = async () => {
  try {
    await updateTransaction(transaction.value._id, transaction.value)
    alertType.value = 'success'
    alertTitle.value = 'Éxito'
    alertMessage.value = 'Transacción actualizada correctamente.'
    showAlert.value = true
    setTimeout(() => {
        showAlert.value = false
    }, 3000)
  } catch (error) {
    showAlert.value = true
    alertType.value = 'error'
    alertTitle.value = 'Error'
    alertMessage.value = 'No se pudo actualizar la transacción.'
    setTimeout(() => {
        showAlert.value = false
    }, 3000)
  }
}

const openConfirmModal = () => {
  showModal.value = true
}

const closeConfirmModal = () => {
  showModal.value = false
}

const confirmDelete = async () => {
  try {
    await deleteTransaction(transaction.value._id)
    alertType.value = 'success'
    alertTitle.value = 'Éxito'
    alertMessage.value = 'Transacción eliminada correctamente.'
    showAlert.value = true
    showModal.value = false
    setTimeout(() => {
      router.push('/')
    }, 2000)
  } catch (error) {
    showAlert.value = true
    alertType.value = 'error'
    alertTitle.value = 'Error'
    alertMessage.value = 'No se pudo eliminar la transacción.'
    setTimeout(() => {
      showAlert.value = false
    }, 3000)
  }
}

onMounted(() => {
  fetchTransaction()
})
</script>
  
  