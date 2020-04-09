<template>
  <div class="relative min-h-screen bg-gray-900">
    <transition
      enter-active-class="transition transition-opacity duration-150"
      leave-active-class="transition transition-opacity duration-150"
      enter-class="opacity-0"
      enter-to-class="opacity-100"
      leave-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="loading"
        class="absolute z-50 flex items-center justify-center w-full h-full bg-gray-900"
      >
        <loading-spinner />
      </div>
    </transition>

    <template v-if="isLoggedIn">
      <app-menu />
    </template>

    <app-switch-lang />

    <div class="w-full overflow-hidden">
      <transition name="page" mode="out-in">
        <router-view />
      </transition>
    </div>

    <footer class="absolute bottom-0 right-0 p-1 text-white">
      <div class="block md:hidden">
        TT
      </div>
      <div class="hidden md:block">
        ThunderTube
      </div>
    </footer>
  </div>
</template>

<script>
import { mapGetters, mapActions, createNamespacedHelpers } from 'vuex'

import AppMenu from '@/components/AppMenu'
import AppSwitchLang from '@/components/AppSwitchLang.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const { mapState } = createNamespacedHelpers('auth')

export default {
  components: {
    AppMenu,
    AppSwitchLang,
    LoadingSpinner
  },
  data() {
    return {
      loading: true,
      guid: '',
      resetPassword: false
    }
  },
  created() {
    setTimeout(() => {
      this.loading = false
    }, 1000)
  },
  computed: mapState(['isLoggedIn'])
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
