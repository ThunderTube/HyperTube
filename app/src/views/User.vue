<template>
  <div class="flex justify-center pt-20">
    <transition name="fade" mode="out-in">
      <loading-spinner v-if="loading" />

      <user-profile v-else-if="user" v-bind="user" />

      <no-data v-else>
        {{ $t('user.no-data') }}
      </no-data>
    </transition>
  </div>
</template>

<script>
import axios from '@/api/axios'

import UserProfile from '@/components/UserProfile.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import NoData from '@/components/NoData.vue'

export default {
  components: {
    UserProfile,
    LoadingSpinner,
    NoData
  },
  data() {
    return {
      user: null,
      loading: false
    }
  },
  methods: {
    fetch() {
      this.loading = true
      axios
        .get(`/auth/user/${this.id}`)
        .then(({ data: user }) => {
          this.user = user
        })
        .catch((e) => {
          console.error(e)
          this.user = null
        })
        .finally(() => {
          this.loading = false
        })
    }
  },
  created() {
    this.fetch()
  },
  computed: {
    id() {
      return this.$route.params.id
    }
  }
}
</script>

<style lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
