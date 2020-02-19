<template>
  <div
    v-if="!isLoggedIn"
    class="z-50 modal modal-active fixed w-full h-full top-0 left-0 flex items-center justify-center bg-black"
  >
    <div class="modal-overlay absolute w-full h-full bg-gray-900 opacity-75"></div>

    <div class="modal-container bg-white w-11/12 md:max-w-md mx-auto z-50 overflow-y-auto">
      <div class="w-full h-12 flex items-center justify-center text-white shadow-xl bg-gray-800">
        <div
          @click="selectAuthForm('login')"
          class="cursor-pointer w-1/2 h-full flex items-center justify-center"
        >Login</div>
        <div
          @click="selectAuthForm('register')"
          class="cursor-pointer w-1/2 h-full flex items-center justify-center"
        >Register</div>
      </div>
      <div class="py-4 text-left px-6">
        <form @submit.prevent="submitForm()">
          <div v-if="login.visible">
            <app-input v-model="login.form.login" name="login" placeholder="login or email" />
            <app-input
              v-model="login.form.password"
              name="password"
              type="password"
              placeholder="********"
            />
          </div>
          <div v-else-if="register.visible">
            <app-input v-model="register.form.login" name="username" placeholder="username" />
            <app-input v-model="register.form.email" type="email" name="email" placeholder="email" />
            <app-input v-model="register.form.firstName" name="firstName" placeholder="first name" />
            <app-input v-model="register.form.lastName" name="lastName" placeholder="last name" />
            <app-input
              v-model="register.form.password"
              name="password"
              type="password"
              placeholder="********"
            />
          </div>
          <div v-else-if="passwordForgot.visible">
            <app-input
              v-model="passwordForgot.form.login"
              name="password-forgot"
              placeholder="Login"
            />
          </div>
          <div v-show="login.visible">
            <a
              @click.prevent="selectAuthForm('password-forgot')"
              href="#"
              class="text-blue-600"
            >Password forgot?</a>
          </div>
          <div class="flex justify-end py-2">
            <button
              @click="$emit('auth:login', true)"
              class="px-4 bg-blue-900 p-3 text-white hover:bg-gray-100 hover:shadow-xl hover:text-indigo-400 mr-2 uppercase focus:outline-none"
            >{{ formType }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import AppInput from '../components/AppInput'

export default {
  name: 'AuthScreen',
  components: {
    AppInput
  },
  props: {
    isLoggedIn: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      formType: 'login',
      login: {
        visible: true,
        form: {
          login: '',
          password: ''
        }
      },
      register: {
        visible: false,
        form: {
          login: '',
          email: '',
          lastName: '',
          firstName: '',
          password: '',
        }
      },
      passwordForgot: {
        visible: false,
        form: {
          login: ''
        }
      }
    }
  },
  methods: {
    selectAuthForm(formType) {
      this.formType = formType
      this.showAuthForm()
    },
    showAuthForm() {
      if (this.formType === 'login') {
        this.register.visible = false
        this.passwordForgot.visible = false
        this.register.form = {
          login: '',
          password: '',
          email: '',
          lastName: '',
          firstName: '',
          password: '',
        }
        this.passwordForgot.form = {
          login: ''
        }
        this.login.visible = true
      } else if (this.formType === 'register') {
        this.login.visible = false
        this.passwordForgot.visible = false
        this.login.form = {
          login: '',
          password: ''
        }
        this.passwordForgot.form = {
          login: ''
        }
        this.register.visible = true
      } else if (this.formType === 'password-forgot') {
        this.login.visible = false
        this.register.visible = false
        this.login.form = {
          login: '',
          password: ''
        }
        this.register.form = {
          login: '',
          password: '',
          email: '',
          lastName: '',
          firstName: '',
          password: '',
        }
        this.passwordForgot.visible = true
      }
    },
    submitForm() {
      if (this.login.visible) {
        // submit login form
        console.log('login')
      } else if (this.register.visible) {
        // submit register form
        console.log('register')
      } else if (this.passwordForgot.visible) {
        // submit register form
        console.log('password forgot')
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