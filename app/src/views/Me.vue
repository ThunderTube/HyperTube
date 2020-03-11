<template>
  <div
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
          @click="selectAuthForm('details')"
          class="cursor-pointer w-1/2 h-full flex items-center justify-center"
        >
          {{ $t('profile.details') }}
        </div>
        <div
          @click="selectAuthForm('password')"
          class="cursor-pointer w-1/2 h-full flex items-center justify-center"
        >
          {{ $t('loginscreen.password') }}
        </div>
      </div>
      <div class="py-4 text-left px-6">
        <form>
          <div v-if="details.visible">
            <app-input
              v-model.trim="details.form.username"
              :name="$t('profile.username')"
              :placeholder="$t('profile.username')"
              :autocomplete="$t('profile.username')"
            />
            <app-input
              v-model.trim="details.form.email"
              type="email"
              name="email"
              placeholder="email"
              autocomplete="email"
            />
            <app-input
              v-model.trim="details.form.firstName"
              :name="$t('profile.firstname')"
              :placeholder="$t('profile.firstname')"
              :autocomplete="$t('profile.firstname')"
            />
            <app-input
              v-model.trim="details.form.lastName"
              :name="$t('profile.lastname')"
              :placeholder="$t('profile.lastname')"
              :autocomplete="$t('profile.lastname')"
            />
            <div class="block">
              <input
                type="file"
                id="file"
                ref="file"
                accept="image/*"
                @change="handleFileUpload()"
              />
            </div>
          </div>
          <div v-else-if="password.visible">
            <app-input
              v-model="password.form.password"
              :name="$t('loginscreen.password')"
              type="password"
              placeholder="********"
              autocomplete="password"
            />
          </div>
          <div class="flex justify-end py-2">
            <button
              @click.prevent="submitForm"
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
import AppSwitchLang from '@/components/AppSwitchLang.vue'
import AppInput from '@/components/AppInput'
import { mapGetters, mapActions } from 'vuex'

export default {
  components: {
    AppInput,
    AppSwitchLang
  },
  data() {
    return {
      formType: 'details',
      details: {
        visible: true,
        form: {
          username: '',
          email: '',
          lastName: '',
          firstName: '',
          password: '',
          profilePicture: null
        }
      },
      password: {
        visible: false,
        form: {
          password: ''
        }
      }
    }
  },
  methods: {
    ...mapActions({
      updateUserDetails: 'auth/updateUserDetails',
      updateUserPassword: 'auth/updateUserPassword',
      me: 'auth/getCurrentUser'
    }),
    selectAuthForm(formType) {
      this.formType = formType
      this.showAuthForm()
    },
    handleFileUpload() {
      this.details.form.profilePicture = this.$refs.file.files[0]
    },
    showAuthForm() {
      if (this.formType === 'details') {
        this.password.visible = false
        this.password.form = {
          password: ''
        }
        this.details.visible = true
      } else if (this.formType === 'password') {
        this.details.visible = false
        this.password.visible = true
      }
    },
    async submitForm() {
      try {
        if (this.details.visible) {
          const formData = new FormData()

          const updateDetailsFormFields = Object.entries(this.details.form)
          updateDetailsFormFields.forEach(([key, value]) => {
            if (!value) return

            if (value instanceof File) {
              formData.append(key, value)
              return
            }

            const trimmedValue =
              key === 'password' ? String(value) : String(value).trim()

            if (trimmedValue.length === 0) return

            formData.append(key, trimmedValue)
          })

          const res = await this.updateUserDetails(formData)
          if (res.data.error || !res.data.success) {
            this.$toast.open({
              message: this.$t(`server.${res.data.translationKey}`),
              type: 'error'
            })

            return
          }

          this.formType = 'details'
          this.$toast.open({
            message: this.$t('form.account_updated'),
            type: 'success'
          })

          // WTF?
          await this.me()
        } else if (this.password.visible) {
          const res = await this.updateUserPassword(this.password.form)
<<<<<<< HEAD
          if (!res.data.success)
            return this.$toast.open({
              message: this.$t(`server.${res.data.translationKey}`),
=======
          if (!res.data.success) {
            this.$toast.open({
              message: this.$t(res.data.translationKey),
>>>>>>> eab699c... fix(update-details): fix WTF behaviors :joy:
              type: 'error'
            })

            return
          }

          this.formType = 'details'
          this.showAuthForm()

          // WTF?
          await this.me()

          this.$toast.open({
            message: this.$t('form.password_updated'),
            type: 'success'
          })

          return
        }
      } catch (error) {
        console.log('error in submitForm ', error.message)
      }
    }
  },
  computed: {
    ...mapGetters({
      getAuthData: 'auth/getAuthData'
    })
  },
  created() {
    this.details.form.email = this.getAuthData.email
    this.details.form.username = this.getAuthData.username
    this.details.form.firstName = this.getAuthData.firstName
    this.details.form.lastName = this.getAuthData.lastName
  }
}
</script>
