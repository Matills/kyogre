import { createStore } from 'vuex'
import { getCripto } from '@/api/criptoService'
import { getTransactions } from '@/api/transaccionService'

export default createStore({
  state: {
    user: null,
    wallet: [],
  },
  getters: {
    isAuthenticated: (state) => !!state.user,
    getWallet: (state) => state.wallet,
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    },
    logout(state) {
      state.user = null
    },
    setWallet(state, wallet) {
      const existingWalletMap = {}
      state.wallet.forEach(item => {
        existingWalletMap[item.crypto_code] = item
      })
      wallet.forEach(coin => {
        if (existingWalletMap[coin.crypto_code]) {
          existingWalletMap[coin.crypto_code].crypto_amount += coin.crypto_amount
          existingWalletMap[coin.crypto_code].balanceARS += coin.balanceARS
        } else {
          existingWalletMap[coin.crypto_code] = coin
        }
      })
      state.wallet = Object.values(existingWalletMap)
    },
    addCrypto(state, crypto) {
      const existingCrypto = state.wallet.find(item => item.crypto_code === crypto.crypto_code)
      if (existingCrypto) {
        existingCrypto.crypto_amount += crypto.crypto_amount
        existingCrypto.balanceARS += crypto.balanceARS
      } else {
        state.wallet.push(crypto)
      }
    },
  },
  actions: {
    login({ commit }, user) {
      commit('setUser', user)
    },
    logout({ commit }) {
      commit('logout')
    },
    async fetchWalletData({ commit, state }) {
      const userId = state.user.username;
      try {
        const transactions = await getTransactions(userId);
        const walletMap = {};
                const pricePromises = transactions
          .filter(transaction => transaction.crypto_code !== 'ars')
          .map(transaction => getCripto(transaction.crypto_code));
    
        const priceDataArray = await Promise.all(pricePromises);
        const priceMap = {};
    
        priceDataArray.forEach((priceData, index) => {
          const cryptoCode = transactions[index].crypto_code;
          if (cryptoCode !== 'ars') {
            priceMap[cryptoCode] = parseFloat(priceData.bid);
          }
        });
    
        transactions.forEach(transaction => {
          const price = priceMap[transaction.crypto_code] || 0;
          if (!walletMap[transaction.crypto_code]) {
            walletMap[transaction.crypto_code] = {
              crypto_code: transaction.crypto_code,
              crypto_amount: parseFloat(transaction.crypto_amount),
              price: price,
              balanceARS: parseFloat(transaction.crypto_amount) * price,
            };
          } else {
            walletMap[transaction.crypto_code].crypto_amount += parseFloat(transaction.crypto_amount);
            walletMap[transaction.crypto_code].balanceARS = walletMap[transaction.crypto_code].crypto_amount * price;
          }
        });
    
        commit('setWallet', Object.values(walletMap));
      } catch (error) {
        throw new Error('Error al cargar los datos de la billetera.');
      }
    }    
  },
  modules: {
  }
})
