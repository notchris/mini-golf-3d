<template>
    <div id="test">
        <div class="top">
            <div class="course panel">
                <div class="icon"><i class="mdi mdi-golf-tee"></i></div>
                <div class="content">Default Course</div>
            </div>
            <div class="hole panel">
                <div class="icon"><i class="mdi mdi-golf"></i></div>
                <div class="content">Hole 1 <div class="par">Par 3</div></div>
            </div>
        </div>
    </div>
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
<style scoped>

    .top {
        position: absolute;
        top: 20px;
        left: 0;
        width: 100%;
        height: 120px;
        border-top: 1px solid red;
        border-bottom: 1px solid red;
        display:none;
    }
    .panel {
        width: auto;
        height: 30px;
        background: white;
        line-height: 30px;
        padding-left: 45px;
        padding-right: 30px;
        position: relative;
        margin-bottom: 10px;
        white-space: nowrap;
        float: left;
        clear: both;
    }

    .panel .content {
        font-size: 16px;
        font-weight: 700;
        font-family: 'Titillium Web', sans-serif;
    }

    .panel .content .par {
        font-size: 14px;
        font-weight: 700;
        font-family: 'Titillium Web', sans-serif;
        background: aliceblue;
        border: 1px solid #666;
        color: #999;
        width: 40px;
        height: 20px;
        margin-top:5px;
        float: right;
        margin-left: 4px;
        text-align: center;
        line-height: 17px;
        border-radius: 4px;
    }

    .panel .icon {
        width: 35px;
        height: 35px;
        position: absolute;
        top: -3.5px;
        left: 5px;
        background: white;
        border-radius: 50%;
        border: 2px solid black;
    }

    .panel .icon i {
        color: #FFF;
        font-size: 24px !important;
        margin-left: 3.5px;
    }

    .panel::before {
        content: '';
        width: 0;
        height: 0;
        border-top: 30px solid white;
        border-right: 30px solid transparent;
        position: absolute;
        top: 0;
        right: -30px;
    }

    .course {
        border-bottom: 2px solid #666;
    }
    .hole {
        border-bottom: 2px solid #666;
    }
    .course .icon {
        background: dodgerblue;
    }
    .hole .icon {
        background: forestgreen;
    }


</style>