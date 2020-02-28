<template>
  <article>
    <router-link
      :to="`/${$i18n.locale}/movie/${id}`"
      :title="title"
      class="h-full flex flex-col bg-gray-800 text-gray-200 shadow-xl rounded transition-transform duration-300 transform hover:scale-95"
    >
      <v-lazy-image
        :src="image"
        :src-placeholder="
          require('@/assets/img/mini-default-movie-picture.jpg')
        "
        :alt="imageAlt"
        class="w-full self-start rounded-t bg-gray-300 object-cover movie-thumbnail__img"
        @error.native="errorOccuredDuringImageLoading"
      />

      <div class="flex-grow px-6 pt-4 pb-2">
        <h2 class="font-bold text-xl mb-2 leading-tight">{{ title }}</h2>

        <p class="text-gray-400 text-base font-semibold mb-2">{{ year }}</p>

        <div class="flex flex-wrap items-center py-1">
          <tag v-for="genre in genres" :key="genre">{{ genre }}</tag>
        </div>
      </div>

      <div class="mb-2 px-6 max-w-full flex justify-center items-center">
        <movie-thumbnail-stars :rating="rating" />
      </div>
    </router-link>
  </article>
</template>

<script>
import VLazyImage from 'v-lazy-image'

import Tag from './Tag.vue'
import MovieThumbnailStars from './MovieThumbnailStars.vue'
import EmptyImage from '@/assets/img/empty-image.png'

export default {
  name: 'MovieThumbnail',
  inheritAttrs: false,
  components: {
    Tag,
    VLazyImage,
    MovieThumbnailStars
  },
  props: {
    id: {
      type: [Number, String],
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
    }
  },
  computed: {
    imageAlt() {
      return `${this.title} movie background picture`
    }
  },
  methods: {
    errorOccuredDuringImageLoading({ target }) {
      target.classList.add('v-lazy-image-loaded')
      target.src = EmptyImage
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
