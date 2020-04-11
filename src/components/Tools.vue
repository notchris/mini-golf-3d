<template>
  <div class="tools">
    <div class="tabs">
      <button @click="tab = 'course'; updateTool(null); setInactive();" :disabled="tab === 'course' || render">Course</button>
      <button @click="tab = 'build'; updateTool(null); setInactive();" :disabled="tab === 'build' || render">Build</button>
      <button @click="tab = 'materials'; updateTool(null); setInactive();" :disabled="tab === 'materials' || render">Materials</button>
      <button @click="render ? setRender() : setRender(true)" :class="[render ? 'stop' : 'start', 'btnRender']"><i :class="[render ? 'mdi-stop' : 'mdi-play', 'mdi']"></i></button>
    </div>
    <div v-show="tab === 'course'" class="pane course">
      <div class="left">
        <label>Course Title</label>
        <input class="form-control" :value="title" @input="updateTitle($event)" type="text"/><br/>
        <label>Course ID</label>
        <div>{{courseId}}</div><br/>
        <button @click="saveCourse">Save Course</button>
        <button @click="exportCourse">Export Course</button>
      </div>
      <div class="right">
        <div class="stored">Stored Courses</div>
        <table>
          <tbody>
            <tr
            v-for="course in courses"
            :key="course.id"
            >
              <td>{{course.title}}</td>
              <td><button :disabled="course.id === activeId" @click="loadCourse(course.id)">Load</button></td>
              <td><button @click="deleteCourse(course.id)">Delete</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-show="tab === 'build'" class="pane build">
      <div class="left">
          <button class="w-100" :disabled="tool === 'select'" @click="updateTool('select')">Select</button>
          <button class="w-100" :disabled="tool === 'create'" @click="updateTool('create')">Create</button>
      </div>
      <div class="center">
        <button @click="rotateActive" v-show="tool === 'select' && activeObject">R</button>
        <button @click="rotateHelper" v-show="tool === 'create'">R</button>

        <button @click="deleteActive" v-show="tool === 'select' && activeObject">X</button>
      </div>
      <div class="right">
        <div v-show="tool === 'select'">
          <!-- Object Properties -->
          <table v-if="activeObject && !activeObject.entity">
            <tbody>
              <tr>
                <td><strong>General</strong></td>
              </tr>
              <tr>
                <td>ID</td>
                <td>{{activeObject.id}}</td>
              </tr>
              <tr>
                <td>Type</td>
                <td>{{activeObject.type}}</td>
              </tr>
              <tr>
                <td>Position</td>
                <td>{{activeObject.position}}</td>
              </tr>
              <tr>
                <td>Rotation</td>
                <td>{{activeObject.rotation.x}} {{(activeObject.rotation.y).toFixed(2)}} {{activeObject.rotation.z}}</td>
              </tr>
              <tr>
                <td><strong>Material</strong></td>
              </tr>
              <tr>
                <td>Color</td>
                <td>
                  <div class="color">
                    <button :style="{'background': activeObject.color }" @click="picker = !picker;"></button>
                    <chrome-picker v-if="picker" :value="activeObject.color" @input="setActiveColor($event)"></chrome-picker>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Texture</td>
                <td>
                  <select @change="setActiveTexture($event)">
                    <option disabled :selected="!activeObject.texture"/>
                    <option
                      v-for="texture in textures"
                      :key="texture.id"
                      :value="texture.id"
                      :selected="activeObject.texture === texture.id"
                    >{{texture.id}}
                    </option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
          <!-- Entity Properties -->
          <table v-if="activeObject && activeObject.entity">
            <tbody>
              <tr>
                <td><strong>General</strong></td>
              </tr>
              <tr>
                <td>ID</td>
                <td>{{activeObject.id}}</td>
              </tr>
              <tr>
                <td>Type</td>
                <td>{{activeObject.type}}</td>
              </tr>
              <tr>
                <td>Position</td>
                <td>{{activeObject.position}}</td>
              </tr>
              <tr>
                <td>Rotation</td>
                <td>{{(activeObject.rotation.x).toFixed(2)}} {{(activeObject.rotation.y).toFixed(2)}} {{(activeObject.rotation.z).toFixed(2)}}</td>
              </tr>
            </tbody>
          </table>

        </div>
        <div v-show="tool === 'create'">
          <div class="shapes">
            <div class="title">Objects</div>
            <div
              v-for="h in helpers"
              :key="h.id"
              @click="updateHelper({id: h.id, entity: false})"
              :class="[h.id === helper.id ? 'active' : '', 'helper']"
            >
              <img :src="'img/'+h.id+'.png'"/>
              <label>{{h.id}}</label>
            </div>
          </div>
          <div class="entities">
            <div class="title">Entities</div>
            <div
              v-for="e in entities"
              :key="e.id"
              @click="updateHelper({id: e.id, entity: true})"
              :class="[e.id === helper.id ? 'active' : '', 'helper']"
            >
              <img :src="'textures/'+e.id+'.png'"/>
              <label>{{e.id}}</label>
            </div>
          </div>
        </div>


      </div>
    </div>
    <div v-show="tab === 'materials'" class="pane materials">
        <div class="materials">
          <div
            v-for="texture in textures"
            :key="texture.id"
            class="material"
          >
            <img :src="'textures/'+texture.id+'.png'"/>
            <label>{{texture.id}}</label>
          </div>
        </div>
    </div>

  </div>
