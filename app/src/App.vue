<template>
  <div class="bg-gray-900 min-h-screen">
    <transition
      enter-active-class="transition duration-150 transition-opacity"
      leave-active-class="transition duration-150 transition-opacity"
      enter-class="opacity-0"
      enter-to-class="opacity-100"
      leave-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="loading"
        class="absolute w-full h-full flex justify-center items-center bg-gray-900 z-50"
      >
        <atom-spinner :animation-duration="500" :size="120" color="#ffffff" />
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
  </div>
</template>

<script>
import { AtomSpinner } from 'epic-spinners'
import { mapGetters, mapActions, createNamespacedHelpers } from 'vuex'
import AppMenu from '@/components/AppMenu'

import AppSwitchLang from '@/components/AppSwitchLang.vue'

const { mapState } = createNamespacedHelpers('auth')

export default {
  components: {
    AppMenu,
    AtomSpinner,
    AppSwitchLang
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
