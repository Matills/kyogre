<template>
    <div class="min-h-screen flex flex-col items-start justify-start bg-background text-white p-4">
      <div class="w-full bg-primary p-4 mb-6 rounded-lg flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-secondary">Balance total</h1>
          <p class="text-3xl font-semibold">{{ formatPrice(totalBalance) }}</p>
        </div>
  
        <div class="flex space-x-4 justify-end">
          <button @click="openDepositModal" class="bg-accent text-white py-2 px-4 rounded-lg hover:bg-secondary transition-colors">
            Depositar
          </button>
          <button @click="goToTrading" class="bg-accent text-white py-2 px-4 rounded-lg hover:bg-secondary transition-colors">
            Cambiar
          </button>
        </div>
      </div>
  
      <h2 class="text-xl font-bold text-primary mb-4">Tu billetera</h2>
  
      <div v-if="loading" class="flex items-center justify-center min-w-full min-h-[500px]">
        <Spinner :visible="loading" />
      </div>
  
      <div v-if="!loading" class="w-full max-h-[500px] overflow-y-auto custom-scrollbar">
        <table v-if="wallet.length > 0" class="w-full text-left table-auto">
          <thead class="bg-primary text-white">
            <tr>
              <th class="px-4 py-2">Moneda</th>
              <th class="px-4 py-2">Precio (ARS)</th>
              <th class="px-4 py-2">Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="coin in wallet" :key="coin.crypto_code" class="border-b border-gray-700">
              <td class="px-4 py-2">{{ getCoinName(coin.crypto_code) }}</td>
              <td class="px-4 py-2">{{ formatPrice(coin.price) }}</td>
              <td class="px-4 py-2">
                <div>{{ coin.crypto_amount }} {{ coin.crypto_code.toUpperCase() }}</div>
                <div>{{ formatPrice(coin.balanceARS) }} ARS</div>
              </td>
            </tr>
          </tbody>
        </table>
  
        <p v-else class="text-gray-400 text-center">No tienes criptomonedas en tu billetera.</p>
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
  
      <div v-if="showDepositModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white text-black rounded-lg shadow-lg p-6 w-96">
          <h2 class="text-xl font-semibold mb-4">Depositar Dinero</h2>
          <input 
            type="number" 
            v-model="depositAmount" 
            class="w-full p-2 mb-4 border border-gray-300 rounded" 
            placeholder="Ingresa la cantidad en pesos"
          />
          <div class="flex justify-end space-x-2">
            <button 
              class="bg-red-600 text-white py-2 px-4 rounded"
              @click="closeDepositModal"
            >
              Cancelar
            </button>
            <button 
              class="bg-primary text-white py-2 px-4 rounded hover:bg-accent"
              @click="confirmDeposit"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useStore } from 'vuex'
  import { getCripto } from '@/api/criptoService'
  import { getTransactions } from '@/api/transaccionService'
  import { formatPrice } from '@/helpers/parsers'
  import coins from '@/data/coins.js'
  import AlertModal from '@/components/Alert.vue'
  import { useRouter } from 'vue-router'
  
  const store = useStore()
  const router = useRouter()
  const wallet = ref([])
  const totalBalance = ref(0)
  const showAlert = ref(false)
  const alertType = ref('error')
  const alertTitle = ref('')
  const alertMessage = ref('')
  const showDepositModal = ref(false)
  const depositAmount = ref('')
  const loading = ref(true)
  
  const getCoinName = (crypto_code) => {
    const coin = coins.find(c => c.sigla.toLowerCase() === crypto_code.toLowerCase())
    return coin ? coin.nombre : crypto_code
  }
  
  const fetchWalletData = async () => {
    try {
      const userId = store.state.user.username
      const transactions = await getTransactions(userId)
  
      const walletData = {}
  
      for (const transaction of transactions) {
        const { crypto_code, crypto_amount, action } = transaction
  
        if (!walletData[crypto_code]) {
          walletData[crypto_code] = { crypto_amount: 0, price: 0, balanceARS: 0 }
        }
  
        walletData[crypto_code].crypto_amount += action === 'purchase' ? crypto_amount : -crypto_amount
      }
  
      totalBalance.value = 0
      for (const crypto_code in walletData) {
        if (walletData[crypto_code].crypto_amount > 0) {
          const criptoData = await getCripto(crypto_code)
          const balanceARS = walletData[crypto_code].crypto_amount * criptoData.totalBid
  
          wallet.value.push({
            crypto_code,
            crypto_amount: walletData[crypto_code].crypto_amount,
            price: criptoData.totalBid,
            balanceARS: balanceARS,
          })
  
          totalBalance.value += balanceARS
        }
      }
    } catch (error) {
      showAlert.value = true
      alertType.value = 'error'
      alertTitle.value = 'Error'
      alertMessage.value = 'No se pudieron cargar los datos de la billetera.'
      setTimeout(() => {
        showAlert.value = false
      }, 3000)
    } finally {
      loading.value = false
    }
  }
  
  const openDepositModal = () => {
    showDepositModal.value = true
  }
  
  const closeDepositModal = () => {
    showDepositModal.value = false
    depositAmount.value = ''
  }
  
  const confirmDeposit = () => {
    if (depositAmount.value) {
      alertType.value = 'success'
      alertTitle.value = 'Éxito'
      alertMessage.value = 'Depósito cargado exitosamente.'
      setTimeout(() => {
        showAlert.value = false
      }, 3000)
      closeDepositModal()
    } else {
      alertType.value = 'error'
      alertTitle.value = 'Error'
      alertMessage.value = 'Ocurrió un problema al realizar el depósito.'
      setTimeout(() => {
        showAlert.value = false
      }, 3000)
    }
  }
  
  const goToTrading = () => {
    router.push('/trading')
  }
  
  onMounted(() => {
    fetchWalletData()
  })
  </script>
  