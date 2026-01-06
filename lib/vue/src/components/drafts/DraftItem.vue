<template>
  <div class="draft-item-container px-3 pt-3 pb-2 border-bottom">
    <b-list-group-item
      :class="{ 'border-primary': active }"
      class="draft-item border rounded bg-white p-3 position-relative"
      @click="$emit('click', draft)"
    >
      <div
        class="action-menu bg-white pb-2 pl-2"
        style="margin-left: -1rem;"
      >
        <b-dropdown
          right
          variant="outline-extra-light"
          toggle-class="text-decoration-none border-0 dropdown-toggle-no-caret"
          no-caret
        >
          <template #button-content>
            <font-awesome-icon
              :icon="['fas', 'ellipsis-v']"
              class="text-secondary"
              style="margin-top: 0.3rem;"
            />
          </template>

          <c-input-confirm
            :text="$t('general:label.delete')"
            show-icon
            borderless
            variant="link"
            size="md"
            button-class="dropdown-item"
            icon-class="text-danger"
            class="w-100"
            @confirmed="$emit('delete', draft)"
          />
        </b-dropdown>
      </div>

      <div class="draft-item-content">
        <h5 class="font-weight-bold text-break">
          {{ recordLabel }}
        </h5>

        <div class="text-secondary mb-1 text-break">
          {{ description }}
        </div>
        <div class="d-flex align-items-center justify-content-end flex-wrap gap-1">
          <b-badge
            v-b-tooltip.hover.d200
            :title="$t('general:label.namespace.single')"
            variant="primary"
            style="font-size: 85%;"
          >
            {{ namespaceLabel }}
          </b-badge>

          <b-badge
            v-b-tooltip.hover.d200
            :title="$t('general:label.module.single')"
            variant="extra-light"
            style="font-size: 85%;"
          >
            {{ moduleLabel }}
          </b-badge>
        </div>
      </div>
    </b-list-group-item>

    <div class="d-flex justify-content-end mt-2">
      <div
        :title="draft.revision.timestamp"
        class="text-muted small"
      >
        {{ draft.revision.timestamp | locFullDateTime }}
      </div>
    </div>
  </div>
</template>

<script>
import { compose } from '@cortezaproject/corteza-js'
import CInputConfirm from '../input/CInputConfirm.vue'

export default {
  i18nOptions: {
    namespaces: ['drafts', 'general'],
  },

  components: {
    CInputConfirm,
  },

  props: {
    draft: {
      type: Object,
      required: true,
    },

    module: {
      type: Object,
      required: false,
      default: undefined,
    },

    namespace: {
      type: Object,
      required: false,
      default: undefined,
    },

    active: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    namespaceLabel () {
      const { revision } = this.draft
      const parts = revision.resource.split('/')
      const namespaceID = parts[1]

      if (this.namespace) {
        return this.namespace.name || this.namespace.slug || namespaceID
      }

      return namespaceID
    },

    moduleLabel () {
      const { revision } = this.draft
      const parts = revision.resource.split('/')
      const moduleID = parts[2]

      if (this.module) {
        return this.module.name || this.module.handle || moduleID
      }

      return moduleID
    },

    recordLabel () {
      const { revision } = this.draft

      if (this.module && revision.record) {
        const record = new compose.Record(this.module, revision.record)
        // Try to find the first field with a value
        const firstField = (this.module.fields || [])[0]
        if (firstField) {
          const value = record.values[firstField.name]
          if (value) {
            return Array.isArray(value) ? value[0] : value
          }
        }
      }

      const isNew = revision.resource.endsWith('/0') || revision.operation === 'created'
      if (isNew) {
        return this.$t('general:label.newRecord') || 'New Record'
      }

      const parts = revision.resource.split('/')
      const recordID = parts[3]
      return recordID
    },

    description () {
      const { revision } = this.draft
      const isNew = revision.resource.endsWith('/0') || revision.operation === 'created'
      if (isNew) {
        return this.$t('general:label.newRecord') || 'New Record'
      }

      const changesCount = revision.changes.length
      return this.$t('general:changes', { count: changesCount })
    },
  },
}
</script>

<style lang="scss" scoped>
.draft-item-container {
  &:hover {
    background-color: var(--light) !important;
  }

  .draft-item {
    transition: background-color 0.2s ease;
    cursor: pointer;
  }

  &:hover {
    .action-menu {
      opacity: 1 !important;
      pointer-events: auto;
    }
  }
  .action-menu {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    z-index: 2;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }
}
</style>

