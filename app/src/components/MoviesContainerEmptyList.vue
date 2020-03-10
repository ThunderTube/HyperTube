<template functional>
  <p class="movies-container__empty-list">
    {{ parent.$t('home.search_nodata') }}
  </p>
</template>

<script>
export default {
  name: 'MoviesContainerEmptyList'
}
</script>

<style scoped>
.movies-container__empty-list {
  @apply py-2 text-gray-200 text-lg text-center;

  grid-column: 1 / -1;
}
</style>
