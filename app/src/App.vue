<template>
  <div id="app" class="bg-gray-900 min-h-screen">
    <auth-modal />
    <div v-show="isLoggedIn" >
      <app-menu />
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
import AuthModal from '@/components/AuthModal'

export default {
  components: {
    AppMenu,
    AuthModal
  },
  data() {
    return {
      isLoggedIn: false
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
