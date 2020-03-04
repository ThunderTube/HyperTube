<template>
  <div class="w-full container mx-auto">
    <h2 class="text-white font-semibold text-3xl tracking-wider mb-6">
      {{ username }} ({{ firstName }})
    </h2>
  </div>
</template>

<script>
export default {
  name: 'UserProfile',
  inheritAttrs: false,
  components: {}
}
</script>
