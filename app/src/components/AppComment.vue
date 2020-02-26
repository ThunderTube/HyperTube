<template>
  <div class="lg-8 rounded bg-white text-base text-black py-5 comment flex justify-center w- mb-6">
    Ceci est un commentaire
  </div>
</template>

<script>
export default {
  name: 'AppComment'
}
</script>

<style lang="css" scoped>
.comment {
  opacity: 0.95;
  transition: all 0.3s;
}

.comment:hover {
  opacity: 1;
  transform: scale(1.01);
}
</style>
