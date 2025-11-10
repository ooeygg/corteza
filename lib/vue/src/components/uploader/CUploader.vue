<template>
  <div>
    <vue-dropzone
      id="dropzone"
      ref="dropzone"
      :use-custom-slot="true"
      :include-styling="false"
      :options="dzOptions"
      class="uploader"
      @vdropzone-file-added="onFileAdded"
      @vdropzone-file-added-manually="onFileAdded"
      @vdropzone-success="onSuccess"
      @vdropzone-error="onError"
      @vdropzone-upload-progress="onUploadProgress"
    >
      <div
        class="drop-container w-100 h-100 position-relative bg-light rounded"
      >
        <template v-if="processing">
          <div
            class="bg-primary h-100 progress-bar position-absolute"
            :style="progressBarStyle"
          />

          <span class="d-flex align-items-center h-100 w-100 uploading justify-content-center position-relative py-2">
            {{ uploadingLabel }}
          </span>
        </template>

        <div
          v-else
          data-test-id="drop-area"
          class="d-flex align-items-center h-100 w-100 p-2 droparea justify-content-center"
        >
          {{ displayLabel }}
        </div>
      </div>
    </vue-dropzone>

    <p
      v-if="error"
      class="text-danger mb-0"
    >
      {{ error }}
    </p>
  </div>
</template>

<script>
import numeral from 'numeral'
import vueDropzone from 'vue2-dropzone'
import { files } from '@/mixins'

export default {
  name: 'CUploader',

  i18nOptions: {
    namespaces: 'general',
  },

  components: {
    vueDropzone,
  },

  mixins: [
    files,
  ],

  props: {
    endpoint: {
      type: String,
      required: true,
    },

    disabled: {
      type: Boolean,
      default: () => false,
    },

    acceptedFiles: {
      type: Array,
      default: () => [],
    },

    maxFilesize: {
      type: Number,
      default: 100,
    },

    labels: {
      type: Object,
      default: () => ({}),
    },

    formData: {
      type: Object,
      required: false,
      default: () => ({}),
    },

    paramName: {
      type: String,
      default: 'upload',
    },
  },

  data () {
    return {
      processing: null,
      error: null,
    }
  },

  computed: {
    dropzone () {
      return (this.$refs.dropzone && this.$refs.dropzone.dropzone) ? this.$refs.dropzone.dropzone : false
    },

    dzOptions () {
      const vm = this

      return {
        paramName: this.paramName,
        maxFilesize: this.maxFilesize, // mb
        url: () => this.endpoint,
        thumbnailMethod: 'contain',
        thumbnailWidth: 320,
        thumbnailHeight: 180,
        maxFiles: 1000,
        withCredentials: true,
        autoProcessQueue: true,
        disablePreviews: true,
        uploadMultiple: false,
        parallelUploads: 1,
        acceptedFiles: null,
        init: function () {
          this.on('sending', function (file, xhr, formData) {
            for (const k in vm.formData || {}) {
              formData.append(k, vm.formData[k])
            }
          })
        },
        headers: {
          // https://github.com/enyo/dropzone/issues/1154
          'Cache-Control': '',
          'X-Requested-With': '',
          Authorization: 'Bearer ' + this.$auth.accessToken,
        },
      }
    },

    progressBarStyle () {
      return {
        width: this.processing.progress + '%',
      }
    },

    uploadingLabel () {
      const uploadingLabel = this.labels.uploading || 'Uploading files'

      const { file = {} } = this.processing || {}

      return `${uploadingLabel} ${file.name} (${this.size(file)})`
    },

    displayLabel () {
      return this.labels.placeholder || 'Click or drop files here to upload'
    },
  },

  methods: {
    size (a) {
      return numeral(a.size).format('0b')
    },

    onSuccess (file, { response, error }) {
      if (error) {
        return this.onError(error, error.message)
      }

      this.processing = null
      this.error = null
      this.$emit('upload', response, file)
    },

    onFileAdded (file) {
      this.error = null

      // Check if file type is allowed
      let types = this.acceptedFiles
      if (!types || !types.length) {
        types = ['*/*']
      }
      if (!this.validateFileType(file.name, types)) {
        this.$refs.dropzone.removeFile(file)
        const errorMsg = this.labels.fileTypeNotAllowed || 'File type not allowed'
        this.onError(null, errorMsg)
      }
    },

    onError (e, message) {
      this.error = message
      this.processing = null
    },

    onUploadProgress (file, progress, bytesSent) {
      this.processing = { file, progress, bytesSent }
    },
  },
}
</script>

<style lang="scss" scoped>
.drop-container {
  &:hover {
    background-color: var(--extra-light) !important;
  }
}

.droparea {
  cursor: pointer;
}

.progress-bar {
  width: 0;
  opacity: 0.3;
}

.uploading {
  background-size: 100% 100%;
  background-position: right bottom;
  cursor: wait;
}
</style>


<style lang="scss">
.uploader {
  .dz-preview {
    display: none !important;
  }
}
</style>
