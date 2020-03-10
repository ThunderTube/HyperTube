<template>
  <ul v-if="show" class="flex flex-wrap justify-center items-center">
    <loading-spinner v-if="loading" class="my-3" />

    <template v-else>
      <div v-if="comments.length > 0" class="grid grid-columns-1 w-full mb-3">
        <movie-comment
          v-for="{ id, ...props } in comments"
          :key="id"
          v-bind="props"
        />
      </div>
      <no-data v-else>{{ $t('comments.error') }}</no-data>

      <form @submit.prevent="sendComment" class="w-full">
        <movies-search-bar-input
          v-model.trim="newComment"
          :placeholder="$t('comments.write')"
        >
          <template #prepend>✏️</template>

          <template #append>
            <button type="submit" :title="t('comments.send')">🍻</button>
          </template>
        </movies-search-bar-input>
      </form>
    </template>
  </ul>
</template>

<script>
import axios from '@/api/axios'

import { resolveAfter } from '@/utils.js'

import LoadingSpinner from './LoadingSpinner.vue'
import NoData from './NoData.vue'
import MoviesSearchBarInput from './MoviesSearchBarInput.vue'
import MovieComment from './MovieComment.vue'

export default {
  name: 'MovieCommentsList',
  components: {
    LoadingSpinner,
    NoData,
    MoviesSearchBarInput,
    MovieComment
  },
  props: {
    id: {
      type: String,
      required: true
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      comments: [],
      newComment: ''
    }
  },
  methods: {
    async loadComments() {
      try {
        this.loading = true

        const { status, data } = await axios(
          `/stream/video/${this.id}/comments`
        )
        if (status !== 200) {
          throw new Error('Incorrect response', e)
        }
        const { comments } = data

        await resolveAfter(1000)

        this.comments = comments
        this.$emit('loaded')
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    sendComment() {
      const comment = this.newComment
      this.newComment = ''

      if (comment.length === 0) return

      const {
        _id: userId,
        profilePicture,
        username
      } = this.$store.state.auth.user

      // TODO: fetch data concerning the user in Vuex Store
      this.comments.push({
        userId,
        comment,
        username,
        profilePicture,
        createdAt: new Date().toISOString()
      })

      axios
        .post(`/stream/video/${this.id}/comment`, {
          comment
        })
        .catch(console.error)
    }
  },
  watch: {
    show(state) {
      if (state === true) {
        this.loadComments()
      }
    },
    comments(comments) {
      this.$emit('update:comments-count', comments.length)
    }
  }
}
</script>
