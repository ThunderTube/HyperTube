<template>
  <label class="block w-full sm:w-1/2 flex flex-wrap mt-3">
    <p class="uppercase w-full text-white tracking-wider text-sm mb-1">
      {{ label }}
    </p>

    <div class="relative w-full">
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
      <div
        class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-600"
      >
        <svg
          class="fill-current h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path
            d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
          />
        </svg>
      </div>
    </div>
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
