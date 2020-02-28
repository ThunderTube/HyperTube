<template>
  <div class="w-full container pt-20 mx-auto">
    <h2 class="text-white font-semibold text-3xl tracking-wider mb-6">
      {{ title }} ({{ year }})
    </h2>

    <video
      preload="none"
      v-bind:poster="image"
      class="w-full object-cover object-top player"
    ></video>

    <div class="py-4 text-white">
      <p class="text-xl mb-2" :title="`The movie lasts ${formattedRuntime}`">
        ⏱ {{ formattedRuntime }}
      </p>

      <blockquote class="text-xl tracking-wide mb-3">
        {{ description }}
      </blockquote>

      <tag v-for="genre in genres" :key="genre" big>
        {{ genre }}
      </tag>
    </div>
  </div>
</template>

<script>
import Tag from './Tag.vue'

export default {
  name: 'MovieViewer',
  components: {
    Tag
  },
  props: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    runtime: {
      type: Number,
      required: true
    },
    genres: {
      type: Array,
      required: true
    },
    image: {
      type: String,
      required: true
    }
  },
  computed: {
    formattedRuntime() {
      const hours = this.runtime / 60
      const minutes = this.runtime % 60

      return `${hours.toFixed(0)}h${minutes.toFixed(0)}`
    }
  }
}
</script>

<style lang="scss" scoped>
.player {
  height: 500px;
}
</style>
