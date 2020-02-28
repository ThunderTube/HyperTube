<template>
  <div class="md:flex items-center bg-white rounded-lg p-6">
    <img
      class="h-16 w-16 md:h-24 md:w-24 rounded-full mx-auto md:mx-0 md:mr-6"
      :src="profilePictureSrc"
    />
    <div class="text-center md:text-left">
      <h2 v-if="fullName" class="text-lg">{{ fullName }}</h2>
      <div class="text-purple-500">{{ username }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserProfile',
  props: {
    username: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: false
    },
    lastName: {
      type: String,
      required: false
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
    fullName() {
      if (this.firstName && this.lastName)
        return `${this.firstName} ${this.lastName}`
      else if (this.firstName) return `${this.firstName}`
      else if (this.lastName) return `${this.lastName}`
      else return false
    }
  }
}
</script>
