<template>
  <v-lazy-image
    :src="src"
    :alt="alt"
    v-bind="$attrs"
    v-on="$listeners"
    :src-placeholder="require('@/assets/img/mini-default-movie-picture.jpg')"
    @error.native="errorOccuredDuringImageLoading"
  />
</template>

<script>
import VLazyImage from 'v-lazy-image'

import EmptyImage from '@/assets/img/empty-image.png'

export default {
  name: 'LazyMovieImage',
  components: {
    VLazyImage
  },
  props: {
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      required: true
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
