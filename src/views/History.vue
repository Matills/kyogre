<template>
  <div class="min-h-screen flex flex-col items-start justify-start bg-secondary text-white p-4">
    <h1 class="text-2xl font-bold text-primary mb-6">Historial de movimientos</h1>

    <div v-if="loading" class="flex items-center justify-center min-w-full min-h-[500px]">
      <Spinner :visible="loading" />
    </div>

    <div v-if="!loading" class="w-full max-h-[500px] overflow-y-auto custom-scrollbar">
      <table v-if="transactions.length > 0" class="w-full text-left table-auto">
        <thead class="bg-secondary text-white">
          <tr>
            <th class="px-4 py-2">Fecha</th>
            <th class="px-4 py-2">Descripción</th>
            <th class="px-4 py-2">Monto</th>
            <th class="px-4 py-2"></th>
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
            <td class="px-4 py-2 flex space-x-2">
              <span class="material-icons text-orange-600 cursor-pointer">edit_note</span>
              <span class="material-icons text-red-600 cursor-pointer">delete_sweep</span>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getTransactions } from '@/api/transaccionService'
import { useStore } from 'vuex'
import { formatDate } from '@/helpers/parsers'
import coins from '@/data/coins.js'
import AlertModal from '@/components/AlertModal.vue'
import Spinner from '@/components/Spinner.vue'

const store = useStore()
const transactions = ref([])
const showAlert = ref(false)
const alertType = ref('error')
const alertTitle = ref('')
const alertMessage = ref('')
const loading = ref(true)

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
    alertMessage.value = 'Ocurrio un problema al obtener los registros.'
  } finally {
    loading.value = false
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
</style>
