<template>
  <Slide disableOutsideClick>
    <div class="ml-8" style="margin-left: 6px;">
      <router-link :to="`/${$i18n.locale}/`">
        <h2
          class="text-white font-bold uppercase font-serif text-2xl"
          style="margin-top: -30px; margin-left: -4px;"
        >
          Thundertube
        </h2>
      </router-link>
    </div>
    <router-link :to="`/${$i18n.locale}/`">
      <img
        src="/favicon.ico"
        style="width: 189px; margin-left: 12px; margin-top: -16px; border-radius: 28px;"
      />
    </router-link>
    <router-link
      :to="{ name: 'me', lang: $i18n.locale }"
      class="flex items-center"
    >
      <div>
        <img
          :src="profilePictureSrc(getAuthData.profilePicture)"
          :alt="getAuthData.username"
          class="rounded-full w-12 h-12"
        />
      </div>
      <div class="text-gray-500 ml-6 hover:text-gray-300">
        {{ getAuthData.username }}
      </div>
    </router-link>

    <button
      @click="logoutUser"
      class="bg-teal-600 hover:bg-teal-700 hover:shadow-lg rounded px-2 py-1 text-white mb-10"
      style="display: flex; margin: auto; border: 2px solid #319795; color: #319795; background-color: #2d3648;      bottom: 20px;
    margin-left: 52px;   position: absolute;
    "
    >
      <span style="margin-right: 8px;  color: #319795;">
        {{ $t('navbar.logout') }}
      </span>
      <logout-icon class="w-8" />
    </button>
  </Slide>
</template>

<script>
import { Slide } from 'vue-burger-menu'
import { mapGetters, mapActions } from 'vuex'

import LogoutIcon from './LogoutIcon.vue'

export default {
  components: {
    Slide,
    LogoutIcon
  },
  computed: {
    ...mapGetters({
      isLoggedIn: 'auth/isLoggedIn',
      getAuthData: 'auth/getAuthData'
    })
  },
  methods: {
    profilePictureSrc(image) {
      const API_ROOT = new URL(process.env.VUE_APP_BASE_URL).origin
      return `${API_ROOT}/uploads/${image}`
    },
    ...mapActions({
      logoutCurrentUser: 'auth/logoutCurrentUser'
    }),
    async logoutUser() {
      const { locale } = this.$i18n

      await this.logoutCurrentUser()

      this.$router
        .replace({ name: 'auth', params: { lang: locale } })
        .catch(() => {})
    }
  }
}
</script>
