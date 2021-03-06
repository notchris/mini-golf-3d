import * as THREE from 'three';
import CameraControls from 'camera-controls';
import * as CANNON from 'cannon-es';
import Sky from './Sky';
import GolfBall from './GolfBall';
import GolfHole from './GolfHole';
import GeometryHelper from './GeometryHelper';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader';
CameraControls.install( { THREE: THREE } );

const loader = new FBXLoader();
const clock = new THREE.Clock();

const textures = [{
    id: 'fairway',
    texture: new THREE.TextureLoader().load( 'textures/fairway.png' ),
    anisotropy: 16
}];

const wallMaterial = new CANNON.Material();

export default class Game {
    constructor(element, objects) {
        this.element = element;
        this.bodies = [];
        this.meshes = [];

        // Defaults
        this.ground = null;
        this.groundMesh = null;
        this.ball = null;
        this.tempDir = new THREE.Vector3();

        // Spawn
        this.spawn = new THREE.Vector3(0, 0, 0);
        this.spawnDirection = new THREE.Vector3(0, 0, 0);

        // Hole
        this.holePosition = null;

        // Camera Goal
        this.tempVector = new THREE.Vector3();

        // Helpers
        this.arrowHelper = null;

        // Raycast
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();

        // World
        this.world = new CANNON.World();
        this.world.gravity.set(0,-10,0);
        this.world.defaultContactMaterial.contactEquationStiffness = 1e7;
        this.world.defaultContactMaterial.contactEquationRelaxation = 4;
        this.world.solver.iterations = 8;

        // Render, Scene, Camera
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.scene = new THREE.Scene()
        this.scene.fog = new THREE.FogExp2(0xFFFFFF, 0.03);
        this.camera = new THREE.PerspectiveCamera(75, document.querySelector('#test').getBoundingClientRect().width / document.querySelector('#test').getBoundingClientRect().height, 0.1, 10000);
        this.scene.add(this.camera);

        this.cameraControls = new CameraControls(this.camera, this.renderer.domElement );

        // Light, Shadows
        this.light = new THREE.AmbientLight(0xF1F1F1, 0.7);
        this.scene.add(this.light);
        this.dlight = new THREE.DirectionalLight(0xEEEEEE, 0.5);
        this.dlight.position.y = 5;
        this.dlight.position.multiplyScalar( 1.5 );
        this.dlight.castShadow = true;
        var d = 50;

        this.dlight.shadow.camera.left = - d;
        this.dlight.shadow.camera.right = d;
        this.dlight.shadow.camera.top = d;
        this.dlight.shadow.camera.bottom = - d;

        this.dlight.shadow.camera.far = 1000;
        this.scene.add(this.dlight);


        // Ground
        this.groundMesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(100, 100),
            new THREE.MeshBasicMaterial({
                color: '#5F7430',
                side: THREE.DoubleSide
            })
        );
        this.scene.add(this.groundMesh);
        this.groundMesh.geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        this.groundMesh.visible = false;
        
        // Object container
        this.obj = new THREE.Object3D();

        // Create objects
        this.parseObjects(objects);
        this.scene.add(this.obj);
        this.bounds = new THREE.Box3().setFromObject(this.obj);
        
        // Create Hole / Flag
        const hole = new GolfHole(this.holePosition);
        this.world.addBody(hole.sensor);
        this.scene.add(hole.object);
        this.scene.add(hole.holeMesh);

        // Sky
        const sky = new Sky(500);
        this.scene.add(sky);

        // Ball
        this.ball = new GolfBall(0.12, this.spawn);
        this.world.addBody(this.ball.body);
        this.scene.add(this.ball.mesh);
        
        // Ball Physics
        const materialTest = new CANNON.ContactMaterial(wallMaterial, this.ball.physics, { friction: 0.0, restitution: 0.7 });
        this.world.addContactMaterial(materialTest);
    
        
        // Set Camera
        this.cameraControls.setLookAt(
            this.spawn.x,
            this.spawn.y,
            this.spawn.z,
            this.spawnDirection.x,
            this.spawnDirection.y, 
            this.spawnDirection.z,
            false
        )
        this.cameraControls.rotateTo( 0, 0, false);
        this.cameraControls.fitTo( this.bounds, true, { paddingTop: 4, paddingLeft: 4, paddingBottom: 4, paddingRight: 4 } )
        this.cameraControls.rotate( 0, 30 * THREE.Math.DEG2RAD, true );


        // Render
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(document.querySelector('#test').getBoundingClientRect().width, document.querySelector('#test').getBoundingClientRect().height);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.shadowMap.width = 1024;
        this.renderer.shadowMap.height = 1024;
        document.querySelector('#test').appendChild(this.renderer.domElement);

