<template>
  <label
    class="w-full bg-gray-100 px-4 py-2 flex bg-gray-800 text-gray-400 rounded border border-transparent transition-colors duration-150"
    :class="{
      'border-gray-200': hasFocus
    }"
  >
    <span>🔍</span>

    <input
      :value="value"
      :placeholder="placeholder"
      @input="$emit('input', $event.target.value)"
      @focus="hasFocus = true"
      @blur="hasFocus = false"
      class="w-full bg-transparent focus:outline-none ml-3"
    />
  </label>
</template>

<script>
export default {
  name: 'MoviesSearchBarInput',
  props: {
    value: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      hasFocus: false
    }
  }
}
</script>
