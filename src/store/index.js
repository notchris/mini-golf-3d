import Vue from 'vue';
import Vuex from 'vuex';
import { v4 as uuidv4 } from 'uuid';
import {Euler, Vector3} from 'three';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    render: false,
    id: uuidv4(),
    title: 'Untitled Course',
    tee: new Vector3(0, 0, 0),
    hole: new Vector3(0, 0, 0),
    objects: [],
    textures: [{
      id: 'brick'
    },{
      id: 'fairway'
    },{
      id: 'entity'
    },{
      id: 'spawn'
    },{
      id: 'point'
    },{
      id: 'hole'
    }],
    tool: null,
    helper: {
      id: 'block',
      entity: false
    },
    helperRotation: new Euler(0, 0, 0)
  },
  mutations: {
    setRender (state, bool) {
      if (bool) {
        state.render = true;
      } else {
        state.render = false;
      }
    },
    updateTitle (state, title) {
      state.title = title;
    },
    updateTool (state, tool) {
      state.tool = tool;
    },
    updateHelper (state, helper) {
      state.helper = helper;
    },
    rotateHelper (state) {
      let v = state.helperRotation.y + Math.PI / 2;
      state.helperRotation = new Euler(0, v, 0);
    },
    rotateActive (state) {
      let active = state.objects.filter((o) => o.active);
      if (active.length) {
        let v = active[0].rotation.y + Math.PI / 2;
        active[0].rotation = new Euler(0, v, 0);
      }

    },
    addObject (state, o) {
      let dupe = false;
      for (let i = 0; i < state.objects.length; i++) {
        if (
          state.objects[i].position === `${o.position.x} ${o.position.y} ${o.position.z}` &&
          state.objects[i].rotation === o.rotation &&
          state.objects[i].type === o.type
        ) {
          console.log('Not ok')
          dupe = true;
          return;
        }
      }
      if (!dupe) {
        let uid = uuidv4();
        // Push object to state
        state.objects.push({
          id: uid,
          type: o.type,
          entity: o.entity,
          position: `${o.position.x} ${o.position.y} ${o.position.z}`,
          rotation: o.rotation,
          active: false,
          color: '#CCCCCC',
          texture: null
        });
      }
    },
    deleteActive (state) {
      state.objects.forEach((o, i) => {
        if (o.active) {
          state.objects.splice(i, 1);
        }
      })
    },
    setActive (state, id) {
      let o = state.objects.filter((o) => o.id === id);
      if (o.length) {
        o[0].active = true;
      }
    },
    setInactive (state) {
      state.objects.forEach((o) => o.active = false);
    },
    setActiveColor (state, color) {
      let active = state.objects.filter((o) => o.active);
      if (active.length) {
        active[0].color = color.hex;
      }
    },
    setActiveTexture (state, texture) {
      let active = state.objects.filter((o) => o.active);
      if (active.length) {
        active[0].texture = texture;
      }
    },
    saveCourse (state) {
      if (localStorage.getItem('courses')) {
        try {
          const courses = JSON.parse(localStorage.getItem('courses'));
          let existing = courses.filter((course) => course.id === state.id);
          if (existing.length) {
            let index = courses.indexOf(existing[0])
            courses[index] = {
              id: state.id,
              title: state.title,
              tee: state.tee,
              hole: state.hole,
              objects: state.objects
            }
            const parsed = JSON.stringify(courses);
            localStorage.setItem('courses', parsed);
            console.log('Existing course saved.');
          } else {
            courses.push({
              id: state.id,
              title: state.title,
              tee: state.tee,
              hole: state.hole,
              objects: state.objects
            })
            const parsed = JSON.stringify(courses);
            localStorage.setItem('courses', parsed);
            console.log('New course saved.');
          }
        } catch(e) {
          console.log('Error saving course - Could not parse courses')
        }
      } else {
        const parsed = JSON.stringify([{
          id: state.id,
          title: state.title,
          tee: state.tee,
          hole: state.hole,
          objects: state.objects
        }]);
        localStorage.setItem('courses', parsed);
        console.log('New course saved');
      }
    },
    loadCourse (state, id) {
      if (localStorage.getItem('courses')) {
        try {
          const courses = JSON.parse(localStorage.getItem('courses'));
          const c = courses.filter((c) => c.id === id);
          c[0].objects.forEach((o) => {
            o.rotation = new Euler(o.rotation._x, o.rotation._y, o.rotation._z)
          })
          if (c.length) {
            state.id = c[0].id;
            state.title = c[0].title;
            state.objects = c[0].objects;
          }
        } catch (e) {
          console.log('Error loading course - Could not parse courses.')
        }
      }
    },
    deleteCourse (state, id) {
        if (localStorage.getItem('courses')) {
          try {
            const courses = JSON.parse(localStorage.getItem('courses'));
            let existing = courses.filter((course) => course.id === id);
            if (existing.length) {
              let index = courses.indexOf(existing[0]);
              courses.splice(index, 1);

              const parsed = JSON.stringify(courses);
              localStorage.setItem('courses', parsed);
              console.log('Course deleted.');
            } else {
              console.log('Error deleting course - Course does not exist.')
            }
          } catch (e) {
            console.log('Error deleting course - Could not parse courses')
          }
      }
    },
    exportCourse (state) {
      const parsed = JSON.stringify([{
        id: state.id,
        title: state.title,
        tee: state.tee,
        hole: state.hole,
        objects: state.objects
      }]);
      const data = "data:text/json;charset=utf-8," + encodeURIComponent(parsed);
      const anchor = document.createElement('a');
      anchor.setAttribute("href",data);
      anchor.setAttribute("download", `${state.title}.json`);
      anchor.click();
    }
  }
});
