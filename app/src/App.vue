<template>
  <div id="app" class="bg-gray-900 min-h-screen">
    <auth-screen @auth:login="isLoggedIn = true" :is-logged-in="isLoggedIn" />
    <div v-show="isLoggedIn">
      <app-menu />
      <app-switch-lang />
      <div class="w-full">
        <transition name="page" mode="out-in">
          <router-view />
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import AppMenu from '@/components/AppMenu'
import AuthScreen from '@/components/AuthScreen'
import AppSwitchLang from '@/components/AppSwitchLang.vue'

export default {
  components: {
    AppMenu,
    AuthScreen,
    AppSwitchLang
  },
  computed: {
    isLoggedIn: {
      get() {
        return this.$store.getters['auth/isLoggedIn']
      },
      set() {}
    }
  }
}
</script>

<style lang="css" scoped>
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
