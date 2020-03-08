<template>
  <Slide disableOutsideClick>
    <router-link :to="{ name: 'me'}" class="flex items-center">
      <div>
        <img
          :src="profilePictureSrc(getAuthData.profilePicture)"
          :alt="getAuthData.username"
          class="rounded-full w-12 h-12"
        />
      </div>
      <div class="text-gray-500 ml-6 hover:text-gray-300">{{ getAuthData.username }}</div>
    </router-link>

    <button @click="logoutUser" class="bg-teal-600 hover:bg-teal-700 hover:shadow-lg rounded px-2 py-1 text-white mb-10">
        Logout
    </button>
    
    <router-link to="/">
      <svg fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
        <path
          class="primary"
          d="M9 22H5a1 1 0 0 1-1-1V11l8-8 8 8v10a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v4a1 1 0 0 1-1 1zm3-9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
        />
        <path
          class="secondary"
          d="M12.01 4.42l-8.3 8.3a1 1 0 1 1-1.42-1.41l9.02-9.02a1 1 0 0 1 1.41 0l8.99 9.02a1 1 0 0 1-1.42 1.41l-8.28-8.3z"
        />
      </svg>
      <span>{{ $t('navbar.home') }}</span>
    </router-link>
    <div class="ml-8">
      <h2 class="text-white font-bold uppercase font-serif text-2xl">
        Hypertube
      </h2>
    </div>
  </Slide>
</template>

<script>
import { Slide } from 'vue-burger-menu'
import { mapGetters, mapActions } from 'vuex'
export default {
  components: {
    Slide
  },
  computed: {
    ...mapGetters({
      isLoggedIn: 'auth/isLoggedIn',
      getAuthData: 'auth/getAuthData'
    }),

  },
  methods: {
    profilePictureSrc(image) {
      const API_ROOT = new URL(process.env.VUE_APP_BASE_URL).origin
      return `${API_ROOT}/uploads/${image}`
    },
    ...mapActions({
      logoutCurrentUser: 'auth/logoutCurrentUser'
    }),
    logoutUser() {
      this.logoutCurrentUser()
      this.$router.push('/')
    }
  }
}
</script>
