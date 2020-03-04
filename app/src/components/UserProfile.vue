<template>
<div class="container w-full md:w-1/2 mt-20 box-border grid grid-cols-1 md:grid-cols-2 rounded p-10 bg-gray-800">
  <div>
    <div class="mx-auto max-w-xs">
      <img class="rounded" :src="profilePictureSrc" alt="">
    </div>
  </div>
  <div>
    <div class="text-white">
      <h2 class="text-center font-semibold text-3xl tracking-wider mb-6">
        {{ $t('profile.title') }} {{username}}
      </h2>
      <div class="mx-5">
        <p>{{ $t('profile.username') }}{{username}}</p>
        <p>{{ $t('profile.firstname') }}{{firstName}}</p>
        <p>{{ $t('profile.lastname') }}{{lastName}}</p>
      </div>
    </div>
  </div>

</div>
</template>

<script>
export default {
  name: 'UserProfile',
  inheritAttrs: false,
  components: {},
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
      required: false
    }
  },
    computed: {

    profilePictureSrc() {
      const API_ROOT = new URL(process.env.VUE_APP_BASE_URL).origin
      return `${API_ROOT}/uploads/${this.profilePicture}`
    },
    }
}
</script>
