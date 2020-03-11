import Vue from 'vue'
import Router from 'vue-router'
import axios from 'axios'

import i18n from '../i18n'
import { confirmAccount } from '../api/auth'
import { setWithExpiry } from '../utils/localStorage'
import store from '../store/modules/auth'
import { loadStore } from '@/store'

Vue.use(Router)

const storeLoading = loadStore()

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '',
      redirect: () => `/${i18n.locale}`
    },
    ,
    {
      path: '/confirmaccount/:uuid/:id',
      name: 'account_confirmation',
      beforeEnter: requireHash,
      component: () => import('@/views/UserConfirmation.vue'),
      meta: {
        requiresNotAuth: true
      }
    },
    {
      path: '/password-reset/:guid',
      name: 'password_reset',
      beforeEnter: requireToken,
      component: () => import('@/views/PasswordReset.vue'),
      meta: {
        requiresNotAuth: true
      }
    },
    {
      path: '/:lang(fr|en)',
      component: {
        render(c) {
          return c('router-view')
        }
      },
      children: [
        {
          path: '',
          redirect: () => `/${i18n.locale}/home`
        },
        {
          path: 'auth',
          name: 'auth',
          component: () => import('@/views/Auth.vue'),
          meta: {
            requiresNotAuth: true
          }
        },
        {
          path: 'home',
          name: 'home',
          component: () => import('@/views/Home.vue'),
          meta: {
            requiresAuth: true
          }
        },
        {
          path: 'movie/:id',
          name: 'movie',
          component: () => import('@/views/Movie.vue'),
          meta: {
            requiresAuth: true
          }
        },
        {
          path: 'user/:id',
          name: 'user',
          component: () => import('@/views/User.vue'),
          meta: {
            requiresAuth: true
          }
        },
        {
          path: 'me',
          name: 'me',
          component: () => import('@/views/Me.vue'),
          meta: {
            requiresAuth: true
          }
        },
        {
          path: '/oauth-error',
          name: 'oauth-error',
          component: () => import('@/views/OAuthError.vue'),
          meta: {
            requiresNotAuth: true
          }
        }
      ]
    },
    {
      path: '*',
      name: '404',
      component: () =>
        import(/* webpackChunkName: "movie" */ '../views/404.vue')
    }
  ]
})

function checkIfLoggedIn(_to, _from, next) {
  try {
    if (!store.state.isLoggedIn) return next('/')
    return next()
  } catch (error) {
    next(error)
  }
}

function checkOauthToken(to, _from, next) {
  try {
    const token = to.query && to.query.token

    if (typeof token === 'string') {
      const decodedToken = decodeURIComponent(token)

      localStorage.setItem('csrfToken', decodedToken)
      axios.defaults.headers.common['X-CSRF-TOKEN'] = decodedToken

      next({
        path: to.path,
        query: null
      })
      return
    }

    next()
  } catch (error) {
    console.log('fail in check oauth token')
  }
}

async function requireHash(to, _from, next) {
  try {
    const uuid = to.params.uuid
    const id = to.params.id
    if (!id || !uuid) next('/')
    const result = await confirmAccount(uuid, id)
    if (!result.data.success) {
      // this.$toast.open({ message: 'Confirmation failed', type: 'success'});
      // console.log('confirmation failed')
      return next('/')
    }
    //this.$toast.open({ message: 'Confirmation success', type: 'success'});
    return next('/')
  } catch (e) {
    console.log('confirmation error catch ', e)
    return next('/')
  }
}

async function requireToken(to, _from, next) {
  try {
    const guid = to.params.guid
    if (!guid) return next('/')
    setWithExpiry('resetPasswordToken', guid, 600000)
    next('/')
  } catch (e) {
    console.log('confirmation error catch ', e)
    return next('/')
  }
}

router.beforeEach(async (to, _from, next) => {
  await storeLoading

  const isUserLoggedIn = store.state.isLoggedIn
  const anonymousRequired = to.matched.some(
    ({ meta: { requiresNotAuth } }) => requiresNotAuth === true
  )
  const loggedInRequired = to.matched.some(
    ({ meta: { requiresAuth } }) => requiresAuth === true
  )

  if (anonymousRequired && isUserLoggedIn) {
    next(`/${i18n.locale}/home`)
    return
  }

  if (loggedInRequired && !isUserLoggedIn) {
    next(`/${i18n.locale}/auth`)
    return
  }

  next()
})

router.beforeEach(checkOauthToken)

export default router
