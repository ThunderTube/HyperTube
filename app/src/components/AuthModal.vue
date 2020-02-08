<template>
  <div
    class="z-50 modal modal-active fixed w-full h-full top-0 left-0 flex items-center justify-center bg-black"
  >
    <div class="modal-overlay absolute w-full h-full bg-gray-900 opacity-50"></div>
    <div
      class="modal-container bg-white w-11/12 md:max-w-md mx-auto rounded-lg z-50 overflow-y-auto"
    >
      <div class="w-full h-12 flex items-center justify-center text-white shadow-xl bg-gray-800">
        <div
          @click="getAuthForm('login')"
          class="w-1/2 h-full flex items-center justify-center"
        >Login</div>
        <div
          @click="getAuthForm('register')"
          class="w-1/2 h-full flex items-center justify-center"
        >Register</div>
      </div>
      <div class="modal-content py-4 text-left px-6">
        <div class="flex justify-between items-center pb-3">
          <!--  <p class="text-2xl font-bold capitalize">{{ formType }}</p> -->
        </div>
        <div v-if="login">
            <app-input v-model="test_login" name="login" placeholder="username or email"/>
            <app-input v-model="test_register" name="password" type="password"  placeholder="********"/>
        </div>
        <div v-else-if="register">
            <app-input v-model="test_login" name="login" placeholder="username or email"/>
            <app-input v-model="test_login" name="login" placeholder="username or email"/>            <app-input v-model="test_login" name="login" placeholder="username or email"/>
            <app-input v-model="test_register" name="password" type="password"  placeholder="********"/>
        </div>
        <div class="flex justify-end py-2">
          <button
            class="px-4 bg-blue-900 p-3 rounded-lg text-white hover:bg-gray-100 hover:shadow-xl hover:text-indigo-400 mr-2 uppercase focus:outline-none"
          >{{ formType }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AppInput from "../components/AppInput"

export default {
  name: 'AuthModal',
  components: {
      AppInput
  },
  data() {
    return {
      test_login: "",
      test_register: "",
      formType: 'login',
      login: true,
      register: false
    }
  },
  methods: {
    getAuthForm(formType) {
      this.formType = formType
      this.showAuthForm(this.formType)
    },
    showAuthForm(formType) {
      if (formType === 'login') {
        this.register = false
        this.login = true
      } else if (formType === 'register') {
        this.login = false
        this.register = true
      }
    }
  }
}
</script>

<style scoped>
.modal {
  transition: opacity 0.25s ease;
}
.modal-active {
  overflow-x: hidden;
  overflow-y: visible !important;
}
</style>