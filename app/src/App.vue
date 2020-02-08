<template>
  <div id="app" class="bg-gray-900 min-h-screen">
    <app-menu />
    <div class="w-full">

      <transition name="page" mode="out-in">
        <router-view />
      </transition>
      <t-modal ref="modal">hello world</t-modal>
    </div>
  </div>
</template>

<script>
import AppMenu from '@/components/AppMenu'

export default {
  components: {
    AppMenu,
  },
  data() {
    return {
      model:''
    }
  },
  mounted() {
    this.$refs.modal.show()
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
