<template>
  <div
    class="relative flex items-center justify-center"
    :style="{
      height: hasPlayed ? 'auto' : '500px'
    }"
  >
    <video
      ref="player"
      crossorigin="use-credentials"
      :preload="selectedSource !== undefined ? 'auto' : 'none'"
      :poster="poster"
      class="z-0 w-full focus:outline-none"
      :class="{ 'h-full object-cover object-top': !hasPlayed }"
      controls
      @playing="hasPlayed = true"
    >
      <template v-if="selectedSource !== undefined">
        <source :src="selectedSource" :type="videoMimeType" />

        <track
          v-for="{ url, langcode, lang } in subtitles"
          :key="lang"
          :src="formatSubtitleSrc(langcode)"
          :label="lang"
          :srclang="langcode"
        />
      </template>
    </video>

    <transition name="fade" mode="out-in">
      <button
        v-if="!launched"
        class="absolute transition-transform duration-100 transform hover:scale-110 focus:scale-110 focus:outline-none"
        @click="selectedTorrent"
      >
        <play-icon />
      </button>

      <ul
        v-else-if="selectedResolution === null"
        class="absolute inset-0 z-20 flex flex-col items-center justify-center"
        style="background-color: rgba(0, 0, 0, 0.4)"
      >
        <div>
          <li
            v-for="{
              resolution,
              seeds,
              peers,
              text,
              textColor
            } in orderedTorrents"
            :key="resolution"
            class="flex items-center justify-between w-full px-2 py-1 mb-2 bg-white rounded cursor-pointer"
            @click="launch(resolution)"
          >
            <span
              class="inline-block px-2 py-1 mr-1 text-white align-middle bg-gray-500 rounded-full"
              >{{ resolution }}</span
            >
            <span :class="textColor" class="font-medium">{{ text }}</span>
          </li>
        </div>
      </ul>

      <div
        v-else-if="loading"
        class="absolute inset-0 z-20 flex flex-col items-center justify-center"
        style="background-color: rgba(0, 0, 0, 0.4)"
      >
        <loading-spinner />
      </div>
    </transition>
  </div>
</template>

<script>
import axios from '../api/axios'
import PlayIcon from './PlayIcon.vue'
import LoadingSpinner from './LoadingSpinner.vue'

export default {
  name: 'MoviePlayer',
  components: {
    PlayIcon,
    LoadingSpinner
  },
  props: {
    id: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: undefined
    },
    torrents: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      launched: false,
      loading: false,
      selectedResolution: null,
      videoSrc: undefined,
      timer: undefined,
      videoMimeType: undefined,
      selectedSource: undefined,
      hasPlayed: false,
      subtitles: [],

      extraLoadingTimer: null,
      willNeedTranscoding: false
    }
  },
  computed: {
    poster() {
      return `${process.env.VUE_APP_BASE_URL}/stream/poster/${this.id}`
    },
    orderedTorrents() {
      const torrents = [...this.torrents].sort(
        ({ seeds: seedsA, peers: peersA }, { seeds: seedsB, peers: peersB }) =>
          seedsA + peersA - (seedsB + peersB)
      )

      const degrees = [
        {
          text: 'best',
          textColor: 'green-700'
        },
        {
          text: 'good',
          textColor: 'green-400'
        },
        {
          text: 'correct',
          textColor: 'yellow-300'
        }
      ]

      return torrents.map((torrent, index) => {
        let degree = degrees[index]
        if (degree === undefined) {
          degree = {
            text: 'unknown',
            textColor: 'gray-500'
          }
        }

        return {
          ...torrent,
          text: degree.text,
          textColor: `text-${degree.textColor}`
        }
      })
    }
  },
  methods: {
    selectedTorrent() {
      this.launched = true
    },
    async poll() {
      try {
        const { data, status } = await axios(
          `stream/video/status/${this.id}/${this.selectedResolution}`
        )
        if (status !== 200) {
          throw new Error('Bad response')
        }

        if (['FIRST_CHUNKS_LOADED', 'LOADED'].includes(data)) {
          this.selectedSource = `${process.env.VUE_APP_BASE_URL}/stream/video/chunks/${this.id}/${this.selectedResolution}`

          // We need to wait an extra time if the video must be decoded on live
          if (this.willNeedTranscoding) {
            const TIME_BEFORE_LAUNCHING = 15e3 // 15 seconds

            clearTimeout(this.extraLoadingTimer)
            this.extraLoadingTimer = setTimeout(() => {
              this.loading = false
              this.launchVideo()
            }, TIME_BEFORE_LAUNCHING)
          } else {
            this.loading = false
            this.launchVideo()
          }

          clearInterval(this.timer)
        }
      } catch (e) {
        console.error(e)
      }
    },
    async launch(resolution) {
      try {
        this.loading = true
        this.selectedResolution = resolution

        const { data: informations } = await axios(
          `stream/video/download/${this.id}/${resolution}`
        )
        if (!informations) {
          throw new Error('An error occured during the downloading of the film')
        }
        console.log('informations =', informations)
        const { mime, willNeedTranscoding, subtitles } = informations
        this.videoMimeType = mime
        this.willNeedTranscoding = willNeedTranscoding
        this.subtitles = subtitles

        clearInterval(this.timer)
        this.timer = setInterval(() => this.poll(), 2000)
      } catch (e) {
        console.error(e)
      }
    },
    formatSubtitleSrc(langcode) {
      return `${process.env.VUE_APP_BASE_URL}/stream/subtitles/${this.id}-${langcode}.vtt`
    },
    launchVideo() {
      this.$refs.player.play()
    }
  },
  beforeDestroy() {
    clearInterval(this.timer)
    clearTimeout(this.extraLoadingTimer)
  }
}
</script>
