<template>
  <div class="my-3">
    <label
      :for="name"
      :class="[error ? 'text-red-600' : 'text-gray-900']"
      class="capitalize font-bold"
    >
      {{ name }}
    </label>
    <input
      :class="[error ? 'border-red-600' : 'border-gray-300']"
      class="bg-white focus:outline-none focus:shadow-outline border py-2 px-4 block w-full appearance-none leading-normal"
      @input="$emit('input', $event.target.value)"
      :type="type"
      :name="name"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :id="name"
      :value="value"
      @focus="$emit('focus')"
      @blur="$emit('blur')"
    />
    <p v-if="error" class="text-sm text-red-600">{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'AppInput',
  props: {
    type: {
      type: String,
      required: false,
      default: 'text'
    },
    name: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      required: false,
      default: ''
    },
    value: {
      type: String,
      required: false,
      default: ''
    },
    error: {
      type: Boolean,
      required: false,
      default: false
    },
    message: {
      type: String || Array,
      required: false,
      default: ''
    },
    autocomplete: {
      type: String,
      default: undefined
    }
  }
}
</script>
