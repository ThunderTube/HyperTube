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
        >{{ $t('loginscreen.login') }}</div>
        <div
          @click="selectAuthForm('register')"
          class="cursor-pointer w-1/2 h-full flex items-center justify-center"
        >{{ $t('loginscreen.register') }}</div>
      </div>
      <div class="py-4 text-left px-6">
        <form @submit.prevent="submitForm()">
          <div v-if="login.visible">
            <app-input
              v-model="login.form.username"
              :name="$t('loginscreen.id')"
              :placeholder="$t('loginscreen.id_placeholder')"
            />
            <app-input
              v-model="login.form.password"
              :name="$t('loginscreen.password')"
              type="password"
              placeholder="********"
            />
          </div>
          <div v-else-if="register.visible">
            {{ $t('loginscreen.register_form_title') }}
            <app-input v-model="register.form.username" name="username" placeholder="username" />
            <app-input v-model="register.form.email" type="email" name="email" placeholder="email" />
            <app-input v-model="register.form.firstName" name="firstName" placeholder="first name" />
            <app-input v-model="register.form.lastName" name="lastName" placeholder="last name" />
            <app-input
              v-model="register.form.password"
              name="password"
              type="password"
              placeholder="********"
            />
            <!-- <div class="block"> -->
              <!-- <app-input
                ref="file"
                name="file"
                type="file"
              />-->
              <!-- <input type="file" id="file" ref="file" v-on:change="handleFileUpload()" />
            </div> -->
          </div>
          <div v-else-if="passwordForgot.visible">
            <app-input
              v-model="passwordForgot.form.username"
              name="password-forgot"
              placeholder="Login"
            />
          </div>
          <div v-show="login.visible">
            <a
              @click.prevent="selectAuthForm('password-forgot')"
              href="#"
              class="text-blue-600"
            >{{ $t('loginscreen.forgot_password') }}</a>
          </div>
          <div class="flex justify-end py-2">
            <button
              @click.prevent="submitForm"
              class="px-4 bg-blue-900 p-3 text-white hover:bg-gray-100 hover:shadow-xl hover:text-indigo-400 mr-2 uppercase focus:outline-none"
            >{{ formType }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
 import axios from 'axios'
import { mapActions } from 'vuex'
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
          username: '',
          password: ''
        }
      },
      file: '',
      register: {
        visible: false,
        form: {
          username: '',
          email: '',
          lastName: '',
          firstName: '',
          password: '',
        }
      },
      passwordForgot: {
        visible: false,
        form: {
          username: ''
        }
      }
    }
  },
  methods: {
    handleFileUpload(){
    this.file = this.$refs.file.files[0];
  },
    ...mapActions({
      registerUser: "auth/registerUser",
      loginUser: "auth/loginUser"
    }),
    selectAuthForm(formType) {
      this.formType = formType
      this.showAuthForm()
    },
    showAuthForm() {
      if (this.formType === 'login') {
        this.register.visible = false
        this.passwordForgot.visible = false
        this.register.form = {
          username: '',
          password: '',
          email: '',
          lastName: '',
          firstName: '',
        }
        this.passwordForgot.form = {
          username: ''
        }
        this.login.visible = true
      } else if (this.formType === 'register') {
        this.login.visible = false
        this.passwordForgot.visible = false
        this.login.form = {
          username: '',
          password: ''
        }
        this.passwordForgot.form = {
          username: ''
        }
        this.register.visible = true
      } else if (this.formType === 'password-forgot') {
        this.login.visible = false
        this.register.visible = false
        this.login.form = {
          username: '',
          password: ''
        }
        this.register.form = {
          username: '',
          password: '',
          email: '',
          lastName: '',
          firstName: '',
        }
        this.passwordForgot.visible = true
      }
    },
    getRegisterFormData() {
        const formData = new FormData()
        // formData.append("file", this.file)
        formData.append("username", this.register.form.username)
        formData.append("password", this.register.form.password)
        formData.append("email", this.register.form.email)
        formData.append("lastName", this.register.form.lastName)
        formData.append("firstName", this.register.form.email)

        return formData
    },
    // uploadImage(event) {
    //   let data = new FormData();
    //   data.append('file', event.target.files[0]); 
    //   this.file = data
    // },
    async submitForm() {        
        if (this.login.visible) {
          const res = await this.loginUser(this.login.form)
            if (!res.data.success)
                return console.log('login !res.data.success show error message ', res.data)
            // Logged in user path
        } else if (this.register.visible) {
            const res = await this.registerUser(this.register.form)
            if (!res.data.success)
                return console.log('register !res.data.success show error message ', res.data)
            this.formType = 'login'
            this.login.form.username = this.register.form.username
            this.login.form.password = this.register.form.password
            this.showAuthForm()
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