</template>

<script>
import { Chrome } from 'vue-color';
export default {
  name: 'Tools',
  data () {
    return {
      tab: 'course',
      courses: [],
      helpers: [{
        id: 'block'
      },{
        id: 'slope'
      },{
        id: 'corner'
      },{
        id: 'slopeCorner'
      },{
        id: 'wall'
      },{
        id: 'floor'
      },{
        id: 'wallSlope'
      },{
        id: 'half_block'
      },{
        id: 'half_slope'
      },{
        id: 'half_corner'
      },{
        id: 'half_slopeCorner'
      },{
        id: 'half_wall'
      },{
        id: 'block_hole'
      },{
        id: 'half_block_hole'
      },{
        id: 'floor_hole'
      }],
      entities: [{
        id: 'spawn',
        entity: true
      },{
        id: 'entity',
        entity: true
      },{
        id: 'point',
        entity: true
      },{
        id: 'hole',
        entity: true
      }],
      picker: false
    }
  },
  mounted () {
    this.getCourses();

    window.addEventListener('keypress', (e) => {
      switch (e.keyCode) {
        case 114:
          if (this.tool === 'create') {
            this.rotateHelper();
          } else if (this.tool === 'select' && this.activeObject) {
            this.rotateActive();
          }
          break;
        default:
          break;
      }
    })
  },
  computed: {
    courseId () {
      return this.$store.state.id;
    },
    title () {
      return this.$store.state.title;
    },
    tool () {
      return this.$store.state.tool;
    },
    helper () {
      return this.$store.state.helper;
    },
    helperRotation () {
      return this.$store.state.helperRotation;
    },
    activeObject () {
        return this.$store.state.objects.filter((o) => o.active)[0]
    },
    activeId () {
        return this.$store.state.id;
    },
    textures () {
      return this.$store.state.textures;
    },
    render () {
      return this.$store.state.render;
    }
  },
  methods: {
    updateTitle (e) {
      this.$store.commit('updateTitle', e.target.value);
    },
    updateTool (tool) {
      this.$store.commit('updateTool', tool);
    },
    updateHelper (helper) {
      this.$store.commit('updateHelper', helper);
    },
    rotateHelper () {
      this.$store.commit('rotateHelper');
    },
    rotateActive () {
      this.$store.commit('rotateActive');
    },
    deleteActive () {
      this.$store.commit('deleteActive');
    },
    setInactive () {
      this.$store.commit('setInactive');
    },
    setActiveColor (e) {
      this.$store.commit('setActiveColor', e);
    },
    setActiveTexture (e) {
      this.$store.commit('setActiveTexture', e.target.value);
    },
    saveCourse () {
      this.$store.commit('saveCourse');
      this.getCourses();
    },
    loadCourse (id) {
      this.$store.commit('loadCourse', id);
    },
    deleteCourse (id) {
      this.$store.commit('deleteCourse', id);
      this.getCourses();
    },
    exportCourse () {
      this.$store.commit('exportCourse');
    },
    getCourses () {
      if (localStorage.getItem('courses')) {
        try {
          const courses = JSON.parse(localStorage.getItem('courses'));
          this.courses = courses;
        } catch(e) {
          console.log('Error getting courses - Error parsing courses')
        }
      }
    },
    setRender (bool) {
      if (bool) {
        this.tab = null;
        this.updateTool(null);
        this.setInactive();
        this.$store.commit('setRender', true);
      } else {
        this.$store.commit('setRender');
      }
    }
  },
  components: {
    'chrome-picker': Chrome
  }
}
</script>