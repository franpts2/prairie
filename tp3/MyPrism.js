import { CGFobject } from '../lib/CGF.js';
/**
 * MyPrism
 * @constructor
 * @param scene - Reference to MyScene object
 * @param slices - number of divisions around the Y axis
 */
export class MyPrism extends CGFobject {
    constructor(scene, slices, stacks) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        this.initBuffers();
    }
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];

        var alphaAng = 2 * Math.PI / this.slices;
        var stackStep = 1.0 / this.stacks;

        for (var j = 0; j < this.stacks; j++) {
            var ang = 0;
            var z1 = j*stackStep;       //start of curr stack
            var z2 = (j+1)*stackStep;   //end of curr stack


            for (var i = 0; i < this.slices; i++) {
                var sa = Math.sin(ang);
                var saa = Math.sin(ang + alphaAng);
                var ca = Math.cos(ang);
                var caa = Math.cos(ang + alphaAng);

                // VERTICES
                this.vertices.push(ca, -sa, z1);    //0
                this.vertices.push(caa, -saa, z1);  //1
                this.vertices.push(ca, -sa, z2);    //2
                this.vertices.push(caa, -saa, z2);  //3
                
                // INDICES
                var baseIndex = 4 * (j * this.slices + i)

                // this.indices.push(baseIndex, (baseIndex+1), (baseIndex+2));      // 0, 1, 2
                this.indices.push((baseIndex+2), (baseIndex+1), baseIndex);         // 2, 1, 0
                this.indices.push((baseIndex+2), (baseIndex+3), (baseIndex+1));     // 2, 3, 1
                // this.indices.push((baseIndex+3), (baseIndex+2), (baseIndex+1));  // 1, 3, 2

                // NORMALS
                var midAng = ang + alphaAng / 2; //perpendical to the face------
                var nx = Math.cos(midAng);
                var ny = -Math.sin(midAng);

                this.normals.push(nx, ny, 0);
                this.normals.push(nx, ny, 0);
                this.normals.push(nx, ny, 0);
                this.normals.push(nx, ny, 0);

                ang += alphaAng;
            }   
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