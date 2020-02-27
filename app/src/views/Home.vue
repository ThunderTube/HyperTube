<template>
  <div class="w-full container overflow-hidden mx-auto h-screen pt-8 relative flex flex-col">
    <h1 class="text-white text-2xl text-center mb-4 uppercase tracking-wider">Movies</h1>

    <movies-search-bar
      :search-query.sync="searchQuery"
      :genre.sync="genre"
      :year.sync="year"
      class="mb-4"
    />

    <movies-container
      :items="movies"
      :loading="loading"
      :has-more="hasMore"
      @fetch-more="fetchMore"
    >
      <template #movie="movie">
        <movie-thumbnail :key="movie.id" v-bind="movie" />
      </template>
    </movies-container>
  </div>
</template>

<script>
import debounce from 'lodash.debounce'

import MoviesSearchBar from '@/components/MoviesSearchBar.vue'
import MoviesContainer from '@/components/MoviesContainer.vue'
import MovieThumbnail from '@/components/MovieThumbnail.vue'
import axios from '@/api/axios.js'

export default {
  name: 'home',
  components: {
    MovieThumbnail,
    MoviesSearchBar,
    MoviesContainer
  },
  data() {
    return {
      searchQuery: undefined,
      genre: undefined,
      year: undefined,

      initialLoad: true,

      offset: 0,
      hasMore: true,
      loading: true,
      movies: []
    }
  },
  created() {
    this.fetchMore()
  },
  methods: {
    fetchMore: debounce(function fetchMore() {
      const LIMIT = 30

      this.loading = true
      this.initialLoad = false

      axios
        .post(`/stream/videos/search/${this.offset}/${LIMIT}`, {
          query: this.searchQuery || '',
          genre: this.genre || '',
          year: this.year || ''
        })
        .then(({ data: { data: movies, hasMore } }) => {
          this.movies.push(...movies)
          this.hasMore = hasMore
          this.offset += movies.length
        })
        .catch(console.error)
        .finally(() => {
          this.loading = false
        })
    }, 500),
    resetThenFetch() {
      this.offset = 0
      this.movies = []
      this.loading = true
      return this.fetchMore()
    }
  },
  watch: {
    searchQuery() {
      this.resetThenFetch()
    },
    genre() {
      this.resetThenFetch()
    },
    year() {
      this.resetThenFetch()
    }
  }
}
</script>
