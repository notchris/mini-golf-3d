<template>
  <div id="app">
   <split-pane :min-percent='20' :default-percent='80' split="horizontal">
      <template slot="paneL">
        <Render/>
      </template>
      <template slot="paneR">
        <Tools />
      </template>
    </split-pane>
  </div>
</template>

<script>
import Tools from './components/Tools.vue';
import Render from './components/Render.vue';

export default {
  name: 'App',
  components: {
    Tools,
    Render
  }
}
</script>