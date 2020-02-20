<template>
  <div class="shadow-xl m-2">
    <router-link :to="`/${$i18n.locale}/movie`">
      <img class="movie-thumbnail" src="@/assets/img/star_wars.jpg" alt />
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'MovieThumbnail'
}
</script>

<style lang="css" scoped>
.movie-thumbnail {
  opacity: 0.75;
  transition: all 0.3s;
}

.movie-thumbnail:hover {
  opacity: 1;
  transform: scale(1.1);
}
</style>
