<template>
  <div class="flex justify-center pt-20">
    <transition name="fade" mode="out-in">
      <loading-spinner v-if="loading" />

      <movie-viewer v-else-if="movie !== null" v-bind="movie" />

      <movie-viewer-no-data v-else>
        {{ this.$t('movie.error') }}
      </movie-viewer-no-data>
    </transition>
  </div>
</template>

<script>
import axios from '@/api/axios'

import MovieViewer from '@/components/MovieViewer.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import MovieViewerNoData from '@/components/MovieViewerNoData.vue'

function resolveAfter(ms, value) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value)
    }, ms)
  })
}

export default {
  components: {
    MovieViewer,
    LoadingSpinner,
    MovieViewerNoData
  },
  data() {
    return {
      movie: null,
      loading: false
    }
  },
  methods: {
    fetch() {
      this.loading = true

      axios
        .get(`/stream/video/${this.id}`)
        .then(({ data: movie }) => {
          this.movie = movie

          return resolveAfter(1000)
        })
        .catch((e) => {
          console.error(e)

          this.movie = null
        })
        .finally(() => {
          this.loading = false
        })
    }
  },
  created() {
    this.fetch()
  },
  computed: {
    formattedRuntime() {
      const hours = this.runtime / 60
      const minutes = this.runtime % 60

      return `${hours.toFixed(0)}h${minutes.toFixed(0)}`
    },
    id() {
      return this.$route.params.id
    }
  }
}
</script>

<style lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
