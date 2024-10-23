<template>
  <div class="min-h-screen flex flex-col items-start justify-start bg-background text-white p-4">
    <h1 class="text-2xl font-bold text-primary mb-6">Historial de movimientos</h1>

    <div v-if="loading" class="flex items-center justify-center min-w-full min-h-[500px]">
      <Spinner :visible="loading" />
    </div>

    <div v-if="!loading" class="w-full max-h-[500px] overflow-y-auto custom-scrollbar">
      <table v-if="transactions.length > 0" class="w-full text-left table-auto">
        <thead class="bg-background text-white">
          <tr>
            <th class="px-4 py-2 w-[10%]">Fecha</th>
            <th class="px-4 py-2">Descripción</th>
            <th class="px-4 py-2 w-[15%]">Monto</th>
            <th class="px-4 py-2 w-[8%]"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in transactions" :key="transaction._id" class="border-b border-gray-700">
            <td class="px-4 py-2">{{ formatDate('DD/MM/YYYY', transaction.datetime) }}</td>
            <td class="px-4 py-2">
              {{ transaction.action === 'purchase' ? 'Compra de ' : 'Venta de ' }}{{ getCoinName(transaction.crypto_code) }}
            </td>
            <td class="px-4 py-2">
              <span :class="transaction.action === 'purchase' ? 'text-red-500' : 'text-green-500'">
                {{ transaction.action === 'purchase' ? '-' : '+' }}${{ transaction.money }} ARS
              </span>
              <br />
              <span class="text-gray-400">{{ transaction.crypto_amount }} {{ transaction.crypto_code.toUpperCase() }}</span>
            </td>
            <td class="px-4 py-2">
              <span @click="editTransaction(transaction._id)" class="material-symbols-outlined text-[#E2C734] cursor-pointer">edit_note</span>
              <span @click="openConfirmModal(transaction._id)" class="material-symbols-outlined text-[#D76565] cursor-pointer">delete</span>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else class="text-gray-400 text-center">No se encontraron registros de transacciones.</p>
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
      :type="'alert'"
      :title="'Eliminar Transacción'"
      :message="'¿Estás seguro de que deseas eliminar este registro?'"
      :botonConfirm="'Eliminar'"
      :botonCancel="'Cancelar'"
      @confirm="confirmDelete"
      @cancel="closeConfirmModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTransactions, deleteTransaction } from '@/api/transaccionService'
import { useStore } from 'vuex'
import { formatDate } from '@/helpers/parsers'
import coins from '@/data/coins.js'
import AlertModal from '@/components/Alert.vue'
import ConfirmModal from '@/components/Modal.vue'
import Spinner from '@/components/Spinner.vue'

const router = useRouter()
const store = useStore()
const transactions = ref([])
const showAlert = ref(false)
const alertType = ref('error')
const alertTitle = ref('')
const alertMessage = ref('')
const loading = ref(true)
const selectedTransactionId = ref(null)
const showModal = ref(false)

const getCoinName = (crypto_code) => {
  const coin = coins.find(c => c.sigla.toLowerCase() === crypto_code.toLowerCase())
  return coin ? coin.nombre : crypto_code
}

const fetchTransactions = async () => {
  try {
    const userId = store.state.user.username
    const response = await getTransactions(userId)
    transactions.value = response.sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
  } catch (error) {
    showAlert.value = true
    alertType.value = 'error'
    alertTitle.value = 'Error'
    alertMessage.value = 'Ocurrió un problema al obtener los registros.'
    
    setTimeout(() => {
      showAlert.value = false
    }, 3000)
  } finally {
    loading.value = false
  }
}

const editTransaction = (idTransaction) => {
  router.push(`/edit/${idTransaction}`)
}

const openConfirmModal = (idTransaction) => {
  selectedTransactionId.value = idTransaction
  showModal.value = true
}

const closeConfirmModal = () => {
  showModal.value = false
}

const confirmDelete = async () => {
  try {
    await deleteTransaction(selectedTransactionId.value)
    transactions.value = transactions.value.filter(t => t._id !== selectedTransactionId.value)
    showAlert.value = true
    alertType.value = 'sucess'
    alertTitle.value = 'Exito'
    alertMessage.value = 'Se elimino correctamente el registro.'
    setTimeout(() => {
      showAlert.value = false
    }, 3000)
  } catch (error) {
    showAlert.value = true
    alertType.value = 'error'
    alertTitle.value = 'Error'
    alertMessage.value = 'No se pudo eliminar el registro.'
    setTimeout(() => {
      showAlert.value = false
    }, 3000)
  }
}

onMounted(() => {
  fetchTransactions()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #4A5568;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #2D3748;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background-color: #1A202C;
  border-radius: 10px;
}
thead th {
  position: sticky;
  top: 0;
  background-color: rgb(120, 113, 170);
  z-index: 10;
}
</style>
