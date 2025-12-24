<template>
  <b-sidebar
    v-model="isVisible"
    header-class="d-flex align-items-center justify-content-between notification-sidebar-header bg-white pl-3 pr-2"
    body-class="d-flex flex-column overflow-hidden bg-white"
    sidebar-class="topbar-offset"
    :backdrop="isMobile"
    backdrop-variant="white"
    no-slide
    no-footer
    right
    shadow
    no-close-on-route-change
    no-close-on-esc
    width="400px"
  >
    <template #header>
      <h5
        class="text-primary mb-0"
      >
        <b>{{ $t('title') }}</b>
      </h5>

      <b-button
        variant="outline-light"
        class="d-flex align-items-center justify-content-center p-2 border-0 text-secondary"
        @click="isVisible = false"
      >
        <font-awesome-icon
          :icon="['fas', 'times']"
          class="h6 mb-0"
        />
      </b-button>
    </template>

    <notifications />
  </b-sidebar>
</template>

<script lang="js">
import Notifications from './Notifications.vue'
import { mapGetters, mapMutations } from 'vuex'
import { throttle } from 'lodash'

export default {
  i18nOptions: {
    namespaces: 'notifications',
  },

  components: {
    Notifications,
  },

  data () {
    return {
      isMobile: false,
    }
  },

  computed: {
    ...mapGetters({
      visible: 'notifications/visible',
    }),

    isVisible: {
      get () {
        return this.visible
      },

      set (visible) {
        this.setVisible(visible)
      },
    },
  },

  watch: {
    isVisible (visible) {
      if (visible) {
        this.$root.$emit('right-sidebar:opened', 'notifications')
      }
    },
  },

  created () {
    this.$root.$on('right-sidebar:opened', this.handleSidebarOpened)
  },

  mounted () {
    this.checkIfMobile()
    window.addEventListener('resize', this.checkIfMobile)
  },

  beforeDestroy () {
    this.$root.$off('right-sidebar:opened', this.handleSidebarOpened)
    window.removeEventListener('resize', this.checkIfMobile)
  },

  methods: {
    ...mapMutations({
      setVisible: 'notifications/setVisible',
    }),

    checkIfMobile: throttle(function () {
      this.isMobile = window.innerWidth < 1024
    }, 500),

    handleSidebarOpened (name) {
      if (name !== 'notifications') {
        this.isVisible = false
      }
    },
  },
}
</script>

<style lang="scss">
.notification-sidebar-header {
  height: 4rem;
}

.b-sidebar-backdrop {
  opacity: 0.75 !important;
}
</style>
