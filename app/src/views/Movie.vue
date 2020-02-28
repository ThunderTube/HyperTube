<template>
  <movie-viewer v-if="movie !== null" v-bind="movie" />
</template>

<script>
import MovieViewer from '@/components/MovieViewer.vue'

export default {
  components: {
    MovieViewer
  },
  data() {
    return {
      movie: null
    }
  },
  methods: {
    fetch() {
      this.loading = true
      this.initialLoad = false

      axios
        .get(`/stream/video/${this.id}`)
        .then(({ data: movie }) => {
          this.movie = movie
        })
        .catch(console.error)
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
    }
  }
}
</script>

<style lang="scss" scoped>
.player {
  height: 500px;
}
</style>
