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
  }
}
</script>

<style lang="scss" scoped>
.player {
  height: 500px;
}
</style>
