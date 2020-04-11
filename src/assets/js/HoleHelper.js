import * as THREE from 'three';
import * as CANNON from 'cannon-es';
//import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry';
export default class HoleHelper {
    constructor() {
        this.geometry = null;

        const shape = new THREE.Shape()
        shape.moveTo( -1,-1 );
        shape.lineTo(-1, 1 );
        shape.lineTo( 1, 1 );
        shape.lineTo( 1, -1 );
        shape.lineTo(-1, -1);
        const holePath = new THREE.Path().moveTo(0,0).absarc(0, 0, 0.3, 0, Math.PI * 2, true);
        shape.holes.push(holePath);
        this.geometry = new THREE.ExtrudeGeometry(shape,{
          steps: 2,
          depth: 0.5,
          bevelEnabled: false,
        });
        const material = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, flatShading: true, side: THREE.DoubleSide });
        this.mesh = new THREE.Mesh(this.geometry, material);
        this.mesh.rotation.x += Math.PI/2;
        this.mesh.position.y += 0.5;

        const verts = [], faces = [], norms = [];

        for(let i = 0; i < this.geometry.vertices.length; i++){
            let v = this.geometry.vertices[i];
            verts.push(new CANNON.Vec3(v.x * 1.0, v.y * 1.0, v.z * 1.0));
        }
    
        for(let i = 0; i < this.geometry.faces.length; i++){
            let f = this.geometry.faces[i];
            faces.push([f.a, f.b, f.c]);
            norms.push(new CANNON.Vec3( f.normal.x, f.normal.y, f.normal.z));
        }

        let convexShape = new CANNON.ConvexPolyhedron({
          vertices: verts,
          faces: faces,
          normals: norms
        });
        this.body = new CANNON.Body({mass: 0});
        this.body.position.copy(this.mesh.position)
        this.body.quaternion.copy(this.mesh.quaternion)
        this.body.addShape(convexShape);
        return this;
    }
}