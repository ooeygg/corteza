<template>
  <div class="h-100 d-flex flex-column">
    <div class="overflow-auto flex-grow-1 h-100 border-top">
      <div
        v-if="loading"
        class="d-flex justify-content-center p-5"
      >
        <b-spinner variant="primary" />
      </div>

      <b-list-group v-else-if="drafts.length > 0">
        <draft-item
          v-for="draft in drafts"
          :key="draft.revision.changeID"
          :draft="draft"
          :namespace="namespaces[draft.revision.resource.split('/')[1]]"
          :module="modules[draft.revision.resource.split('/')[2]]"
          :active="$route.query.draftID === String(draft.revision.changeID)"
          @click="onDraftClick(draft)"
          @delete="onDeleteDraft"
        />
      </b-list-group>

      <div
        v-else
        class="text-center p-5"
      >
        <font-awesome-icon
          :icon="['far', 'edit']"
          class="text-secondary mb-3"
          size="3x"
        />
        <p class="text-secondary">
          {{ $t('empty') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import DraftItem from './DraftItem.vue'

export default {
  i18nOptions: {
    namespaces: ['drafts', 'notifications'],
  },

  components: {
    DraftItem,
  },

  data () {
    return {
      modules: {},
      namespaces: {},
    }
  },

  computed: {
    ...mapGetters({
      drafts: 'drafts/getAllDrafts',
      loading: 'drafts/isLoading',
    }),
  },

  watch: {
    drafts: {
      immediate: true,
      handler (drafts) {
        this.fetchMetadata(drafts)
      },
    },
  },

  methods: {
    ...mapActions({
      removeDraft: 'drafts/removeDraft',
    }),

    ...mapMutations({
      setVisible: 'drafts/setVisible',
    }),

    async fetchMetadata (drafts) {
      try {
        for (const draft of drafts) {
          const parts = draft.revision.resource.split('/')
          const namespaceID = parts[1]
          const moduleID = parts[2]

          if (!this.namespaces[namespaceID]) {
            const ns = await this.$ComposeAPI.namespaceRead({ namespaceID })
            if (ns) {
              this.$set(this.namespaces, namespaceID, ns)
            }
          }

          if (!this.modules[moduleID]) {
            const mod = await this.$ComposeAPI.moduleRead({ namespaceID, moduleID })
            if (mod) {
              this.$set(this.modules, moduleID, mod)
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch metadata:', e)
      }
    },

    async onDraftClick (draft) {
      const { revision } = draft

      // Resource format: compose:record/{namespaceID}/{moduleID}/{recordID}
      const parts = revision.resource.split('/')
      if (parts.length < 4) return

      const namespaceID = parts[1]
      const moduleID = parts[2]
      const recordID = parts[3] === '0' ? undefined : parts[3]

      let pageID

      try {
        const pages = await this.$ComposeAPI.pageList({ namespaceID, moduleID })
        const recordPage = (pages.set || []).find(p => p.moduleID === moduleID)
        if (recordPage) {
          pageID = recordPage.pageID
        }
      } catch (e) {
        console.error('Failed to fetch page metadata:', e)
      }

      if (!pageID) {
        this.toastDanger(this.$t('notifications:recordRedirectError'))
        return
      }

      const isCompose = this.$router.app.$options.name === 'compose'
      const slug = namespaceID // Using namespaceID as slug since we don't fetch namespace

      if (!isCompose) {
        const u = new URL(window.location)
        let url = `${u.origin}/compose/ns/${slug}/pages/${pageID}/record/`
        if (recordID) {
          url += `${recordID}/edit`
        }
        url += `?draftID=${revision.changeID}`

        window.location.assign(url)
        return
      }

      const route = {
        name: recordID ? 'page.record.edit' : 'page.record.create',
        params: {
          slug,
          pageID,
          recordID,
        },
        query: {
          draftID: revision.changeID,
        },
      }

      this.$router.push(route).catch(err => {
        console.error('Draft navigation failed:', err)
      })
    },

    onDeleteDraft ({ revision }) {
      this.removeDraft({ changeID: revision.changeID })
        .then(() => {
          this.toastSuccess(this.$t('deleted'))
        })
        .catch(() => {
          this.toastDanger(this.$t('deleteError'))
        })
    },
  },
}
</script>

