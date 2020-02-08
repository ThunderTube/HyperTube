<template>
<div class="my-3">
    <label :for="name" class="capitalize font-bold">
            {{ name }}
    </label>
    <input
        class="bg-white focus:outline-none focus:shadow-outline border border-gray-300 py-2 px-4 block w-full appearance-none leading-normal"
        @input="$emit('input', $event.target.value)"
        :type="type"
        :name="name"
        :placeholder="placeholder"
        :id="name"
        :value="value"
        @focus="$emit('focus')"
        @blur="$emit('blur')"
    >
</div>
</template>

<script>
export default {
    name: "AppInput",
    props: {
        type: {
            type: String,
            required: false,
            default: 'text'
        },
        name: {
            type: String,
            required: true,
        },
        placeholder: {
            type: String,
            required: false,
            default: ""
        },
        value: {
            type: String,
            required: true
        }
    }
}
</script>