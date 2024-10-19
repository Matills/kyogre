<template>
	<div class="min-h-screen flex flex-col items-start justify-start bg-secondary text-white pt-4 pl-4">
		<div class="flex items-center mb-4">
			<h1 class="text-2xl font-bold mr-2">Seleccione:</h1>
			<button 
					@click="action = 'purchase'; updateConversion()" 
					:class="['text-2xl font-bold mr-4', action === 'purchase' ? 'text-accent' : 'text-primary']">
					Comprar
			</button>
			<span class="material-icons mr-4">cached</span>
			<button 
					@click="action = 'sale'; updateConversion()" 
					:class="['text-2xl font-bold', action === 'sale' ? 'text-accent' : 'text-primary']">
					Vender
			</button>
		</div>

		<div class="mb-4 w-full max-w-md">
			<label for="monto" class="block text-white mb-2">
				De {{ action === 'purchase' ? 'Pesos Argentinos' : getCoinName(selectedCrypto)  }}
			</label>
			<div class="flex">
					<input
						v-if="action === 'purchase'"
						id="monto"
						v-model.number="amount"
						@input="validateAmount"
						type="number"
						min="0"
						class="p-2 w-full bg-white text-black rounded-lg"
					/>
			</div>
			<div v-if="action === 'sale'">
				<div class="flex">
					<input
						id="monto"
						v-model.number="amount"
						@input="validateAmount"
						type="number"
						min="0"
						class="p-2 w-full bg-white text-black rounded-l-lg"
					/>
					<select v-model="selectedCrypto" @change="updateConversion" class="p-2 bg-white text-black rounded-r-lg">
						<option v-for="coin in allCoins" :key="coin.sigla" :value="coin.sigla">{{ coin.sigla }}</option>
					</select>
				</div>
			</div>
		</div>

		<div class="mb-4 w-full max-w-md">
			<label for="monto" class="block text-white mb-2">
				De {{ action === 'purchase' ? getCoinName(selectedCrypto) : 'Pesos Argentinos' }}
			</label>
			<div class="flex">
				<div v-if="action === 'purchase'" class="flex w-full">
					<input
						id="conversion"
						v-model="convertedAmount"
						type="number"
						disabled
						class="p-2 w-full bg-white text-black rounded-l-lg"
						/>
						<select v-model="selectedCrypto" @change="updateConversion" class="p-2 bg-white text-black rounded-r-lg">
							<option v-for="coin in allCoins" :key="coin.sigla" :value="coin.sigla">{{ coin.sigla }}</option>
						</select>
				</div>
				<input
					v-if="action === 'sale'"
					id="conversion"
					v-model="convertedAmount"
					type="number"
					disabled
					class="p-2 w-full bg-white text-black rounded-lg"
				/>
			</div>
		</div>
		<p class="mb-6 text-white">Tasa de cambio: 1 {{ selectedCrypto }} = {{ exchangeRate }} {{ selectedFiat }}</p>
		<button @click="confirmTransaction" class="bg-accent text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
			Confirmar {{ action === 'purchase' ? 'Compra' : 'Venta' }}
		</button>

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
import { useStore } from 'vuex'
import { getCripto } from '@/api/criptoService'
import { createTransaction } from '@/api/transaccionService'
import AlertModal from '@/components/AlertModal.vue'
import coins from '@/data/coins.js'
import { formatDate } from '@/helpers/parsers'

const store = useStore()
const action = ref('purchase')
const amount = ref(0)
const convertedAmount = ref(0)
const selectedFiat = ref('ARS')
const selectedCrypto = ref(coins[0].sigla)
const exchangeRate = ref(0)
const allCoins = coins
let timeout = null

const showAlert = ref(false)
const alertType = ref('error')
const alertTitle = ref('')
const alertMessage = ref('')

const validateAmount = () => {
	if (amount.value < 0) {
		amount.value = 0;
		convertedAmount.value = 0;
	}
	if (amount.value > 0 && selectedCrypto) {
		if (timeout) clearTimeout(timeout)

		timeout = setTimeout(() => {
			updateConversion()
		}, 500)
	}
}

const getCoinName = (sigla) => {
	const coin = allCoins.find(coin => coin.sigla === sigla)
	return coin ? coin.nombre : ''
}

const updateConversion = async () => {
	try {
		const criptoData = await getCripto(selectedCrypto.value);
		exchangeRate.value = criptoData.totalAsk || 0;
		if (action.value === 'purchase') {
			convertedAmount.value = (amount.value / exchangeRate.value).toFixed(6);
		} 
		else if (action.value === 'sale') {
			convertedAmount.value = (amount.value * exchangeRate.value).toFixed(2);
		}
	} catch (error) {
		convertedAmount.value = 0;
		exchangeRate.value = 0;
		showAlert.value = true;
		alertTitle.value = 'Error'
		alertType.value = 'error';
		const cryptoName = getCoinName(selectedCrypto.value);
		alertMessage.value = `Ocurrio un problema al obtener os datos de ${cryptoName}.`;
	}
};

const confirmTransaction = async () => {
	if (amount.value <= 0 || !selectedCrypto.value) {
		showAlert.value = true
		alertType.value = 'error'
		alertTitle.value = 'Error'
		alertMessage.value = 'Ingrese un monto.';
		return;
	}
	
	const transaction = {
		user_id: store.state.user.username,
		action: action.value === 'purchase' ? 'purchase' : 'sale',
		crypto_code: selectedCrypto.value.toLowerCase(),
		crypto_amount: action.value === 'purchase' ? convertedAmount.value : amount.value.toString(),
		money: action.value === 'purchase' ? amount.value.toString() : convertedAmount.value,
		datetime: formatDate('YYYY-MM-DD HH:MM',new Date())
	}

	try {
		await createTransaction(transaction);
		showAlert.value = true;
		alertType.value = 'success';
		alertTitle.value = 'Exito';
		alertMessage.value = 'La transacción se realizó con éxito.';
	} catch (error) {
		showAlert.value = true;
		alertType.value = 'error';
		alertTitle.value = 'Error';
		alertMessage.value = `Ocurrio un problema al realizar la ${action.value === 'purchase' ? 'compra' : 'venta'}.`;
	}
}

onMounted(() => {
  updateConversion()
})
</script>