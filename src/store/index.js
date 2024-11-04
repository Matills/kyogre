import { createStore } from 'vuex'

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
      state.wallet = wallet
    },
    updateWallet(state, { cryptoCode, fiatAmount, cryptoAmount }) {
      const fiatAsset = state.wallet.find(item => item.crypto_code === 'ars')
      const cryptoAsset = state.wallet.find(item => item.crypto_code === cryptoCode)
      if (fiatAsset) {
        fiatAsset.crypto_amount -= fiatAmount
      }
      if (cryptoAsset) {
        cryptoAsset.crypto_amount += cryptoAmount
      } else {
        state.wallet.push({
          crypto_code: cryptoCode,
          crypto_amount: cryptoAmount
        })
      }
    }
  },
  actions: {
    login({ commit }, user) {
      commit('setUser', user)
    },
    logout({ commit }) {
      commit('logout')
    },
  },
  modules: {
  }
})
