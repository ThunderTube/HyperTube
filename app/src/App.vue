<template>
  <div id="app" class="bg-gray-900 text-white min-h-screen">
    <app-menu />
    <div class="full-width">
        <router-view/>
    </div>
  </div>

</template>

<script>
import AppMenu from '@/components/AppMenu';

export default {
  components: {
    AppMenu
  }
}
</script>
