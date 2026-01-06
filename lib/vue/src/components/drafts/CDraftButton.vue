<template>
  <b-button
    v-b-tooltip.hover="{ title: $t('drafts:title'), delay: { show: 500, hide: 0 } }"
    variant="outline-extra-light"
    size="lg"
    class="nav-icon rounded-circle text-center border-0 d-flex align-items-center justify-content-center"
    @click="toggleDrafts"
  >
    <font-awesome-icon
      :icon="['far', 'file']"
      class="text-dark"
    />
  </b-button>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'CDraftButton',

  methods: {
    ...mapActions({
      toggleVisibility: 'drafts/toggleVisibility',
    }),

    toggleDrafts () {
      this.toggleVisibility()
    },
  },
}
</script>

