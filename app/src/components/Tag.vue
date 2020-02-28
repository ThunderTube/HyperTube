<template functional>
  <span
    v-bind="data.attrs"
    class="inline-block rounded-full bg-gray-700 text-gray-200 font-semibold tag"
    :class="[
      props.big !== undefined
        ? 'px-3 py-2 mb-2 mr-2 text-base'
        : 'px-2 py-1 mb-1 mr-1 text-sm'
    ]"
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
