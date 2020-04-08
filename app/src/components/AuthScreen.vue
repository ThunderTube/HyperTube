<template>
  <div
    v-if="!isLoggedIn"
    class="relative top-0 left-0 flex items-center justify-center w-full h-full min-h-screen bg-black bg-gray-900 modal modal-active"
  >
    <div class="w-11/12 mx-auto my-3 bg-white modal-container md:max-w-md">
      <div
        class="flex items-center justify-center w-full h-12 text-white bg-gray-800 shadow-xl"
      >
        <div
          @click="selectAuthForm('login')"
          class="flex items-center justify-center w-1/2 h-full cursor-pointer"
          :class="{ 'bg-gray-700': formType === 'login' }"
        >
          {{ $t('loginscreen.login') }}
        </div>
        <div
          @click="selectAuthForm('register')"
          class="flex items-center justify-center w-1/2 h-full cursor-pointer"
          :class="{ 'bg-gray-700': formType === 'register' }"
        >
          {{ $t('loginscreen.register') }}
        </div>
      </div>
      <div class="px-6 py-4 text-left">
        <form>
          <div v-if="login.visible">
            <app-input
              v-model.trim="login.form.username"
              :name="$t('loginscreen.id')"
              :placeholder="$t('loginscreen.id_placeholder')"
              autocomplete="username"
            />
            <app-input
              v-model="login.form.password"
              :name="$t('loginscreen.password')"
              type="password"
              placeholder="********"
              autocomplete="current-password"
            />
          </div>
          <div v-else-if="register.visible">
            <!-- {{ $t('loginscreen.register_form_title') }} -->
            <app-input
              v-model.trim="register.form.username"
              :name="$t('registerscreen.id_placeholder')"
              :placeholder="$t('registerscreen.id_placeholder')"
              autocomplete="username"
            />
            <app-input
              v-model.trim="register.form.email"
              type="email"
              :name="$t('registerscreen.email')"
              :placeholder="$t('registerscreen.email')"
              autocomplete="email"
            />
            <app-input
              v-model.trim="register.form.firstName"
              :name="$t('registerscreen.firstName')"
              :placeholder="$t('registerscreen.firstName')"
              autocomplete="given-name"
            />
            <app-input
              v-model.trim="register.form.lastName"
              :name="$t('registerscreen.lastName')"
              :placeholder="$t('registerscreen.lastName')"
              autocomplete="family-name"
            />
            <app-input
              v-model="register.form.password"
              :name="$t('registerscreen.password')"
              type="password"
              placeholder="********"
              autocomplete="new-password"
            />
            <div class="block">
              <!-- <app-input ref="file" name="file" type="file" /> -->
              <input
                type="file"
                id="file"
                ref="file"
                accept="image/*"
                @change="handleFileUpload()"
              />
            </div>
          </div>
          <div v-else-if="passwordForgot.visible">
            <app-input
              v-model.trim="passwordForgot.form.username"
              :name="$t('loginscreen.forgot_password')"
              :placeholder="$t('loginscreen.id')"
            />
          </div>
          <div v-else-if="resetPassword">
            <app-input
              v-model.trim="passwordReset.form.username"
              :name="$t('loginscreen.id')"
              :placeholder="$t('loginscreen.id_placeholder')"
              autocomplete="username"
            />
            <app-input
              v-model="passwordReset.form.password"
              :name="$t('loginscreen.password')"
              type="password"
              placeholder="********"
              autocomplete="new-password"
            />
          </div>
          <div v-show="login.visible">
            <a
              @click.prevent="selectAuthForm('password-forgot')"
              href="#"
              class="text-blue-600"
              >{{ $t('loginscreen.forgot_password') }}</a
            >
          </div>
          <div v-show="resetPassword && login.visible" class="block">
            <a
              @click.prevent="selectAuthForm('reset-password')"
              href="#"
              class="text-blue-600"
              >Reset Password</a
            >
          </div>
          <div
            v-if="login.visible || register.visible"
            class="flex flex-wrap justify-between my-8"
          >
            <div>
              <a
                class="flex items-center p-2 transition-colors duration-150 rounded-full hover:bg-gray-200"
                href="http://localhost:8080/v1/auth/42"
              >
                <forty-two-icon class="w-8 h-8 fill-current" />
              </a>
            </div>
            <div>
              <a
                class="flex items-center p-2 transition-colors duration-150 rounded-full hover:bg-gray-200"
                href="http://localhost:8080/v1/auth/google"
              >
                <google-icon class="w-8 h-8 fill-current" />
              </a>
            </div>
            <div>
              <a
                class="flex items-center p-2 transition-colors duration-150 rounded-full hover:bg-gray-200"
                href="http://localhost:8080/v1/auth/github"
              >
                <github-icon
                  class="w-8 h-8 fill-current"
                  style="color: #1e2327"
                />
              </a>
            </div>
            <div>
              <a
                class="flex items-center p-2 transition-colors duration-150 rounded-full hover:bg-gray-200"
                href="http://localhost:8080/v1/auth/reddit"
              >
                <reddit-icon class="w-8 h-8 fill-current" />
              </a>
            </div>
          </div>
          <div class="flex justify-end py-2">
            <button
              @click.prevent="processFormInput"
              class="p-3 px-4 mr-2 text-white uppercase bg-blue-900 hover:bg-gray-100 hover:shadow-xl hover:text-indigo-400 focus:outline-none"
            >
              {{ $t('form.submit') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { mapActions } from 'vuex'

import AppInput from './AppInput.vue'
import AppSwitchLang from './AppSwitchLang.vue'
import FortyTwoIcon from './FortyTwoIcon.vue'
import GoogleIcon from './GoogleIcon.vue'
import GithubIcon from './GithubIcon.vue'
import RedditIcon from './RedditIcon.vue'

export default {
  name: 'AuthScreen',
  components: {
    AppInput,
    AppSwitchLang,
    FortyTwoIcon,
    GoogleIcon,
    GithubIcon,
    RedditIcon
  },
  props: {
    isLoggedIn: {
      type: Boolean,
      required: true
    },
    resetPassword: {
      type: Boolean,
      default: false,
      required: false
    },
    guid: {
      type: String,
      default: '',
      required: false
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
      passwordReset: {
        visible: false,
        form: {
          username: '',
          password: '',
          token: ''
        }
      },
      register: {
        visible: false,
        form: {
          username: '',
          email: '',
          lastName: '',
          firstName: '',
          password: '',
          profilePicture: null
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
    processFormInput() {
      let o
      if (this.formType === 'login') o = this.login.form
      else if (this.formType === 'register') o = this.register.form
      else if (this.formType === 'password-forgot') o = this.passwordForgot.form
      else if (this.formType === 'reset-password') o = this.passwordReset.form
      else return

      let empty = false

      Object.keys(o).forEach((key, index) => {
        if (o[key] === '' || o[key] === null || o[key] === undefined) {
          // error[key] = true;
          empty = true
        }
      })

      if (empty) {
        this.$toast.open({
          message: this.$t('form.missing_input'),
          type: 'error'
        })

        return
      }

      this.submitForm()
    },
    handleFileUpload() {
      this.register.form.profilePicture = this.$refs.file.files[0]
    },
    ...mapActions({
      registerUser: 'auth/registerUser',
      loginUser: 'auth/loginUser',
      forgotUserPassword: 'auth/forgotUserPassword',
      userPasswordReset: 'auth/passwordReset',
      fortyTwoUser: 'auth/fortyTwoUser',
      githubUser: 'auth/githubUser',
      googleUser: 'auth/googleUser'
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
          firstName: ''
        }
        this.passwordReset.form = {
          username: '',
          password: '',
          token: this.passwordReset.form.token
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
        this.passwordReset.form = {
          username: '',
          password: '',
          token: this.passwordReset.form.token
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
        this.passwordReset.form = {
          username: '',
          password: '',
          token: this.passwordReset.form.token
        }
        this.register.form = {
          username: '',
          password: '',
          email: '',
          lastName: '',
          firstName: ''
        }
        this.passwordForgot.visible = true
      } else if (this.formType === 'reset-password') {
        this.login.visible = false
        this.register.visible = false
        this.passwordForgot.visible = false
        this.login.form = {
          username: '',
          password: ''
        }
        this.register.form = {
          username: '',
          password: '',
          email: '',
          lastName: '',
          firstName: ''
        }
        this.passwordForgot.form = {
          username: ''
        }
      }
    },
    async submitForm() {
      try {
        if (this.login.visible) {
          const res = await this.loginUser(this.login.form)
          if (!res.data.success) {
            this.$toast.open({
              message: this.$t(`server.login.${res.data.translationKey}`),
              type: 'error'
            })

            return
          }

          this.$router
            .replace({
              name: 'home',
              params: this.$route.params
            })
            .catch(() => {})
        } else if (this.register.visible) {
          const formData = new FormData()
          const registrationFormFields = Object.entries(this.register.form)
          registrationFormFields.forEach(([key, value]) => {
            formData.append(key, value)
          })
          const res = await this.registerUser(formData)
          if (res.data.error || !res.data.success)
            return this.$toast.open({
              message: this.$t(`server.register.${res.data.translationKey}`),
              type: 'error'
            })
          this.formType = 'login'
          this.login.form.username = this.register.form.username
          this.login.form.password = this.register.form.password
          this.showAuthForm()
          this.$toast.open({
            message: this.$t('form.confirm_account'),
            type: 'success'
          })
        } else if (this.passwordForgot.visible) {
          const res = await this.forgotUserPassword(this.passwordForgot.form)
          if (!res.data.success)
            return this.$toast.open({
              message: this.$t(`server.${res.data.translationKey}`),
              type: 'error'
            })
          console.log(res)
          this.formType = 'login'
          this.showAuthForm()
          return this.$toast.open({
            message: this.$t('form.check_mail'),
            type: 'success'
          })
        } else if (this.passwordReset) {
          const res = await this.userPasswordReset(this.passwordReset.form)
          if (!res.data.success)
            return this.$toast.open({
              message: this.$t(`server.${res.data.translationKey}`),
              type: 'error'
            })
          localStorage.removeItem('resetPasswordToken')
          this.formType = 'login'
          this.showAuthForm()
          this.$emit('clear')
          return this.$toast.open({
            message: this.$t('form.password_updated'),
            type: 'success'
          })
        }
      } catch (error) {
        console.log('error in submitForm ', error.message)
      }
    }
  },
  watch: {
    resetPassword: {
      immediate: true,
      deep: true,
      handler(newValue, oldValue) {
        if (newValue) {
          this.formType = 'reset-password'
          this.showAuthForm()
        }
      }
    },
    guid: {
      immediate: true,
      deep: true,
      handler(newValue, oldValue) {
        if (newValue) {
          this.passwordReset.form.token = newValue
        }
      }
    }
  }
}
</script>

<style scoped>
.modal {
  transition: opacity 0.25s ease;
}
</style>
