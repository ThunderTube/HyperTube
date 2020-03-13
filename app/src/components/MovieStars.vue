<template>
  <star-rating v-bind="config"></star-rating>
</template>

<script>
import StarRating from './StarRating.vue'

export default {
  name: 'MovieStars',
  components: {
    StarRating
  },
  props: {
    rating: {
      type: Number,
      required: true
    }
  },
  computed: {
    config() {
      return {
        rating: Number((this.rating / 2).toFixed(1)), // our rating is between 0 and 10, the lib rating is between 0 and 5.
        starStyle: {
          fullStarColor: '#ed8a19',
          emptyStarColor: '#737373',
          starWidth: 20,
          starHeight: 20
        }
      }
    }
  }
}
</script>
