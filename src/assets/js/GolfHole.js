import { ConvexPolyhedron, Body, Vec3 } from 'cannon-es';
import GeometryHelper from './GeometryHelper';
import * as THREE from 'three';

export default class GolfHole {
    constructor (position) {
        this.position = position;
        this.object = new THREE.Object3D();

        // Pole
        this.pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 2.5, 16, 16),
            new THREE.MeshToonMaterial({color: 0xBBBBBB})
        );
        this.pole.translateY(0.4)

        // Flag
        this.flag = new THREE.Mesh(
            new THREE.PlaneGeometry(1.25, 0.7, 1, 1),
            new THREE.MeshToonMaterial({color: 0xff0000})
        );
        this.flag.rotation.y = -Math.PI/2;
        this.flag.position.y = 1.25;
        this.flag.position.z += 0.7;
        
        // Base (Mask)
        this.base = new THREE.Mesh(
            new THREE.BoxBufferGeometry(1, 0.5, 1),
            new THREE.MeshStandardMaterial({color: 0x000000})
        );
        this.base.translateY(-1.2);

        // Hole Mesh & Convex Geometry
        const g = new GeometryHelper('hole').clone();
        this.holeMesh = new THREE.Mesh(
            g,
            new THREE.MeshPhongMaterial({color: 0x00ff00})
        );
        this.holeMesh.position.copy(this.position);

        // CANNON Body (based on hole type)
        const verts = g.vertices.map((v) => new  Vec3(v.x, v.y, v.z));
        const faces = g.faces.map((f) => [f.a, f.b, f.c]);
        const shape = new ConvexPolyhedron({
            vertices: verts,
            faces: faces
        });
        shape.collisionFilterGroup = 1;
        shape.collisionFilterMask = -1;

        this.sensor = new Body({ mass: 0 });
        this.sensor.addShape(shape);
        this.sensor.position.copy(this.position);
        this.sensor.id = 'hole';

        // Add parts to object
        this.object.add(this.pole, this.flag, this.base);
        this.object.position.copy(this.position);
        

        return this;
    }
}