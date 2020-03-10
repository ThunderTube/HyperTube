<template>
  <div id="app" class="bg-gray-900 min-h-screen">
    <div v-if="loading" class="flex justify-center items-center min-h-screen">
      <atom-spinner :animation-duration="500" :size="120" color="#ffffff" />
    </div>

    <template v-else>
      <auth-screen
        @clear="resetPassword = false"
        @auth:login="isLoggedIn = true"
        :is-logged-in="isLoggedIn || $route.name === '404'"
        :reset-password="resetPassword"
        :guid="guid"
      />
      <template v-if="isLoggedIn">
        <app-menu />
      </template>

      <app-switch-lang />

      <div
        v-if="isLoggedIn || (!isLoggedIn && $route.name === '404')"
        class="w-full overflow-hidden"
      >
        <transition name="page" mode="out-in">
          <router-view />
        </transition>
      </div>
    </template>
  </div>
</template>

<script>
import { AtomSpinner } from 'epic-spinners'
import { mapGetters, mapActions } from 'vuex'
import AppMenu from '@/components/AppMenu'
import AuthScreen from '@/components/AuthScreen'
import AppSwitchLang from '@/components/AppSwitchLang.vue'
import { getWithExpiry } from './utils/localStorage'

export default {
  components: {
    AppMenu,
    AuthScreen,
    AtomSpinner,
    AppSwitchLang
  },
  data() {
    return {
      loading: true,
      hasCookie: false,
      guid: '',
      resetPassword: false
    }
  },
  async created() {
    try {
      const token = getWithExpiry('resetPasswordToken')
      if (token) {
        this.resetPassword = true
        this.guid = token
      }
      const res = await this.me()
      if (!res) {
        // this.$toast.open({ message: 'Please login or register an account', type: 'info'})
        return (this.loading = false)
      }
      if (res.data.success) this.hasCookie = true

      setTimeout(() => {
        this.loading = false
      }, 1000)
    } catch (error) {
      console.log('app created ', error.message)
    }
  },
  methods: {
    ...mapActions({
      me: 'auth/getCurrentUser'
    })
  },
  computed: {
    ...mapGetters({
      isLoggedIn: 'auth/isLoggedIn',
      getAuthData: 'auth/getAuthData'
    })
  }
}
</script>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity, transform 0.4s ease-in;
}

.page-enter,
.page-leave-to {
  opacity: 0;
  transform: scale(1.1);
}
</style>
