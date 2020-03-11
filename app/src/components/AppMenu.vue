<template>
  <Slide class="slide disableOutsideClick">
    <div class="rounded-full logo w-40 h-40">
      <router-link :to="`/${$i18n.locale}/`"> </router-link>
    </div>
    <div class="ml-8" style="margin-left: 6px;">
      <router-link to="/">
        <h2 class="text-white uppercase text-bold title text-2xl">
          Thundertube
        </h2>
      </router-link>
    </div>
    <router-link
      :to="{ name: 'me', params: { lang: $i18n.locale } }"
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
      style="border: 2px solid #319795; color: #319795; background-color: #2d3648;
    "
    >
      <span style="color: #319795;">{{ $t('navbar.logout') }}</span>
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

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Bebas+Neue&display=swap');
.slide.slide {
  .bm-burger-button {
    position: fixed;
    width: 36px;
    height: 30px;
    left: 36px;
    top: 36px;
    cursor: pointer;
  }

  .bm-burger-bars {
    background-color: #373a47;
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
    @apply flex items-stretch items-center;

    height: 100%; /* 100% Full-height */
    width: 0; /* 0 width - change this with JavaScript */
    position: fixed; /* Stay in place */
    z-index: 1000; /* Stay on top */
    top: 0;
    left: 0;
    overflow-x: hidden; /* Disable horizontal scroll */
    padding-top: 60px; /* Place content 60px from the top */
    transition: 0.5s; /*0.5 second transition effect to slide in the sidenav*/
  }

  .bm-overlay {
    background: rgba(0, 0, 0, 0.3);
  }

  .bm-item-list {
    @apply h-full flex flex-col items-stretch items-center;

    color: #b8b7ad;
    margin-left: 10%;
    font-size: 20px;
  }

  .bm-last {
    @apply justify-between;
  }

  .bm-item-list > * {
    display: flex;
    text-decoration: none;
    padding: 0.7em;
  }

  .bm-item-list > * > span {
    margin-left: 10px;
    font-weight: 700;
    color: white;
  }
}

.logo {
  background-image: url('/favicon.ico');
  background-size: cover;
}

.title {
  font-family: 'Bebas Neue', cursive;
}
</style>