        // Renderer Mouse move
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            this.mouse.set(
                (event.clientX / document.querySelector('#test').getBoundingClientRect().width) * 2 - 1,
                -(event.clientY / document.querySelector('#test').getBoundingClientRect().height) * 2 + 1
            );
        });

        this.renderer.domElement.addEventListener('click', () => {
            this.ball.hit(this.tempDir, 20);
        })

        // window resize event
        window.addEventListener('resize', () => {
            this.resize();
        })

        // animate
        this.animate = this.animate.bind(this);
        this.animate();
    }

    loadCharacter (position) {
        loader.load('./models/characterMedium.fbx', (object) => {
            object.scale.set(0.005, 0.005, 0.005);
            object.position.copy(position);
            object.translateY(-0.8);
            object.rotation.y += Math.PI/2;
            object.children[0].material = new THREE.MeshToonMaterial({
                map: new THREE.TextureLoader().load('./models/survivorMaleB.png')
            })
            object.children[0].material.skinning = true;
            object.children[0].castShadow = true;
            
            //object.children[0].material.map = new THREE.TextureLoader().load('./models/survivorMaleB.png')
            this.scene.add(object)
        });
    }

    parseObjects (objects) {
        objects.forEach((object) => {
            if (object.entity) {
                let s, p, h;
                switch (object.type) {
                    // Set Spawn from entity
                    case 'spawn':
                        s = object.position.split(' ');
                        this.spawn = new THREE.Vector3(parseFloat(s[0]), parseFloat(s[1]), parseFloat(s[2]))
                        this.loadCharacter(this.spawn);
                        break;
                    case 'point':
                        p = object.position.split(' ');
                        this.spawnDirection = new THREE.Vector3(parseFloat(p[0]), parseFloat(p[1]), parseFloat(p[2]))
                        break;
                    case 'hole':
                        h = object.position.split(' ');
                        this.holePosition = new THREE.Vector3(parseFloat(h[0]), parseFloat(h[1]), parseFloat(h[2]))
                        break;
                    default:
                        break;
                }
            } else {
                let s = object.position.split(' ');
                let pos = new THREE.Vector3(parseFloat(s[0]), parseFloat(s[1]), parseFloat(s[2]))
                let geometry = new GeometryHelper(object.type);
                
                switch (object.type) {
                    case 'block_hole':
                        geometry = new GeometryHelper('block');
                        break;
                    case 'half_block_hole':
                        geometry = new GeometryHelper('half_block');
                        break;
                    case 'floor_hole':
                        geometry = new GeometryHelper('floor');
                        break;
                    default:
                        break;
                }
                let g = geometry.clone();
                let verts = g.vertices.map((v) => new CANNON.Vec3(v.x, v.y, v.z));
                let faces = g.faces.map((f) => [f.a, f.b, f.c]);
                let shape = new CANNON.ConvexPolyhedron({
                    vertices: verts,
                    faces: faces
                });
                shape.collisionFilterGroup = 1;
                shape.collisionFilterMask = -1;
                let physicsMat;
                if (object.type === 'wall' || object.type === 'half_wall') {
                    physicsMat = wallMaterial
                } else {
                    physicsMat = null;
                }
                let body = new CANNON.Body({ mass: 0, material: physicsMat });
                body.addShape(shape);
                body.position.copy(pos);
                let r = new THREE.Quaternion().setFromEuler(object.rotation)
                body.quaternion.copy(r);
                this.world.addBody(body);
                this.bodies.push(body);
                let mat = new THREE.MeshToonMaterial({
                    color: '#EEEEEE',
                    map: textures.filter((t) => t.id === object.texture).length ?
                    textures.filter((t) => t.id === object.texture)[0].texture : null
                })
                if (object.type === 'half_wall' ||
                    object.type === 'wall'
                ) {
                    mat.polygonOffset = true;
                    mat.polygonOffsetFactor = -0.1;
                }
                switch (object.type) {
                    case 'block_hole':
                        g = new GeometryHelper('block_hole');
                        break;
                    case 'half_block_hole':
                        g = new GeometryHelper('half_block_hole');
                        break;
                    case 'floor_hole':
                        g = new GeometryHelper('floor_hole');
                        break;
                    default:
                        break;
                }


                let mesh = new THREE.Mesh(
                    g,
                    mat
                );

                mesh.castShadow = true;
                mesh.receiveShadow = true;
                this.obj.add(mesh);
                mesh.position.copy(pos)
                this.meshes.push(mesh);
            }
        });
    }

    rayCast () {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        let intersects = this.raycaster.intersectObject(this.groundMesh);
        if (intersects.length > 0) {
            let v = new THREE.Vector3().copy(intersects[0].point).add(intersects[0].face.normal);
            this.updateArrow(v);
        }
    }

    resize () {
        this.camera.aspect = document.querySelector('#test').getBoundingClientRect().width / document.querySelector('#test').getBoundingClientRect().height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(document.querySelector('#test').getBoundingClientRect().width, document.querySelector('#test').getBoundingClientRect().height);
    }

    updateArrow (target) {
        if (!this.ball) return;
        target.y = this.ball.mesh.position.y;
        this.tempDir = new THREE.Vector3();
        this.tempDir.subVectors(target, this.ball.mesh.position).normalize();

        if (this.arrowHelper) {
            this.scene.remove(this.arrowHelper);
            this.arrowHelper = null;
        }
        // Hide arrow if ball moving
        if (this.ball.moving) return;
        this.arrowHelper = new THREE.ArrowHelper(
            this.tempDir,
            new THREE.Vector3().copy(this.ball.mesh.position),
            1,
            0xff0000,
            0.25,
            0.25
        );
        this.scene.add(this.arrowHelper);
    }

    updatePhysics () {
        this.world.step(1/60);
        this.ball.mesh.position.copy(this.ball.body.position);
        this.ball.mesh.quaternion.copy(this.ball.body.quaternion);

        this.meshes.forEach((m, i) => {
            m.position.copy(this.bodies[i].position);
            m.quaternion.copy(this.bodies[i].quaternion);
        });

        if (this.ball.body.velocity.x < 0.05 && this.ball.body.velocity.z < 0.05) {
            this.ball.moving = false;
        } else {
            this.ball.moving = true;
        }
    }

    render () {
        this.rayCast();
        const delta = clock.getDelta();
        this.cameraControls.update( delta );
        this.renderer.render(this.scene, this.camera);
    }

    animate () {
        if (!this.scene) return;
        requestAnimationFrame(this.animate);
        this.updatePhysics();
        this.render();
    }

    destroy () {
        cancelAnimationFrame(this.animate);
        this.scene = null;
    }
}