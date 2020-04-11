<template>
    <div id="test"></div>
</template>

<script>
import Game from '../assets/js/Game';

export default {
  name: 'Test',
  data () {
      return {
          game: null
      }
  },
  mounted () {
      this.game = new Game(this.$el, this.objects)
      window.addEventListener('resize', this.game.resize(), false);
  },
  beforeDestroy () {
    this.game.destroy();
  },
  computed: {
      objects () {
          return this.$store.state.objects;
      }
  }
}
</script>