<template>
  <div>
    <app-button
      :class="[show ? 'bg-gray-700' : 'bg-gray-800']"
      title="Search for movies"
      @click="show = !show"
    >
      🔍 {{ $t('home.search_button') }}
    </app-button>

    <transition mode="out-in" name="search-bar">
      <aside v-if="show" class="flex flex-wrap mt-4">
        <movies-search-bar-input
          :value="searchQuery"
          @input="$emit('update:search-query', $event)"
          :placeholder="$t('home.search_input')"
        />

        <movies-search-bar-dropdown
          :value="genre"
          @input="$emit('update:genre', $event)"
          :items="genres"
          name="genres"
          :label="$t('home.search_genre_label')"
          class="sm:pr-1"
        />
        <movies-search-bar-dropdown
          :value="year"
          @input="$emit('update:year', $event)"
          :items="years"
          name="years"
          :label="$t('home.search_year_label')"
          class="sm:pl-1"
        />
      </aside>
    </transition>
  </div>
</template>

<script>
import MoviesSearchBarInput from './MoviesSearchBarInput.vue'
import MoviesSearchBarDropdown from './MoviesSearchBarDropdown.vue'
import AppButton from './AppButton.vue'

export default {
  name: 'MoviesSearchBar',
  components: {
    MoviesSearchBarInput,
    MoviesSearchBarDropdown,
    AppButton
  },
  props: {
    searchQuery: {
      type: String,
      default: ''
    },
    genre: {
      type: String,
      default: ''
    },
    year: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      show: false,

      years: [
        '1950',
        '1951',
        '1952',
        '1953',
        '1954',
        '1955',
        '1956',
        '1957',
        '1958',
        '1959',
        '1960',
        '1961',
        '1962',
        '1963',
        '1964',
        '1965',
        '1966',
        '1967',
        '1968',
        '1969',
        '1970',
        '1971',
        '1972',
        '1973',
        '1974',
        '1975',
        '1976',
        '1977',
        '1978',
        '1979',
        '1980',
        '1981',
        '1982',
        '1983',
        '1984',
        '1985',
        '1986',
        '1987',
        '1988',
        '1989',
        '1990',
        '1991',
        '1992',
        '1993',
        '1994',
        '1995',
        '1996',
        '1997',
        '1998',
        '1999',
        '2000',
        '2001',
        '2002',
        '2003',
        '2004',
        '2005',
        '2006',
        '2007',
        '2008',
        '2009',
        '2010',
        '2011',
        '2012',
        '2013',
        '2014',
        '2015',
        '2016',
        '2017',
        '2018',
        '2019'
      ].map((year) => ({ text: year, value: year }))
    }
  },
  computed: {
    genres() {
      const genres = [
        ['genres.action', 'action'],
        ['genres.adventure', 'adventure'],
        ['genres.animation', 'animation'],
        ['genres.sci-fi', 'science-fiction'],
        ['genres.comedy', 'comedy'],
        ['genres.crime', 'crime'],
        ['genres.drama', 'drama'],
        ['genres.film-noir', 'film-noir'],
        ['genres.romance', 'romance'],
        ['genres.thriller', 'thriller'],
        ['genres.horror', 'horror'],
        ['genres.history', 'history'],
        ['genres.mystery', 'mystery'],
        ['genres.music', 'music'],
        ['genres.documentary', 'documentary'],
        ['genres.sport', 'sport'],
        ['genres.war', 'war'],
        ['genres.fantasy', 'fantasy'],
        ['genres.musical', 'musical'],
        ['genres.family', 'family'],
        ['genres.biography', 'biography'],
        ['genres.western', 'western'],
        ['genres.news', 'news'],
        ['genres.reality-tv', 'reality-tv'],
        ['genres.talk-show', 'talk-show']
      ]

      return genres.map(([i18nProperty, value]) => ({
        text: this.$t(i18nProperty),
        value
      }))
    }
  }
}
</script>

<style scoped>
.search-bar-enter-active,
.search-bar-leave-active {
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.search-bar-enter,
.search-bar-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}

.search-bar-move {
  transition: transform 0.6s;
}
</style>
