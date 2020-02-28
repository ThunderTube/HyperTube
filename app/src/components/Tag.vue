<template functional>
  <span
    class="inline-block rounded-full px-2 py-1 mb-1 mr-1 bg-gray-700 text-gray-200 text-sm font-semibold tag"
  >
    <slot />
  </span>
</template>

<script>
export default {
  name: 'Tag'
}
</script>

<script lang="scss" scoped>
.tag {
  &::before {
    @apply mr-1;

    content: '#';
  }
}
</script>
