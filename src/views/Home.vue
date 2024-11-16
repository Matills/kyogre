<template>
  <div class="min-h-screen flex flex-col items-start justify-start bg-background text-white p-4">
    <div class="w-full bg-primary p-4 mb-6 rounded-lg flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-secondary">Balance total</h1>
        <p class="text-3xl font-semibold">{{ formatPrice(totalBalance) }}</p>
      </div>
      <div class="flex flex-col justify-end">
        <button @click="openDepositModal" class="w-full bg-secondary text-white mb-4 py-2 px-4 rounded-lg hover:bg-accent transition-colors">
          Depositar
        </button>
        <button @click="goToTrading" class="w-full bg-secondary text-white py-2 px-4 rounded-lg hover:bg-accent transition-colors">
          Cambiar
        </button>
      </div>
    </div>

    <div class="w-full">
      <h1 class="text-xl font-bold text-primary mb-4">Tu billetera</h1>

      <div v-if="loading" class="flex justify-center min-w-full min-h-[500px]">
        <Spinner :visible="loading" />
      </div>

      <div v-if="!loading" class="w-full max-h-[350px] overflow-y-auto custom-scrollbar">
        <table class="w-full text-left table-auto">
          <thead class="bg-primary text-white">
            <tr>
              <th class="px-4 py-2 w-[15%]">Moneda</th>
              <th class="px-4 py-2 w-[15%]">Precio (ARS)</th>
              <th class="px-4 py-2 w-[20%]">Balance</th>
              <th class="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="coin in sortedWallet" :key="coin.crypto_code" class="border-b border-gray-700">
              <td class="px-4 py-2">{{ getCoinName(coin.crypto_code) }}</td>
              <td class="px-4 py-2">{{ coin.crypto_code !== 'ars' ? formatPrice(coin.price) : '' }}</td>
              <td class="px-4 py-2">
                <div v-if="coin.crypto_code !== 'ars'">{{ coin.crypto_amount }} {{ coin.crypto_code.toUpperCase() }}</div>
                <div>{{ formatPrice(coin.balanceARS) }} ARS</div>
              </td>
              <td class="px-4 py-2 flex text-center items-center justify-end h-full">
                <span class="text-white cursor-pointer hover:text-accent hover:translate-y-[-2px] transition-all mr-4" @click="coin.crypto_code == 'ars' ? openDepositModal() : openDepositCriptoModal()">
                  Depositar
                </span>
                <span class="text-white cursor-pointer hover:text-accent hover:translate-y-[-2px] transition-all" @click="goToTrading">
                  Comprar / Vender
                </span>
              </td>
            </tr>
          </tbody>
        </table>
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
            class="px-4 py-2 mr-4 border border-gray-400 text-black rounded"
            @click="closeDepositModal"
          >
            Cancelar
          </button>
          <button 
            class="bg-secondary text-white py-2 px-4 rounded hover:bg-accent"
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
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { formatPrice, formatDate } from '@/helpers/parsers'
import { useRouter } from 'vue-router'
import { getCripto } from '@/api/criptoService'
import { getTransactions, createTransaction } from '@/api/transaccionService'
import coins from '@/data/coins.js'
import AlertModal from '@/components/Alert.vue'
import Spinner from '@/components/Spinner.vue'

const store = useStore()
const router = useRouter()
const totalBalance = ref(0)
const showAlert = ref(false)
const alertType = ref('error')
const alertTitle = ref('')
const alertMessage = ref('')
const showDepositModal = ref(false)
const depositAmount = ref('')
const loading = ref(true)
const wallet = computed(() => store.getters.getWallet)

const sortedWallet = computed(() => {
  const ars = wallet.value.find(coin => coin.crypto_code === 'ars') || { crypto_code: 'ars', crypto_amount: 0, price: 0, balanceARS: 0 }
  const others = wallet.value.filter(coin => coin.crypto_code !== 'ars')
  return [ars, ...others]
})

