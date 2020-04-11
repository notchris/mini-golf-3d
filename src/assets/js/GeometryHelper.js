import {Vector2, Vector3, Shape, Path, ExtrudeGeometry} from 'three';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry';
export default class GeometryHelper {
    constructor(type) {
        this.type = type;
        this.geometry = null;
        let points = [];
        switch (this.type) {
            case 'half_block':
            case 'block':
                points = [
                  new Vector3( 1, 1, 1 ),
                  new Vector3( 1, 1, -1 ),
                  new Vector3( -1, 1, -1 ),
                  new Vector3( -1, 1, 1 ),
                  new Vector3( 1, -1, 1 ),
                  new Vector3( 1, -1, -1 ),
                  new Vector3( -1, -1, -1 ),
                  new Vector3( -1, -1, 1 )
                ];
                break;
            case 'half_slope':
            case 'slope':
                points = [
                  new Vector3( 0, 0, 0 ),
                  new Vector3( 0, 0, 0 ),
                  new Vector3( -1, 1, -1 ),
                  new Vector3( -1, 1, 1 ),
                  new Vector3( 1, -1, 1 ),
                  new Vector3( 1, -1, -1 ),
                  new Vector3( -1, -1, -1 ),
                  new Vector3( -1, -1, 1 )
                ];
                break;
            case 'half_corner':
            case 'corner':
                points = [
                  new Vector3( 0, 1, 0 ),
                  new Vector3( 1, 1, -1 ),
                  new Vector3( -1, 1, -1 ),
                  new Vector3( -1, 1, 1 ),
                  new Vector3( 0, -1, 0 ),
                  new Vector3( 1, -1, -1 ),
                  new Vector3( -1, -1, -1 ),
                  new Vector3( -1, -1, 1 ),
                ];
                break;
            case 'half_slopeCorner':
            case 'slopeCorner':
                points = [
                    new Vector3( 0, -1, 0 ),
                    new Vector3( 0, -1, 0 ),
                    new Vector3( -1, 1, -1 ),
                    new Vector3( 1, -1, -1 ),
                    new Vector3( -1, -1, -1 ),
                    new Vector3( -1, -1, 1 ),
                    new Vector3( 1, -1, 1 )
                ];
                break;
            case 'half_wall':
            case 'wall':
                points = [
                  new Vector3( 1, 1, 1 ),
                  new Vector3( 1, 1, -1 ),
                  new Vector3( -1, 1, -1 ),
                  new Vector3( -1, 1, 1 ),
                  new Vector3( 1, -1, 1 ),
                  new Vector3( 1, -1, -1 ),
                  new Vector3( -1, -1, -1 ),
                  new Vector3( -1, -1, 1 )
                ];
                break;
            case 'floor':
                points = [
                  new Vector3( 1, 1, 1 ),
                  new Vector3( 1, 1, -1 ),
                  new Vector3( -1, 1, -1 ),
                  new Vector3( -1, 1, 1 ),
                  new Vector3( 1, -1, 1 ),
                  new Vector3( 1, -1, -1 ),
                  new Vector3( -1, -1, -1 ),
                  new Vector3( -1, -1, 1 )
                ];
                break;
            default:
                break;
        }
        if (this.type === 'block_hole' || this.type === 'half_block_hole' || this.type === 'floor_hole') {
            const shape = new Shape()
            shape.moveTo( -1,-1 );
            shape.lineTo(-1, 1 );
            shape.lineTo( 1, 1 );
            shape.lineTo( 1, -1 );
            shape.lineTo(-1, -1);
            const holePath = new Path().moveTo(0,0).absarc(0, 0, 0.3, 0, Math.PI * 2, true);
            shape.holes.push(holePath);
            this.geometry = new ExtrudeGeometry(shape,{
              steps: 2,
              depth: 2,
              bevelEnabled: false,
            });
            this.geometry.rotateX(Math.PI/2);
            this.geometry.translate(0, 1, 0);
        } else {
            this.geometry = new ConvexGeometry(
                points
            );
        }

        if (this.type === 'half_block_hole') {
            this.geometry.scale(1, 0.5, 1);
            this.geometry.translate(0, -0.5, 0);
          }
        if (this.type === 'floor_hole') {
            this.geometry.scale(1, 0.1, 1);
            this.geometry.translate(0, -0.9, 0);
        }

        switch (this.type) {
            case 'half_block':
            case 'half_slope':
            case 'half_slopeCorner':
              this.geometry.scale(1, 0.5, 1);
              this.geometry.translate(0, -0.5, 0);
                break;
            case 'half_corner':
              this.geometry.scale(1, 0.2, 1);
              this.geometry.translate(0, -0.8, 0);
                break;
            case 'half_wall':
              this.geometry.scale(0.1, 0.2, 1);
              this.geometry.translate(-0.9, -0.8, 0);
                break;
            case 'wall':
              this.geometry.scale(0.1, 1, 1);
              this.geometry.translate(-0.9, 0, 0);
                break;
            case 'floor':
              this.geometry.scale(1, 0.1, 1);
              this.geometry.translate(0, -0.9, 0);
                break;
            default:
                break;
        }
        if (!this.geometry.boundingBox) this.geometry.computeBoundingBox();
        let sz = this.geometry.boundingBox.getSize(new Vector3());
        let min = this.geometry.boundingBox.min;
        if (this.geometry.faceVertexUvs[0].length == 0) {
            for (let i = 0; i < this.geometry.faces.length; i++) {
                this.geometry.faceVertexUvs[0].push([new Vector2(), new Vector2(), new Vector2()]);
            }
        }
        for (let j = 0; j < this.geometry.faces.length; j++) {
            let faceUVs = this.geometry.faceVertexUvs[0][j]
            let va = this.geometry.vertices[this.geometry.faces[j].a]
            let vb = this.geometry.vertices[this.geometry.faces[j].b]
            let vc = this.geometry.vertices[this.geometry.faces[j].c]
            let vab = new Vector3().copy(vb).sub(va)
            let vac = new Vector3().copy(vc).sub(va)
            let vcross = new Vector3().copy(vab).cross(vac);
            vcross.set(Math.abs(vcross.x), Math.abs(vcross.y), Math.abs(vcross.z))
            let majorAxis = vcross.x > vcross.y ? (vcross.x > vcross.z ? 'x' : vcross.y > vcross.z ? 'y' : vcross.y > vcross.z) : vcross.y > vcross.z ? 'y' : 'z'
            let uAxis = majorAxis == 'x' ? 'y' : majorAxis == 'y' ? 'x' : 'x';
            let vAxis = majorAxis == 'x' ? 'z' : majorAxis == 'y' ? 'z' : 'y';
            faceUVs[0].set((va[uAxis] - min[uAxis]) / sz[uAxis], (va[vAxis] - min[vAxis]) / sz[vAxis])
            faceUVs[1].set((vb[uAxis] - min[uAxis]) / sz[uAxis], (vb[vAxis] - min[vAxis]) / sz[vAxis])
            faceUVs[2].set((vc[uAxis] - min[uAxis]) / sz[uAxis], (vc[vAxis] - min[vAxis]) / sz[vAxis])
        }
        this.geometry.elementsNeedUpdate = this.geometry.verticesNeedUpdate = true;
        this.geometry.uvsNeedUpdate = true;
        return this.geometry;
    }
}