<template>
  <div class="lg-8 rounded bg-white text-base text-black comment flex justify-center w- mb-6">
    <div class="w-4/5 h-full pl-2 py-5">
     <input type="text" placeholder="Votre commentaire...">
    </div>
    <div class="w-1/5 h-full btn_submit py-5">
        <input type="submit" class="background-white">
    </div>
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

.btn_submit {
  background-color: white;
}
</style>
