<template>
  <section
    class="overflow-y-auto overflow-x-hidden h-full flex flex-wrap justify-around p-2"
  >
    <template v-for="item in items">
      <slot name="movie" v-bind="item" />
    </template>

    <infinite-scroll v-if="hasMore" :loading="loading" :handler="fetchMore">
      <slot name="loader">
        <loading-spinner />
      </slot>
    </infinite-scroll>
  </section>
</template>

<script>
import InfiniteScroll from 'vue-mugen-scroll'

import LoadingSpinner from './LoadingSpinner.vue'

export default {
  name: 'MoviesContainer',
  components: {
    InfiniteScroll,
    LoadingSpinner
  },
  props: {
    items: {
      type: Array,
      required: true
    },
    hasMore: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    fetchMore() {
      this.$emit('fetch-more')
    }
  }
}
</script>
