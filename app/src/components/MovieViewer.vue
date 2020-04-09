<template>
  <div class="container w-full mx-auto">
    <h2 class="mb-6 text-3xl font-semibold tracking-wider text-white">
      {{ decodedTitle }} ({{ year }})
    </h2>

    <player :id="imdbId" :image="image" :torrents="torrents" />

    <div class="py-4 text-white">
      <p class="mb-2 text-xl" :title="`The movie lasts ${formattedRuntime}`">
        ⏱ {{ formattedRuntime }}
      </p>

      <movie-stars :rating="rating" class="mb-2" />

      <blockquote class="mb-4 text-xl tracking-wide">
        {{ description }}
      </blockquote>

      <tag v-for="genre in genres" :key="genre" big>{{
        $t('genres.' + genre.toLowerCase())
      }}</tag>
    </div>

    <list-dropdown :label="$t('movie.cast')">
      <tag v-for="{ name, character } in cast" :key="name" :title="character">
        {{ name }}
      </tag>
    </list-dropdown>

    <list-dropdown :label="$t('movie.crew')">
      <tag v-for="{ name, job } in crew" :key="name" :title="job">
        {{ name }}
      </tag>
    </list-dropdown>

    <transition name="fade" mode="out-in">
      <app-button
        v-if="showLoadCommentsButton"
        key="button"
        class="mb-6 bg-gray-800"
        @click="showComments = true"
      >
        {{ $t('comments.see') }}
      </app-button>

      <h3
        v-else
        key="text"
        class="mb-6 text-2xl font-semibold tracking-wider text-center text-white"
      >
        {{ $t('comments.title') }}
        <transition
          enter-active-class="transition duration-200 transform"
          leave-active-class="transition duration-200 transform"
          enter-class="-translate-y-4 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-class="translate-y-0 opacity-100"
          leave-to-class="translate-y-4 opacity-0"
          mode="out-in"
        >
          <span :key="commentsCount" class="inline-block"
            >({{ commentsCount }})</span
          >
        </transition>
      </h3>
    </transition>

    <movie-comments-list
      :id="imdbId"
      :show="showComments"
      @loaded="loadedComments"
      @update:comments-count="commentsCount = $event"
    />
  </div>
</template>

<script>
import Tag from './Tag.vue'
import MovieStars from './MovieStars.vue'
import ListDropdown from './ListDropdown.vue'
import Player from './MoviePlayer.vue'
import AppButton from './AppButton.vue'
import MovieCommentsList from './MovieCommentsList.vue'
import { decodeHTMLEntities } from '@/utils.js'

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
    },
    decodedTitle() {
      return decodeHTMLEntities(this.title)
    }
  },
  methods: {
    loadedComments() {
      this.showLoadCommentsButton = false
    }
  }
}
</script>
