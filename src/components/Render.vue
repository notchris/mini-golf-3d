<template>
<div class="container">
    <vgl-renderer
        v-show="!render"
        ref="renderer" 
        :antialias="true"
        scene="scene"
        camera="camera"
        class="render"
    >
    <!-- Geometries -->
    <vgl-convex-geometry type="block" name="block"></vgl-convex-geometry>
    <vgl-convex-geometry type="slope" name="slope"></vgl-convex-geometry>
    <vgl-convex-geometry type="corner" name="corner"></vgl-convex-geometry>
    <vgl-convex-geometry type="slopeCorner" name="slopeCorner"></vgl-convex-geometry>

    <vgl-convex-geometry type="wall" name="wall"></vgl-convex-geometry>
    <vgl-convex-geometry type="floor" name="floor"></vgl-convex-geometry>
    <vgl-convex-geometry type="wallSlope" name="wallSlope"></vgl-convex-geometry>
    <vgl-convex-geometry type="half_block" name="half_block"></vgl-convex-geometry>
    <vgl-convex-geometry type="half_slope" name="half_slope"></vgl-convex-geometry>
    <vgl-convex-geometry type="half_corner" name="half_corner"></vgl-convex-geometry>
    <vgl-convex-geometry type="half_slopeCorner" name="half_slopeCorner"></vgl-convex-geometry>
    <vgl-convex-geometry type="half_wall" name="half_wall"></vgl-convex-geometry>

    <vgl-convex-geometry type="block_hole" name="block_hole"></vgl-convex-geometry>
    <vgl-convex-geometry type="half_block_hole" name="half_block_hole"></vgl-convex-geometry>
    <vgl-convex-geometry type="floor_hole" name="floor_hole"></vgl-convex-geometry>

    <vgl-plane-geometry
        :width="100"
        :height="100"
        name="plane"
    />
    <!-- Textures -->
    <vgl-texture
        v-for="texture in textures"
        :key="texture.id"
        :src="`/textures/${texture.id}.png`"
        :name="texture.id"
    />

    <!-- Material -->
    <vgl-mesh-lambert-material color="#FF0000" name="helperMaterial"/>

    <vgl-mesh-standard-material
        v-for="o in objects"
        :key="'material_'+o.id"
        :name="'material_'+o.id"
        :map="o.texture"
        color="#CCCCCC"
        wrap-s="repeat"
        wrap-t="repeat"
        repeat="4 4"
        side="double"
    />

    <vgl-sprite-material name="material_spawn" map="spawn" />
    <vgl-sprite-material name="material_entity" map="entity" />
    <vgl-sprite-material name="material_point" map="point" />
    <vgl-sprite-material name="material_hole" map="hole" />

    <vgl-scene ref="scene" name="scene">
        <vgl-ambient-light :color="`#606060`" :intensity="0.6" />
        <vgl-directional-light ref="dlight" :color="`#FFFFFF`" cast-shadow />
        <vgl-grid-helper :size="100" :divisions="50"/>

        <vgl-object3d
            ref="helper"
            :position="helperPosition"
            :rotation="helperRotation"
        >
            <vgl-mesh
                v-if="!helper.entity"
                :geometry="helper.id"
                material="helperMaterial"
            />
            <vgl-sprite
                v-if="helper.entity"
                :material="`material_${helper.id}`"
            ></vgl-sprite>

        </vgl-object3d>



        <vgl-group ref="group">
            <vgl-mesh name="plane" ref="plane" geometry="plane"/>
            <vgl-group
                v-for="o in objects"
                :key="o.id"
            >
                <vgl-mesh
                    v-if="!o.entity"
                    :name="o.id"
                    :geometry="o.type"
                    :position="o.position"
                    :rotation="o.rotation"
                    :material="'material_'+o.id"
                    :ref="'mesh_'+o.id"
                ></vgl-mesh>
                <!-- Single entity group -->
                <vgl-group v-if="o.entity">
                    <vgl-object3d
                        :position="o.position"
                        :rotation="o.rotation"
                    >
                    <vgl-sprite
                        :name="o.id"
                        :material="'material_'+o.type"
                        :ref="'sprite_'+o.id"
                    ></vgl-sprite>

                    <!-- Spawn -->
                    <vgl-arrow-helper
                    v-if="o.type === 'spawn'"
                    color="#FFFF00"
                    :dir="`1 0 0`"
                    :length="2"
                    :head-length="0.2"
                    :head-width="0.2"
                    />


                    </vgl-object3d>
                </vgl-group>
                <!-- End single entity group -->
            </vgl-group>
        </vgl-group>

        <vgl-group>
            <vgl-box-helper
                v-for="o in objects"
                :key="'helper_'+o.id"
                :object="o.id"
                :hidden="!o.active"
            />
        </vgl-group>

    </vgl-scene>

    <vgl-perspective-camera :near="0.1" :far="2000000" :fov="45" ref="camera" name="camera" :position="'20, 15, 20'"></vgl-perspective-camera>
    </vgl-renderer>
    <Test v-if="render"></Test>
