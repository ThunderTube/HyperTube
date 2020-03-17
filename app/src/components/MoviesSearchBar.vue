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
        { text: '1950', value: '1950' },
        { text: '1951', value: '1951' },
        { text: '1952', value: '1952' },
        { text: '1953', value: '1953' },
        { text: '1954', value: '1954' },
        { text: '1955', value: '1955' },
        { text: '1956', value: '1956' },
        { text: '1957', value: '1957' },
        { text: '1958', value: '1958' },
        { text: '1959', value: '1959' },
        { text: '1960', value: '1960' },
        { text: '1961', value: '1961' },
        { text: '1962', value: '1962' },
        { text: '1963', value: '1963' },
        { text: '1964', value: '1964' },
        { text: '1965', value: '1965' },
        { text: '1966', value: '1966' },
        { text: '1967', value: '1967' },
        { text: '1968', value: '1968' },
        { text: '1969', value: '1969' },
        { text: '1970', value: '1970' },
        { text: '1971', value: '1971' },
        { text: '1972', value: '1972' },
        { text: '1973', value: '1973' },
        { text: '1974', value: '1974' },
        { text: '1975', value: '1975' },
        { text: '1976', value: '1976' },
        { text: '1977', value: '1977' },
        { text: '1978', value: '1978' },
        { text: '1979', value: '1979' },
        { text: '1980', value: '1980' },
        { text: '1981', value: '1981' },
        { text: '1982', value: '1982' },
        { text: '1983', value: '1983' },
        { text: '1984', value: '1984' },
        { text: '1985', value: '1985' },
        { text: '1986', value: '1986' },
        { text: '1987', value: '1987' },
        { text: '1988', value: '1988' },
        { text: '1989', value: '1989' },
        { text: '1990', value: '1990' },
        { text: '1991', value: '1991' },
        { text: '1992', value: '1992' },
        { text: '1993', value: '1993' },
        { text: '1994', value: '1994' },
        { text: '1995', value: '1995' },
        { text: '1996', value: '1996' },
        { text: '1997', value: '1997' },
        { text: '1998', value: '1998' },
        { text: '1999', value: '1999' },
        { text: '2000', value: '2000' },
        { text: '2001', value: '2001' },
        { text: '2002', value: '2002' },
        { text: '2003', value: '2003' },
        { text: '2004', value: '2004' },
        { text: '2005', value: '2005' },
        { text: '2006', value: '2006' },
        { text: '2007', value: '2007' },
        { text: '2008', value: '2008' },
        { text: '2009', value: '2009' },
        { text: '2010', value: '2010' },
        { text: '2011', value: '2011' },
        { text: '2012', value: '2012' },
        { text: '2013', value: '2013' },
        { text: '2014', value: '2014' },
        { text: '2015', value: '2015' },
        { text: '2016', value: '2016' },
        { text: '2017', value: '2017' },
        { text: '2018', value: '2018' },
        { text: '2019', value: '2019' }
      ]
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
