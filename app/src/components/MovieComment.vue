<template>
  <li
    class="flex items-center bg-gray-800 text-gray-200 px-3 py-2 border-b last:border-b-0 border-gray-700 first:rounded-t last:rounded-b"
  >
    <img
      class="w-12 h-12 rounded-full object-cover mr-2"
      :src="profilePictureSrc"
      :alt="profilePictureAlt"
    />

    <div class="flex flex-col flex-grow items-start">
      <router-link
        :to="`/en/user/${userId}`"
        class="inline-block text-gray-300 text-semibold mb-2"
      >
        {{ username }}
      </router-link>

      <p>{{ comment }}</p>
    </div>
  </li>
</template>

<script>
export default {
  name: 'MovieComment',
  props: {
    userId: {
      type: String,
      required: true
    },
    comment: {
      type: String,
      required: true
    },
    createdAt: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    profilePicture: {
      type: String,
      required: true
    }
  },
  computed: {
    profilePictureSrc() {
      const API_ROOT = new URL(process.env.VUE_APP_BASE_URL).origin

      return `${API_ROOT}/uploads/${this.profilePicture}`
    },
    profilePictureAlt() {
      return `${this.username} username`
    }
  }
}
</script>
