<template>
  <div class="w-full container pt-20 mx-auto">
    <h2 class="text-white font-semibold text-3xl tracking-wider mb-6">
      {{ title }} ({{ year }})
    </h2>

    <video
      preload="none"
      poster="http://image.tmdb.org/t/p/w500/AtsgWhDnHTq68L0lLsUrCnM7TjG.jpg"
      class="w-full object-cover object-top player"
    ></video>

    <div class="py-4 text-white">
      <p class="text-xl mb-2" :title="`The movie lasts ${formattedRuntime}`">
        ⏱ {{ formattedRuntime }}
      </p>

      <blockquote class="text-xl tracking-wide mb-3">
        {{ description }}
      </blockquote>

      <tag v-for="genre in genres" :key="genre" big>
        {{ genre }}
      </tag>
    </div>
  </div>
</template>

<script>
import Tag from '@/components/Tag.vue'

export default {
  components: {
    Tag
  },
  data() {
    return {
      title: "Shrek 3 - l'Ogre",
      year: '2018',
      runtime: 104,
      genres: ['action', 'war', 'science-fiction'],
      description:
        'Elsa, Anna, Kristoff and Olaf head far into the forest to learn the truth about an ancient mystery of their kingdom.'
    }
  },
  computed: {
    formattedRuntime() {
      const hours = this.runtime / 60
      const minutes = this.runtime % 60

      return `${hours.toFixed(0)}h${minutes.toFixed(0)}`
    }
  }
}
</script>

<<<<<<< HEAD
<style>
.comment-wrapper {
=======
<style lang="scss" scoped>
.player {
>>>>>>> f289ac5... feat(movie): start to redesign the movie page
  height: 500px;
}
</style>
