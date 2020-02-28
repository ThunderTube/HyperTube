<template functional>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="feather feather-play-circle play-icon"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polygon points="10 8 16 12 10 16 10 8"></polygon>
  </svg>
</template>

<script>
export default {
  name: 'PlayIcon'
}
</script>

<style lang="scss" scoped>
.play-icon {
  @apply w-24 h-24 text-gray-200 rounded-full p-2;

  background-color: rgba(0, 0, 0, 0.2);
}
</style>
