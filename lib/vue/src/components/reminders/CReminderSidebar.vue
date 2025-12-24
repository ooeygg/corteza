<template>
  <b-sidebar
    v-model="isVisible"
    :title="title"
    header-class="d-flex align-items-center justify-content-between reminder-sidebar-header p-3 border-bottom"
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
      <h4
        class="text-primary mb-0"
      >
        <b>{{ title }}</b>
      </h4>

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

    <slot />
  </b-sidebar>
</template>

<script lang="js">
import { throttle } from 'lodash'

export default {
  props: {
    title: {
      type: String,
      default: '',
    },

    visible: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  data () {
    return {
      isMobile: false,
    }
  },

  computed: {
    isVisible: {
      get () {
        return this.visible
      },

      set (visible) {
        this.$emit('update:visible', visible)
      },
    },
  },

  watch: {
    isVisible (visible) {
      if (visible) {
        this.$root.$emit('right-sidebar:opened', 'reminders')
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
    checkIfMobile: throttle(function () {
      this.isMobile = window.innerWidth < 1024
    }, 500),

    handleSidebarOpened (name) {
      if (name !== 'reminders') {
        this.isVisible = false
      }
    },
  },
}
</script>

<style lang="scss">
.reminder-sidebar-header {
  height: 64px;
  background-color: var(--gray-200);
}

.b-sidebar-backdrop {
  opacity: 0.75 !important;
}
</style>
