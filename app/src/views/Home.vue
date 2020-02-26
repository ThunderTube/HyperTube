<template>
  <div class="w-full container overflow-hidden mx-auto h-screen pt-8 relative">
    <h1 class="text-white text-2xl text-center mb-4 uppercase tracking-wider">Search</h1>

    <movies-search-bar class="mb-4" />

    <movies-container>
      <div v-for="i in number_of_movies" :key="i" class="w-full md:w-1/3 lg:w-1/5 p-2">
        <movie-thumbnail />
      </div>
    </movies-container>
  </div>
</template>

<script>
import MoviesSearchBar from '@/components/MoviesSearchBar.vue'
import MoviesContainer from '@/components/MoviesContainer.vue'
import MovieThumbnail from '@/components/MovieThumbnail.vue'

export default {
  name: 'home',
  components: {
    MovieThumbnail,
    MoviesSearchBar,
    MoviesContainer
  },
  data() {
    return {
      number_of_movies: 100
    }
  }
}
</script>

<style lang="css" scoped></style>
