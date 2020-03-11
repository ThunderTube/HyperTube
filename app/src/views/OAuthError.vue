<template>
  <div class="pt-20">
    <p class="text-gray-300 text-2xl text-center">
      {{ $t(`oauth-errors.${error}`) }}
    </p>

    <div class="flex justify-center items-center mt-4">
      <router-link
        :to="{ name: 'auth', params: { lang: $i18n.locale } }"
        class="block px-2 py-1 bg-gray-800 text-gray-100 rounded text-xl"
      >
        {{ $t('oauth-errors.redirect-button') }}
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OAuthError',
  computed: {
    error() {
      return this.$route.query.error
    }
  }
}
</script>
