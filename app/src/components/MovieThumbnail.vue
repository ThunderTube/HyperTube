<template>
  <article>
    <router-link
      :to="`/${$i18n.locale}/movie`"
      :title="title"
      class="flex flex-col bg-gray-800 text-gray-200 shadow-xl rounded transition-transform duration-300 transform hover:scale-105"
    >
      <img src="@/assets/img/star_wars.jpg" alt="thumbnail" class="w-full" />

      <div class="px-6 py-4">
        <h2 class="font-bold text-xl mb-2 leading-tight">{{ title }}</h2>

        <p class="text-gray-400 text-base font-semibold">{{ year }}</p>
      </div>
      <footer class="px-6 mb-4 max-w-full flex justify-center items-center">
        <movie-thumbnail-stars :rating="rating" />
      </footer>
    </router-link>
  </article>
</template>

<script>
import MovieThumbnailStars from './MovieThumbnailStars.vue'

export default {
  name: 'MovieThumbnail',
  components: {
    MovieThumbnailStars
  },
  props: {
    id: {
      type: [Number, String],
      required: true
    },
    title: {
      type: String,
      // required: true,
      default: "Shrek 3, le retour de l'Homme"
    },
    year: {
      type: [Number, String],
      // required: true
      default: 1989
    },
    rating: {
      type: Number,
      default: 7.2
    }
  }
}
</script>
