<template>
  <div>
    <div
      class="min-h-screen bg-cover"
      :style="{ backgroundImage: `url('${background}')` }"
    >
      <div class="pt-32 pl-8 mb-2"></div>

      <div class="pt-32 pl-24 mb-4">
        <button
          class="px-6 py-2 bg-white text-black font-bold uppercase rounded flex items-center hover:bg-gray-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
            <path d="M0 0h24v24H0z" fill="none" />
          </svg>
          <span class="pl-1">{{ $t('movie.play') }}</span>
        </button>
      </div>

      <div class="pl-24 text-gray-500 mb-8">
        PG-13 &middot; 2019 &middot; 2h 4m &middot; Action, Adventure, Science
        Fiction
      </div>

      <div class="w-96 xl:w-1/3 pl-24 leading-loose">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Natus fugit
        tenetur velit quasi soluta sunt suscipit, eveniet dolorum. Tenetur
        architecto voluptatum quis, vitae autem, vero tempora libero impedit
        culpa debitis, quisquam nam nemo quidem modi sunt illo consequuntur
        maiores magni.
      </div>
      <!-- <img src="@/assets/captain_marvel_background.jpg" alt="captain marvel"> -->
    </div>
    <div
      class="bg-red-600 h-screen flex items-center justify-center uppercase text-white text-5xl"
    >
      <h1>Comments</h1>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      background: require('@/assets/img/captain_marvel_background.jpg')
    }
  }
}
</script>
