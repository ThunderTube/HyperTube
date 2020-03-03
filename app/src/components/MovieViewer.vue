<template>
  <div class="w-full container mx-auto">
    <h2 class="text-white font-semibold text-3xl tracking-wider mb-6">{{ title }} ({{ year }})</h2>

    <player :id="imdbId" :image="image" :torrents="torrents" :subtitles="subtitles" />

    <div class="py-4 text-white">
      <p
        class="text-xl mb-2"
        :title="`The movie lasts ${formattedRuntime}`"
      >⏱ {{ formattedRuntime }}</p>

      <movie-stars :rating="rating" class="mb-2" />

      <blockquote class="text-xl tracking-wide mb-4">{{ description }}</blockquote>

      <tag v-for="genre in genres" :key="genre" big>{{ genre }}</tag>
    </div>

    <list-dropdown :label="$t('movie.cast')">
      <tag v-for="{ name, character } in cast" :key="name" :title="character">{{ name }}</tag>
    </list-dropdown>

    <list-dropdown :label="$t('movie.crew')">
      <tag v-for="{ name, job } in crew" :key="name" :title="job">{{ name }}</tag>
    </list-dropdown>

    <transition name="fade" mode="out-in">
      <app-button
        v-if="showLoadCommentsButton"
        key="button"
        class="bg-gray-800 mb-6"
        @click="showComments = true"
      >See comments</app-button>

      <h3
        v-else
        key="text"
        class="text-white font-semibold text-2xl tracking-wider mb-6 text-center"
      >Comments ({{ commentsCount }})</h3>
    </transition>

    <movie-comments-list :id="imdbId" :show="showComments" @loaded="loadedComments" />
  </div>
</template>

<script>
import Tag from './Tag.vue'
import MovieStars from './MovieStars.vue'
import ListDropdown from './ListDropdown.vue'
import Player from './MoviePlayer.vue'
import AppButton from './AppButton.vue'
import MovieCommentsList from './MovieCommentsList.vue'

export default {
  name: 'MovieViewer',
  inheritAttrs: false,
  components: {
    Tag,
    MovieStars,
    ListDropdown,
    Player,
    AppButton,
    MovieCommentsList
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
      launched: false,
      showComments: false,
      showLoadCommentsButton: true,
      commentsCount: 0
    }
  },
  computed: {
    formattedRuntime() {
      const hours = this.runtime / 60
      const minutes = this.runtime % 60

      return `${hours.toFixed(0)}h${minutes.toFixed(0).padStart(2, '0')}`
    }
  },
  methods: {
    loadedComments(commentsCount) {
      this.showLoadCommentsButton = false
      this.commentsCount = commentsCount
    }
  }
}
</script>
