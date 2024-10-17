<template>
	<div class="min-h-screen flex flex-col items-start justify-start bg-secondary text-white pt-4 pl-4">
		<div class="flex items-center mb-4">
			<h1 class="text-primary text-2xl font-bold mr-2">Comprar</h1>
			<input type="radio" v-model="action" value="purchase" class="text-primary mr-2 mt-1" @change="updateConversion"/>
			<h1 class="text-primary text-2xl font-bold mx-2">/</h1>
			<h1 class="text-primary text-2xl font-bold mr-2">Vender</h1>
			<input type="radio" v-model="action" value="sale" class="text-primary mt-1" @change="updateConversion"/>
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
			<div v-if="action === 'sale'" class="mb-4 w-full max-w-md">
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

const store = useStore()
const action = ref('purchase')
const amount = ref(0)
const convertedAmount = ref(0)
const selectedFiat = ref('ARS')
const selectedCrypto = ref(coins[0].sigla)
const exchangeRate = ref(0)
const allCoins = coins

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
		updateConversion();
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
		alertMessage.value = `No se pudo obtener la información de ${cryptoName}.`;
	}
};

const confirmTransaction = async () => {
	if (amount.value <= 0 || !selectedFiat.value || !selectedCrypto.value) {
		showAlert.value = true
		alertType.value = 'error'
		alertTitle.value = 'Error'
		alertMessage.value = 'Por favor, ingresa un monto y selecciona ambas monedas.';
		return;
	}

	const transaction = {
		user_id: store.state.user?.id,
		action: action.value === 'purchase' ? 'purchase' : 'sale',
		crypto_code: selectedCrypto.value.toLowerCase(),
		crypto_amount: convertedAmount.value,
		money: amount.value,
		datetime: new Date().toLocaleString('es-AR', { hour12: false })
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
		alertMessage.value = error.message || 'No se pudo realizar la transacción.';
	}
}

onMounted(() => {
  updateConversion()
})
</script>