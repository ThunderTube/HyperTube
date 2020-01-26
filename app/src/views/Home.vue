<template>
  <div class="w-full container overflow-hidden mx-auto min-h-screen">
    <div class="px-2">
      <div class="flex flex-wrap -mx-2">
        <div v-for="i in number_of_movies" :key="i" class="w-full md:w-1/3 lg:w-1/5 p-2">
          <movie-thumbnail />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MovieThumbnail from "@/components/MovieThumbnail.vue";

export default {
  name: "home",
  components: {
    MovieThumbnail
  },
  data() {
    return {
      number_of_movies: 50
    }
  }
};
</script>

<style lang="css" scoped>
</style>
