import Vue from 'vue'
import Router from 'vue-router'
import Home from '../views/Home.vue'
import i18n from '../i18n'
import { confirmAccount } from '../api/auth'

Vue.use(Router)

const router =  new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/confirmaccount/:uuid/:id',
      name: 'account_confirmation',
      beforeEnter: requireHash,
      component: () =>
        import(/* webpackChunkName: "movie" */ '../views/UserConfirmation.vue')
    },
    {
      path: '/password-reset?token=:guid`',
      name: 'password_reset',
      // beforeEnter: requireGuid,
      component: () =>
        import(/* webpackChunkName: "movie" */ '../views/PasswordReset.vue')
    },
    {
      path: '/',
      redirect: `/${i18n.locale}`
    },
    {
      path: '/:lang',
      component: {
        render (c) { return c('router-view') }
      },
      children: [
        {
          path: '/',
          name: 'home',
          component: Home
        },
        {
          path: 'movie',
          name: 'movie',
          component: () =>
            import(/* webpackChunkName: "movie" */ '../views/Movie.vue')
        }
      ]
    }
  ]
})

async function requireHash(to, from, next) {
  try {
    const uuid = to.params.uuid
    const id = to.params.id
    if (!id || !uuid)
      next('/')
    const result = await confirmAccount(uuid, id)
    if (!result.data.success) {
      // this.$toast.open({ message: 'Confirmation failed', type: 'success'});
      // console.log('confirmation failed')
      return next('/')
    }
    this.$toast.open({ message: 'Confirmation success', type: 'success'});
    return next('/')
  } catch (e) {
    console.log('confirmation error catch ', e)
    return next('/')
  }
}

export default router