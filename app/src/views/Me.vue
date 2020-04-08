<template>
  <div
    class="relative top-0 left-0 flex items-center justify-center w-full h-full min-h-screen bg-black bg-gray-900 modal modal-active"
  >
    <div class="w-11/12 mx-auto my-3 bg-white modal-container md:max-w-md">
      <div
        class="flex items-center justify-center w-full h-12 text-white bg-gray-800 shadow-xl"
      >
        <div
          @click="selectAuthForm('details')"
          class="flex items-center justify-center w-1/2 h-full cursor-pointer"
          :class="{ 'bg-gray-700': formType === 'details' }"
        >
          {{ $t('profile.details') }}
        </div>
        <div
          v-if="!hidePasswordField"
          @click="selectAuthForm('password')"
          class="flex items-center justify-center w-1/2 h-full cursor-pointer"
          :class="{ 'bg-gray-700': formType === 'password' }"
        >
          {{ $t('loginscreen.password') }}
        </div>
      </div>
      <div class="px-6 py-4 text-left">
        <form>
          <div v-if="details.visible">
            <app-input
              v-model.trim="details.form.username"
              autocomplete="username"
              :name="$t('profile.username')"
              :placeholder="$t('profile.username-placeholder')"
            />
            <app-input
              v-model.trim="details.form.email"
              type="email"
              autocomplete="autocomplete"
              :name="$t('profile.email')"
              :placeholder="$t('profile.email-placeholder')"
            />
            <app-input
              v-model.trim="details.form.firstName"
              autocomplete="given-name"
              :name="$t('profile.firstname')"
              :placeholder="$t('profile.firstname-placeholder')"
            />
            <app-input
              v-model.trim="details.form.lastName"
              autocomplete="family-name"
              :name="$t('profile.lastname')"
              :placeholder="$t('profile.lastname-placeholder')"
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

            <div>
              <label class="">
                <p class="mt-2 font-bold capitalize">
                  {{ $t('profile.favorite-language') }}
                </p>

                <div class="relative w-full">
                  <select
                    v-model="details.form.favoriteLanguage"
                    class="block w-full px-4 py-3 pr-8 leading-tight text-gray-700 bg-white border border-gray-200 rounded appearance-none focus:outline-none focus:border-gray-500"
                  >
                    <option value="en">EN</option>
                    <option value="fr">FR</option>
                  </select>

                  <div
                    class="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 pointer-events-none"
                  >
                    <svg
                      class="w-4 h-4 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
                      />
                    </svg>
                  </div>
                </div>
              </label>
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
          profilePicture: null,
          favoriteLanguage: 'en'
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
              message: this.$t(
                `server.update-details.${res.data.translationKey}`
              ),
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
          if (!res.data.success) {
            this.$toast.open({
              message: this.$t(`server.${res.data.translationKey}`),
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
    }),
    hidePasswordField() {
      return this.getAuthData?.OAuthProvider !== undefined
    }
  },
  created() {
    this.details.form.email = this.getAuthData.email
    this.details.form.username = this.getAuthData.username
    this.details.form.firstName = this.getAuthData.firstName
    this.details.form.lastName = this.getAuthData.lastName
    this.details.form.favoriteLanguage = this.getAuthData.favoriteLanguage
  }
}
</script>
