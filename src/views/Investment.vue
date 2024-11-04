<template>
  <div class="min-h-screen flex flex-col items-start justify-start bg-background text-white p-4">
    <h1 class="text-2xl font-bold text-primary mb-6">Análisis de Inversiones</h1>
    
    <div v-if="loading" class="flex items-start justify-center min-w-full min-h-[500px]">
      <Spinner :visible="loading" />
    </div>

    <div v-if="!loading" class="w-full bg-gray-800 p-4 rounded-lg shadow-lg">
      <table class="w-full text-left">
        <thead>
          <tr>
            <th class="px-4 py-2 w-[15%]">Criptomoneda</th>
            <th class="px-4 py-2 w-[15%]">Cantidad</th>
            <th class="px-4 py-2">Resultado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(result, crypto) in analysisResults" :key="crypto" class="border-b border-gray-700">
            <td class="px-4 py-2">{{ crypto.toUpperCase() }}</td>
            <td class="px-4 py-2">{{ quantities[crypto] }}</td>
            <td class="px-4 py-2" :class="result >= 0 ? 'text-green-500' : 'text-red-500'">
              {{ result >= 0 ? '+' : '-' }}${{ Math.abs(result).toFixed(2) }} ARS
            </td>
          </tr>
        </tbody>
      </table>
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
import Spinner from '@/components/Spinner.vue'
import AlertModal from '@/components/Alert.vue'
import { getCripto } from '@/api/criptoService'

const store = useStore()
const loading = ref(true)
const transactions = ref([])
const analysisResults = ref({})
const quantities = ref({})
const showAlert = ref(false)
const alertType = ref('error')
const alertTitle = ref('')
const alertMessage = ref('')

const fetchTransactions = async () => {
  try {
    const userId = store.state.user.username
    const response = await getTransactions(userId)
    transactions.value = response
  } catch (error) {
    showAlert.value = true
    alertType.value = 'error'
    alertTitle.value = 'Error'
    alertMessage.value = 'Error al obtener transacciones'
    setTimeout(() => {
      showAlert.value = false
    }, 3000)
  } finally {
    loading.value = false
  }
}

const calculateInvestmentResults = async () => {
  const cryptoGroups = transactions.value.reduce((acc, tx) => {
    // Excluir ARS en el análisis
    if (tx.crypto_code.toLowerCase() === 'ars') return acc
    if (!acc[tx.crypto_code]) acc[tx.crypto_code] = []
    acc[tx.crypto_code].push(tx)
    return acc
  }, {})

  for (const [cryptoCode, txs] of Object.entries(cryptoGroups)) {
    let investmentResult = 0
    let totalAmount = 0

    try {
      const priceData = await getCripto(cryptoCode)
      const currentPrice = priceData.totalBid

      txs.forEach((tx) => {
        const value = parseFloat(tx.money)
        const amount = parseFloat(tx.crypto_amount)
        totalAmount += amount
        investmentResult += tx.action === 'purchase' ? -value : value
      })

      const currentValue = currentPrice * totalAmount
      investmentResult += currentValue
      analysisResults.value[cryptoCode] = investmentResult
      quantities.value[cryptoCode] = totalAmount.toFixed(2)
    } catch (error) {
      showAlert.value = true
      alertType.value = 'error'
      alertTitle.value = 'Error'
      alertMessage.value = `Error al obtener el precio de ${cryptoCode}`
      setTimeout(() => {
        showAlert.value = false
      }, 3000)
      analysisResults.value[cryptoCode] = "Error de precio"
      quantities.value[cryptoCode] = "N/A"
    }
  }
}

onMounted(async () => {
  await fetchTransactions()
  await calculateInvestmentResults()
})
</script>
