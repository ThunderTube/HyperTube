<template>
  <div class="w-full container mx-auto">
    <h2 class="text-white font-semibold text-3xl tracking-wider mb-6">
      {{ title }} ({{ year }})
    </h2>

    <div class="player">
      <video
        preload="none"
        v-bind:poster="image"
        class="w-full h-full object-cover object-top"
      ></video>

      <transition name="fade" mode="out-in">
        <button
          v-if="!launched"
          class="absolute transition-transform duration-100 transform hover:scale-110 focus:scale-110 focus:outline-none"
          @click="launched = true"
        >
          <play-icon />
        </button>
      </transition>
    </div>

    <div class="py-4 text-white">
      <p class="text-xl mb-2" :title="`The movie lasts ${formattedRuntime}`">
        ⏱ {{ formattedRuntime }}
      </p>

      <movie-stars :rating="rating" class="mb-2" />

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
import MovieStars from './MovieStars.vue'
import PlayIcon from './PlayIcon.vue'

export default {
  name: 'MovieViewer',
  inheritAttrs: false,
  components: {
    Tag,
    MovieStars,
    PlayIcon
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
    },
    cast: {
      type: Array,
      required: true
    },
    crew: {
      type: Array,
      required: true
    },
    language: {
      type: String,
      required: true
    },
    torrents: {
      type: Array,
      required: true
    },
    subtitles: {
      type: Array,
      required: true
    },
    rating: {
      type: Number,
      required: true
    },
    comments: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      launched: false
    }
  },
  computed: {
    formattedRuntime() {
      const hours = this.runtime / 60
      const minutes = this.runtime % 60

      return `${hours.toFixed(0)}h${minutes.toFixed(0).padStart(2, '0')}`
    }
  }
}
</script>

<style lang="scss" scoped>
.player {
  @apply relative flex items-center justify-center;

  height: 500px;
}
</style>
