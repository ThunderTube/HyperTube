<template>
  <auth-screen
    @clear="resetPassword = false"
    @auth:login="isLoggedIn = true"
    :is-logged-in="isLoggedIn || $route.name === '404'"
    :reset-password="resetPassword"
    :guid="guid"
  />
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

import { getWithExpiry } from '@/utils/localStorage'
import AuthScreen from '@/components/AuthScreen'

const { mapState } = createNamespacedHelpers('auth')

export default {
  name: 'AuthPage',
  components: {
    AuthScreen
  },
  data() {
    return {
      guid: '',
      resetPassword: false
    }
  },
  computed: mapState(['isLoggedIn']),
  created() {
    try {
      const token = getWithExpiry('resetPasswordToken')
      if (token) {
        this.resetPassword = true
        this.guid = token
      }
    } catch (error) {
      console.error(error)
    }
  }
}
</script>
