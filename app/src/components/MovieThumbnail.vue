<template>
  <article>
    <router-link
      :to="`/${$i18n.locale}/movie/${imdbId}`"
      :title="title"
      class="h-full flex flex-col bg-gray-800 text-gray-200 shadow-xl rounded transition-transform duration-300 transform hover:scale-95 relative"
    >
      <lazy-movie-image
        :src="image"
        :alt="imageAlt"
        class="w-full self-start rounded-t bg-gray-300 object-cover movie-thumbnail__img"
      />

      <div
        v-if="watched"
        class="absolute top-0 left-0 flex items-center justify-center m-2 p-1 rounded-full bg-gray-700"
      >
        <eye-icon class="text-white w-5 h-5" />
      </div>

      <div class="flex-grow px-6 pt-4 pb-2">
        <h2 class="font-bold text-xl mb-2 leading-tight">{{ title }}</h2>

        <p class="text-gray-400 text-base font-semibold mb-2">{{ year }}</p>

        <div class="flex flex-wrap items-center py-1">
          <tag v-for="genre in genres" :key="genre">{{
            $t('genres.' + genre.toLowerCase())
          }}</tag>
        </div>
      </div>

      <div class="mb-2 px-6 max-w-full flex justify-center items-center">
        <movie-stars :rating="rating" />
      </div>
    </router-link>
  </article>
</template>

<script>
import Tag from './Tag.vue'
import MovieStars from './MovieStars.vue'
import LazyMovieImage from './LazyMovieImage'
import EyeIcon from './EyeIcon.vue'

export default {
  name: 'MovieThumbnail',
  inheritAttrs: false,
  components: {
    Tag,
    LazyMovieImage,
    MovieStars,
    EyeIcon
  },
  props: {
    imdbId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    year: {
      type: [Number, String],
      required: true
    },
    rating: {
      type: Number,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    genres: {
      type: Array,
      required: true
    },
    watched: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    imageAlt() {
      return `${this.title} movie background picture`
    }
  }
}
</script>

<style lang="scss" scoped>
.movie-thumbnail__img {
  height: auto;
  min-height: 60vh;

  @screen sm {
    height: 430px;
    min-height: auto;
  }

  @screen md {
    height: 340px;
  }

  @screen lg {
    height: 347px;
  }

  @screen xl {
    height: 440px;
  }
}

.v-lazy-image {
  filter: blur(10px);
  transition: filter 0.7s;
}
.v-lazy-image-loaded {
  filter: blur(0);
}
</style>
