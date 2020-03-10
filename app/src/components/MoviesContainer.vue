<template>
  <section
    ref="scroll-container"
    class="overflow-y-auto overflow-x-hidden h-full p-2 m-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 movies-container"
  >
    <template v-if="items.length > 0">
      <template v-for="item in items">
        <slot name="movie" v-bind="item" />
      </template>
    </template>
    <movies-container-empty-list v-else-if="!loading" />

    <infinite-scroll
      v-if="hasMore || loading"
      scroll-container="scroll-container"
      :should-handle="!loading"
      :handler="fetchMore"
      style="grid-column: 1 / -1"
      class="py-5"
    >
      <div class="h-full w-full flex justify-center items-center">
        <loading-spinner class="absolute" />
      </div>
    </infinite-scroll>
  </section>
</template>

<script>
import InfiniteScroll from 'vue-mugen-scroll'

import LoadingSpinner from './LoadingSpinner.vue'
import MoviesContainerEmptyList from './MoviesContainerEmptyList.vue'

export default {
  name: 'MoviesContainer',
  components: {
    InfiniteScroll,
    LoadingSpinner,
    MoviesContainerEmptyList
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

<style lang="scss">
.movies-container {
  grid-auto-rows: max-content;

  &::-webkit-scrollbar-track {
    background-color: theme('colors.gray.700');
  }

  &::-webkit-scrollbar {
    width: 6px;
    background-color: theme('colors.gray.700');
  }

  &::-webkit-scrollbar-thumb {
    background-color: theme('colors.gray.400');
  }
}
</style>
