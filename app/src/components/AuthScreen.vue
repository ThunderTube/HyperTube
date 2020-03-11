<template>
  <div
    v-if="!isLoggedIn"
    class="z-40 modal modal-active fixed w-full h-full top-0 left-0 flex items-center justify-center bg-black"
  >
    <div class="z-50">
      <app-switch-lang />
    </div>
    <div
      class="modal-overlay absolute w-full h-full bg-gray-900 opacity-75"
    ></div>
    <div
      class="modal-container bg-white w-11/12 md:max-w-md mx-auto z-50 overflow-y-auto"
    >
      <div
        class="w-full h-12 flex items-center justify-center text-white shadow-xl bg-gray-800"
      >
        <div
          @click="selectAuthForm('login')"
          class="cursor-pointer w-1/2 h-full flex items-center justify-center"
        >
          {{ $t('loginscreen.login') }}
        </div>
        <div
          @click="selectAuthForm('register')"
          class="cursor-pointer w-1/2 h-full flex items-center justify-center"
        >
          {{ $t('loginscreen.register') }}
        </div>
      </div>
      <div class="py-4 text-left px-6">
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
              name="email"
              placeholder="email"
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
            class="flex justify-between my-8"
          >
            <div>
              <a
                class="bg-gray-900 text-white px-4 py-2 rounded  hover:shadow-lg"
                href="http://localhost:8080/v1/auth/42"
                >42</a
              >
            </div>
            <div>
              <a
                class="bg-blue-900 text-white px-4 py-2 rounded  hover:shadow-lg"
                href="http://localhost:8080/v1/auth/google"
                >Google</a
              >
            </div>
            <div>
              <a
                class="bg-green-900 text-white px-4 py-2 rounded  hover:shadow-lg"
                href="http://localhost:8080/v1/auth/github"
                >Github</a
              >
            </div>
            <div>
              <a
                class="bg-orange-600 text-white px-4 py-2 rounded  hover:shadow-lg"
                href="http://localhost:8080/v1/auth/reddit"
                >Reddit</a
              >
            </div>
          </div>
          <div class="flex justify-end py-2">
            <button
              @click.prevent="processFormInput"
              class="px-4 bg-blue-900 p-3 text-white hover:bg-gray-100 hover:shadow-xl hover:text-indigo-400 mr-2 uppercase focus:outline-none"
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
import AppInput from '../components/AppInput'
import AppSwitchLang from '@/components/AppSwitchLang.vue'

export default {
  name: 'AuthScreen',
  components: {
    AppInput,
    AppSwitchLang
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
      if (this.formType === 'register') o = this.register.form
      if (this.formType === 'password-forgot') o = this.passwordReset.form
      if (this.formType === 'password-reset') o = this.passwordForgot.form
      let empty = false
      Object.keys(o).forEach((key, index) => {
        if (o[key] === '' || o[key] === null || o[key] === undefined) {
          // error[key] = true;
          empty = true
        }
      })
      if (empty)
        this.$toast.open({
          message: this.$t('form.missing_input'),
          type: 'error'
        })
      if (!empty) this.submitForm()
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
            return this.$toast.open({
              message: this.$t(`server.${res.data.translationKey}`),
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
              message: this.$t(`server.${res.data.translationKey}`),
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
.modal-active {
  overflow-x: hidden;
  overflow-y: visible !important;
}
</style>
