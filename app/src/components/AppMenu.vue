<template>
  <Slide class="slide" disableOutsideClick>
    <div class="flex flex-col justify-between h-full">
      <div class="flex flex-col">
        <div class="px-4">
          <router-link to="/" class="flex items-center">
            <img
              :src="require('@/assets/img/small-logo.jpg')"
              class="w-12 h-12 rounded-full mr-2"
              alt="ThunderTube logo"
            />

            <h2 class="text-white uppercase text-bold title text-2xl">
              Thundertube
            </h2>
          </router-link>

          <div class="flex flex-col items-stretch mt-5">
            <app-menu-link
              v-for="(props, i) in links"
              :key="i"
              v-bind="props"
            />
          </div>
        </div>
      </div>

      <footer class="border-t border-gray-500">
        <div class="flex items-center py-5 px-3 h-full">
          <img
            :src="profilePictureSrc(getAuthData.profilePicture)"
            :alt="getAuthData.username"
            class="rounded-full w-12 h-12 object-cover"
          />

          <div class="flex flex-col ml-3">
            <p class="text-white text-lg font-medium mb-1">
              {{ getAuthData.username }}
            </p>

            <router-link
              :to="{ name: 'me', params: { lang: $i18n.locale } }"
              class="text-base text-gray-400"
            >
              {{ $t('app-drawer.view-profile') }}
            </router-link>
          </div>
        </div>
      </footer>
    </div>
  </Slide>
</template>

<script>
import { Slide } from 'vue-burger-menu'
import { mapGetters, mapActions } from 'vuex'

import AppMenuLink from './AppMenuLink.vue'
import LogoutIcon from './LogoutIcon.vue'

export default {
  components: {
    Slide,
    LogoutIcon,
    AppMenuLink
  },
  computed: {
    ...mapGetters({
      isLoggedIn: 'auth/isLoggedIn',
      getAuthData: 'auth/getAuthData'
    }),
    links() {
      return [
        {
          link: 'home',
          text: this.$t('app-drawer.home'),
          icon: 'film'
        },
        {
          action: this.logoutUser,
          text: this.$t('app-drawer.logout'),
          color: 'red-500',
          icon: 'log-out'
        }
      ]
    }
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

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Bebas+Neue&display=swap');

.slide.slide {
  .bm-burger-button {
    position: fixed;
    left: 36px;
    top: 36px;
    width: 32px;
    height: 28px;
    z-index: 999;
    cursor: pointer;
  }

  .bm-burger-bars {
    @apply bg-gray-600;
  }

  .line-style {
    position: absolute;
    height: 20%;
    left: 0;
    right: 0;
  }

  .cross-style {
    position: absolute;
    top: 12px;
    right: 2px;
    cursor: pointer;
  }

  .bm-cross {
    background: #bdc3c7;
  }

  .bm-cross-button {
    height: 24px;
    width: 24px;
  }

  .bm-menu {
    @apply flex justify-center bg-gray-800 h-full w-0 fixed top-0 left-0 overflow-x-hidden pt-4 transition-all duration-300;

    z-index: 1000;
  }

  .bm-overlay {
    background: rgba(0, 0, 0, 0.3);
  }

  .bm-item-list {
    @apply h-full w-full flex flex-col mx-0;

    color: #b8b7ad;
    font-size: 20px;
  }

  .bm-last {
    @apply justify-between;
  }

  .bm-item-list > * {
    padding: 0;
  }
}

.title {
  font-family: 'Bebas Neue', cursive;
}
</style>
