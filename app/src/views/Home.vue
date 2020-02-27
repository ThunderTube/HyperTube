<template>
  <div
    class="w-full container overflow-hidden mx-auto h-screen pt-8 relative flex flex-col"
  >
    <h1 class="text-white text-2xl text-center mb-4 uppercase tracking-wider">
      Movies
    </h1>

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
        <movie-thumbnail
          :key="movie.id"
          class="w-full md:w-1/2 lg:w-1/4 p-2"
          v-bind="movie"
        />
      </template>
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
      searchQuery: undefined,
      genre: undefined,
      year: undefined,

      hasMore: true,
      loading: false,
      movies: Array.from({ length: 100 }).map((_, index) => ({ id: index }))
    }
  },
  methods: {
    fetchMore() {}
  },
  watch: {
    searchQuery() {},
    genre() {},
    year() {}
  }
}
</script>