const fetchWalletData = async () => {
  loading.value = true
  try {
    const userId = store.state.user.username
    const transactions = await getTransactions(userId)

    if (!transactions || transactions.length === 0) {
      const initialWallet = [
        {
          crypto_code: 'ars',
          crypto_amount: 0,
          money: 0,
          price: 1,
          balanceARS: 0,
        }
      ]
      store.commit('setWallet', initialWallet)
      totalBalance.value = 0
      loading.value = false
      return
    }

    const walletMap = {}
    let arsAmount = 0

    transactions.forEach(transaction => {
      const { crypto_code, crypto_amount, money, action } = transaction
      const amount = parseFloat(crypto_amount)
      const transactionMoney = parseFloat(money)

      if (crypto_code === 'ars') {
        arsAmount += transactionMoney
        if (!walletMap['ars']) {
          walletMap['ars'] = {
            crypto_code: 'ars',
            crypto_amount: 0,
            money: arsAmount,
            price: 1,
            balanceARS: arsAmount
          }
        }
      } else {
        if (!walletMap[crypto_code]) {
          walletMap[crypto_code] = {
            crypto_code,
            crypto_amount: 0,
            money: 0,
            price: 0,
            balanceARS: 0,
          }
        }
        
        if (action === 'purchase') {
          walletMap[crypto_code].crypto_amount += amount
          arsAmount -= transactionMoney
        } else if (action === 'sale') {
          walletMap[crypto_code].crypto_amount -= amount
          arsAmount += transactionMoney
        }
      }
    })

    walletMap['ars'].balanceARS = arsAmount
    walletMap['ars'].money = arsAmount
    walletMap['ars'].crypto_amount = arsAmount

    const uniqueCryptoCodes = Object.keys(walletMap).filter(code => code !== 'ars')
    const pricePromises = uniqueCryptoCodes.map(code => getCripto(code))
    const priceDataArray = await Promise.all(pricePromises)

    priceDataArray.forEach((priceData, index) => {
      const cryptoCode = uniqueCryptoCodes[index]
      const price = parseFloat(priceData.bid)
      walletMap[cryptoCode].price = price
      walletMap[cryptoCode].balanceARS = walletMap[cryptoCode].crypto_amount * price
    })

    const walletFiltered = Object.values(walletMap).filter(coin => coin.crypto_amount !== 0 || coin.crypto_code === 'ars')
    store.commit('setWallet', walletFiltered)
    totalBalance.value = Object.values(walletMap).reduce((total, coin) => total + (coin.balanceARS || 0), 0)
  } catch (error) {
    console.error(error)
    showAlert.value = true
    alertMessage.value = 'Error al cargar los datos de la billetera.'
    alertTitle.value = 'Error'
    alertType.value = 'error'
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

const openDepositCriptoModal = () => {
  showAlert.value = true
  alertMessage.value = 'Funcionalidad en desarrollo.'
  alertTitle.value = 'Info'
  alertType.value = 'info'
  setTimeout(() => {
    showAlert.value = false
  }, 3000)
}


const closeDepositModal = () => {
  showDepositModal.value = false
}

const confirmDeposit = async () => {
  const amount = parseFloat(depositAmount.value)
  if (amount <= 0) {
    showAlert.value = true
    alertType.value = 'error'
    alertTitle.value = 'Error'
    alertMessage.value = 'Ingrese un monto válido.'
    setTimeout(() => {
      showAlert.value = false
    }, 3000)
    return
  }
  const transaction = {
    user_id: store.state.user.username,
    action: 'purchase',
    crypto_code: 'ars',
    crypto_amount: amount.toString(),
    money: amount.toString(),
    datetime: formatDate('YYYY-MM-DD HH:MM', new Date())
  }

  try {
    closeDepositModal()
    await createTransaction(transaction)
    await fetchWalletData()
    showAlert.value = true
    alertType.value = 'success'
    alertTitle.value = 'Éxito'
    alertMessage.value = 'El depósito se realizó con éxito.'
    setTimeout(() => {
      showAlert.value = false
    }, 3000)
  } catch (error) {
    showAlert.value = true
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

const getCoinName = (code) => {
  const coin = coins.find(coin => coin.sigla.toLowerCase() === code)
  return coin ? coin.nombre : 'Pesos Argentinos'
}

onMounted(() => {
  fetchWalletData()
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