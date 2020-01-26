<template>
  <div id="app" class="bg-gray-900 text-white min-h-screen">
    <app-menu />
    <div class="w-full">
      <transition name="page" mode="out-in">
        <router-view />
      </transition>
    </div>
  </div>
</template>

<script>
import AppMenu from "@/components/AppMenu";

export default {
  components: {
    AppMenu
  }
};
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