</div>
</template>

<script>
import * as THREE from 'three';
import OrbitControls from 'orbit-controls-es6';
import Test from './Test';
//import ShaderToyMaterial from 'three-shadertoy-material';

export default {
  name: 'Render',
  data () {
      return {
        mouse: new THREE.Vector2(),
        raycaster: new THREE.Raycaster(),
        plane: null,
        helperPosition: "0 0 0",
        tempVector: new THREE.Vector3()
      }
  },
  watch: {
      tool (v) {
          switch (v) {
              case null: 
                  this.$refs.helper.inst.visible = false;
                break;
              case 'select':
                  this.$refs.helper.inst.visible = false;
                  break;
              case 'create':
                  this.$store.commit('setInactive');
                  this.$refs.helper.inst.visible = true;
                  break;
              default:
                  break;
          }
          this.$refs.renderer.requestRender();
      },
      helperRotation (v) {
          this.$refs.helper.inst.rotation.set(v);
          this.$refs.renderer.requestRender();
      },
    objects: {
        handler: function () {
            let o = []
            Object.keys(this.$refs).forEach((key) => {
                if (key.includes('mesh')) {
                    o.push(this.$refs[key])
                }
            })
            o.forEach((m) => {
                if (m[0]) {
                    m[0].inst.material.needsUpdate = true
                }
                
            })
            this.$refs.renderer.requestRender();
        },
        deep: true
    }
  },
  mounted () {
    this.$refs.plane.inst.geometry.rotateX(-Math.PI / 2);
    this.$refs.plane.inst.visible = false;

    this.$refs.helper.inst.visible = false;

    this.$refs.camera.inst.lookAt(0, 0, 0);
    this.$refs.dlight.inst.position.set(1, 0.75, 0.5).normalize();
    this.controls = new OrbitControls(this.$refs.camera.inst, this.$refs.renderer.inst.domElement);
    this.controls.addEventListener('change', () => {
        this.$refs.renderer.requestRender();
    });
    this.controls.mouseButtons.ORBIT = 2;

    this.$refs.renderer.inst.domElement.addEventListener('mousedown', (e) => {
        this.mouseDown(e);
    });
    this.$refs.renderer.inst.domElement.addEventListener('mousemove', (e) => {
        this.mouseMove(e);
    });
    this.$refs.renderer.inst.domElement.addEventListener('mouseup', (e) => {
        this.mouseUp(e);
    });
    this.$refs.renderer.inst.domElement.addEventListener('mouseleave', (e) => {
        this.mouseUp(e);
    });

  },
  methods: {
      mouseDown (e) {
        if (!this.tool || e.button !== 0) return;
        let intersects = this.raycaster.intersectObjects(this.$refs.group.inst.children, true);
        if (intersects.length > 0) {
            if (intersects[0].object.name !== 'plane') {
                if (this.tool === 'select') {
                    let o = intersects[0].object;
                    this.$store.commit('setInactive');
                    this.$store.commit('setActive', o.name);
                }
            } else {
                this.$store.commit('setInactive');
            }
            if (this.tool === 'create') {
                this.$store.commit('addObject', {
                    type: this.helper.id,
                    position: this.tempVector,
                    entity: this.helper.entity,
                    rotation: this.helperRotation
                });
            }
        } else {
            this.$store.commit('setInactive');
        }
      },
      mouseMove (e) {
        if (!this.tool) return;
        this.mouse.set(
            (e.clientX / this.$refs.renderer.inst.domElement.getBoundingClientRect().width) * 2 - 1,
            -(e.clientY / this.$refs.renderer.inst.domElement.getBoundingClientRect().height) * 2 + 1
        );
        this.raycaster.setFromCamera(this.mouse, this.$refs.camera.inst);
        let intersects = this.raycaster.intersectObjects(this.$refs.group.inst.children, true);
        let intersect;
        if (intersects.length > 0) {
            intersect = intersects[0];
            if (intersect.object instanceof THREE.Mesh) {
                this.tempVector = new THREE.Vector3();
                this.tempVector.copy(intersect.point).add(intersect.face.normal);
                this.tempVector.divideScalar(2).floor().multiplyScalar(2).addScalar(1);
                this.helperPosition = `${this.tempVector.x} ${this.tempVector.y} ${this.tempVector.z}`;
            }
        } else {
            intersect = null;
        }

      },
      mouseUp (e) {
          if (!this.tool || e.button !== 0) return;
      }
  },
  computed: {
      objects () {
          return this.$store.state.objects;
      },
      entities () {
          return this.$store.state.entities;
      },
      helper () {
          return this.$store.state.helper;
      },
      helperRotation () {
          return this.$store.state.helperRotation;
      },
      tool () {
          return this.$store.state.tool;
      },
      textures () {
          return this.$store.state.textures;
      },
      render () {
          return this.$store.state.render;
      }
  },
  components: {
      Test
  }
}
</script>