<template>
  <div class="min-h-screen flex flex-col items-start justify-start bg-background text-white p-4">
    <h1 class="text-2xl font-bold text-primary mb-6 flex items-center justify-start w-full">
      Análisis de Inversiones
      <span 
        class="material-symbols-outlined cursor-pointer ml-4"
        @click="toggleViewMode"
      >
        {{ viewMode === 'table' ? 'monitoring' : 'table_view' }}
      </span>
    </h1>

    <div v-if="loading" class="flex items-center justify-center min-w-full min-h-[500px]">
      <Spinner :visible="loading" />
    </div>

    <div v-if="!loading" class="w-full">
      <div v-if="viewMode === 'table'" class="w-full max-h-[500px] overflow-y-auto custom-scrollbar">
        <table v-if="Object.keys(analysisResults).length > 0" class="w-full text-left table-auto">
          <thead class="bg-background text-white sticky top-0 z-10">
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
        <p v-else class="text-gray-400 text-center">No se encontraron resultados de análisis.</p>
      </div>

      <div v-else>
        <Chart v-if="viewMode === 'chart'" :data="chartData" :visible="viewMode === 'chart'"/>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getTransactions } from '@/api/transaccionService'
import { useStore } from 'vuex'
import Spinner from '@/components/Spinner.vue'
import AlertModal from '@/components/Alert.vue'
import Chart from '@/components/Chart.vue'
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
const viewMode = ref('table')
const chartData = ref({})

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'table' ? 'chart' : 'table'
}

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
    if (tx.crypto_code.toLowerCase() === 'ars') return acc
    const upperCryptoCode = tx.crypto_code.toUpperCase()
    if (!acc[upperCryptoCode]) acc[upperCryptoCode] = []
    acc[upperCryptoCode].push(tx)
    return acc
  }, {})

  for (const [cryptoCode, txs] of Object.entries(cryptoGroups)) {
    const upperCryptoCode = cryptoCode.toUpperCase()
    let investmentResult = 0
    let totalAmount = 0

    try {
      const priceData = await getCripto(upperCryptoCode)
      const currentPrice = priceData.totalBid

      txs.forEach((tx) => {
        const value = parseFloat(tx.money)
        const amount = parseFloat(tx.crypto_amount)
        totalAmount += tx.action === 'sale' ? -amount : amount
        investmentResult += tx.action === 'purchase' ? -value : value
      })
      const currentValue = currentPrice * totalAmount
      investmentResult += currentValue
      analysisResults.value[upperCryptoCode] = investmentResult
      quantities.value[upperCryptoCode] = totalAmount
    } catch (error) {
      showAlert.value = true
      alertType.value = 'error'
      alertTitle.value = 'Error'
      alertMessage.value = `Error al obtener el precio de ${upperCryptoCode}`
      setTimeout(() => {
        showAlert.value = false
      }, 3000)
      analysisResults.value[upperCryptoCode] = "Error de precio"
      quantities.value[upperCryptoCode] = "N/A"
    }
  }

  chartData.value = {
    labels: Object.keys(analysisResults.value),
    datasets: [
      {
        label: 'Resultados de Inversión',
        data: Object.values(analysisResults.value),
        backgroundColor: Object.values(analysisResults.value).map(result =>
          result >= 0 ? 'rgba(75, 192, 192, 0.2)' : 'rgba(255, 99, 132, 0.2)'
        ),
        borderColor: Object.values(analysisResults.value).map(result =>
          result >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'
        ),
        borderWidth: 1,
      },
    ],
  }
}

onMounted(async () => {
  await fetchTransactions()
  await calculateInvestmentResults()
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