<template>
  <div class="mb-2">
    <button
      @click="show = !show"
      class="text-gray-200 font-semibold tracking-wide uppercase focus:outline-none"
    >
      <span
        class="inline-block transform origin-center transition-transform duration-300 mr-2"
        :class="{ '-rotate-90': !show }"
        >🔽️</span
      >

      {{ label }}
    </button>

    <div class="mt-3">
      <slot v-if="show" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ListDropdown',
  props: {
    label: {
      type: String,
      required: true
    },
    directlyOpen: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      show: this.directlyOpen
    }
  }
}
</script>
