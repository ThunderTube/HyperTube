<template>
  <article>
    <router-link
      :to="`/${$i18n.locale}/movie/${imdbId}`"
      :title="decodedTitle"
      class="relative flex flex-col h-full text-gray-200 transition-transform duration-300 transform bg-gray-800 rounded shadow-xl hover:scale-95"
    >
      <lazy-movie-image
        :src="image"
        :alt="imageAlt"
        class="self-start object-cover w-full bg-gray-300 rounded-t movie-thumbnail__img"
      />

      <div
        v-if="watched"
        class="absolute top-0 left-0 flex items-center justify-center p-1 m-2 bg-gray-700 rounded-full"
      >
        <eye-icon class="w-5 h-5 text-white" />
      </div>

      <div class="flex-grow px-6 pt-4 pb-2">
        <h2 class="mb-2 text-xl font-bold leading-tight">{{ decodedTitle }}</h2>

        <p class="mb-2 text-base font-semibold text-gray-400">{{ year }}</p>

        <div class="flex flex-wrap items-center py-1">
          <tag v-for="genre in genres" :key="genre">{{
            $t('genres.' + genre.toLowerCase())
          }}</tag>
        </div>
      </div>

      <div class="flex items-center justify-center max-w-full px-6 mb-2">
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
import { decodeHTMLEntities } from '@/utils.js'

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
      return `${this.decodedTitle} movie background picture`
    },
    decodedTitle() {
      return decodeHTMLEntities(this.title)
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
