<template>
  <label class="block w-full sm:w-1/2 flex flex-wrap mt-3">
    <p class="uppercase w-full text-white tracking-wider text-sm mb-1">
      {{ label }}
    </p>

    <select
      :value="value"
      @change="$emit('input', $event.target.value)"
      :name="name"
      class="block appearance-none border bg-gray-800 text-gray-400 rounded px-2 py-2 cursor-pointer w-full transition-colors duration-150 focus:outline-none border-transparent focus:border-gray-200"
    >
      <option v-for="{ text, value } in options" :key="value" :value="value">
        {{ text }}
      </option>
    </select>
  </label>
</template>

<script>
export default {
  name: 'MoviesSearchBarDropdown',
  props: {
    value: {
      type: String,
      default: null
    },
    items: {
      type: Array,
      required: true,
      validator(items) {
        const authorizedTypes = ['number', 'string']

        return items.every(
          ({ text, value }) =>
            authorizedTypes.includes(typeof text) &&
            authorizedTypes.includes(typeof value)
        )
      }
    },
    label: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  computed: {
    options() {
      return [
        {
          text: this.$t('home.search_none'),
          value: null
        },
        ...this.items
      ]
    }
  }
}
</script>
