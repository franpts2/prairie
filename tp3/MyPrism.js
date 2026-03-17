import { CGFobject } from '../lib/CGF.js';
/**
 * MyPrism
 * @constructor
 * @param scene - Reference to MyScene object
 * @param slices - number of divisions around the Y axis
 */
export class MyPrism extends CGFobject {
    constructor(scene, slices) {
        super(scene);
        this.slices = slices;
        this.initBuffers();
    }
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];

        var ang = 0;
        var alphaAng = 2 * Math.PI / this.slices;

        for (var i = 0; i < this.slices; i++) {
            var sa = Math.sin(ang);
            var saa = Math.sin(ang + alphaAng);
            var ca = Math.cos(ang);
            var caa = Math.cos(ang + alphaAng);

            
            this.vertices.push(ca, -sa, 0); //0
            this.vertices.push(caa, -saa, 0); //1
            this.vertices.push(ca, -sa, 1);  //2
            this.vertices.push(caa, -saa, 1); //3
            

            // this.indices.push(4*i, (4*i+1), (4*i+2)); // 0, 1, 2
            this.indices.push((4*i+2), (4*i+1), 4*i); // 2, 1, 0
            this.indices.push((4*i+2), (4*i+3), (4*i+1)); // 2, 3, 1
            // this.indices.push((4*i+3), (4*i+2), (4*i+1)); // 1, 3, 2

            
            // normals
            var midAng = ang + alphaAng / 2; //perpendical to the face------
            var nx = Math.cos(midAng);
            var ny = -Math.sin(midAng);

            this.normals.push(nx, ny, 0);
            this.normals.push(nx, ny, 0);
            this.normals.push(nx, ny, 0);
            this.normals.push(nx, ny, 0);

            ang += alphaAng;
        }


        //The defined indices (and corresponding vertices)
        //will be read in groups of three to draw triangles
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    updateBuffers(complexity) {
        this.slices = 3 + Math.round(9 * complexity);

        this.initBuffers();
        this.initNormalVizBuffers();
    }
}