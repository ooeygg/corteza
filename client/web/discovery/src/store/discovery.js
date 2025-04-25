const types = {
  processing: 'processing',
  types: 'types',
  aggregations: 'aggregations',
  modules: 'modules',
  namespaces: 'namespaces',
}

export default function (DiscoveryAPI) {
  return {
    namespaced: true,

    state: {
      processing: false,
      types: [],
      aggregations: [],
      modules: [],
      namespaces: [],
    },

    getters: {
      processing: state => state.processing,
      types: state => state.types,
      aggregations: state => state.aggregations,
      modules: state => state.modules,
      namespaces: state => state.namespaces,
    },

    actions: {
      async fetchData ({ commit }, { query, modules, namespaces, size }) {
        commit(types.processing, true)

        return DiscoveryAPI.query({ query, modules, namespaces, size }).then((response = {}) => {
          if (response) {
            commit(types.aggregations, response.aggregations)
          }

          return response
        }).finally(() => {
          commit(types.processing, false)
        })
      },

      updateTypes ({ commit }, types) {
        commit(types.types, types)
      },

      updateModules ({ commit }, modules) {
        commit(types.modules, modules)
      },

      updateNamespaces ({ commit }, namespaces) {
        commit(types.namespaces, namespaces)
      },
    },

    mutations: {
      [types.processing] (state, value) {
        state.processing = value
      },

      [types.types] (state, types) {
        state.types = types
      },

      [types.aggregations] (state, aggs) {
        state.aggregations = aggs
      },

      [types.modules] (state, modules) {
        state.modules = modules
      },

      [types.namespaces] (state, namespaces) {
        state.namespaces = namespaces
      },
    },
  }
}
