<template>
  <div class="flex justify-center pt-20">
    <transition name="fade" mode="out-in">
      <loading-spinner v-if="loading" />

      <user-profile v-else-if="user !== null" v-bind="user" />
    </transition>
  </div>
</template>

<script>
import axios from '@/api/axios'
import UserProfile from '@/components/UserProfile.vue'
export default {
  components: {
    UserProfile
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
          return resolveAfter(1000)
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
