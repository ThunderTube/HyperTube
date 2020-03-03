<template functional>
  <button
    class="mx-auto flex justify-center items-center py-2 px-3 rounded transition-colors duration-75 bg-transparent hover:bg-gray-700 text-gray-400 tracking-wide focus:outline-none"
    :class="[data.class, data.staticClass]"
    v-bind="data.props"
    v-on="listeners"
  >
    <slot />
  </button>
</template>

<script>
export default {
  name: 'AppButton'
}
</script>
