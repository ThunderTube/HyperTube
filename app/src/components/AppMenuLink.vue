<script>
import LogoutIcon from './LogoutIcon.vue'
import MovieIcon from './MovieIcon.vue'

export default {
  name: 'AppMenuLink',
  props: {
    link: {
      type: String,
      default: undefined
    },
    text: {
      type: String,
      required: true
    },
    action: {
      type: Function,
      default: undefined
    },
    color: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      required: true,
      validator(icon) {
        const AUTHORIZED_ICONS = ['film', 'log-out']

        return AUTHORIZED_ICONS.includes(icon)
      }
    }
  },
  methods: {
    genIcon() {
      const icon = this.icon === 'film' ? MovieIcon : LogoutIcon

      return this.$createElement(icon, {
        staticClass: 'w-6 h-6'
      })
    }
  },
  render(h) {
    const rootComponent = this.link ? 'router-link' : 'button'

    const attrs = {
      staticClass:
        'flex items-center px-2 py-1 mb-2 rounded text-gray-300 bg-transparent focus:bg-gray-700 hover:bg-gray-600 text-left transition-colors duration-150 text-lg'
    }

    if (this.link) {
      attrs.props = {
        to: {
          name: this.link,
          lang: this.$i18n.locale
        },
        activeClass: 'menu-link-active'
      }
    } else {
      attrs.on = {
        click: this.action
      }
    }

    return h(rootComponent, attrs, [
      this.genIcon(),

      h(
        'span',
        {
          staticClass: 'ml-3 flex-grow'
        },
        this.text
      )
    ])
  }
}
</script>

<style>
.menu-link-active.menu-link-active {
  @apply bg-gray-700;
}
</style>
