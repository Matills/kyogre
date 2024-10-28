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
