import { CGFobject } from '../lib/CGF.js';
/**
 * MyPrism
 * @constructor
 * @param scene - Reference to MyScene object
 * @param slices - number of divisions around the Y axis
 */
export class MyCylinder extends CGFobject {
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

        for (var j = 0; j <= this.stacks; j++) {
            var z = j * stackStep;
            for (var i = 0; i <= this.slices; i++) {
                var ang = i * alphaAng;
                var x = Math.cos(ang);
                var y = -Math.sin(ang);
                this.vertices.push(x, y, z);

                this.normals.push(x, y, 0);
            }
        }

        for (var j = 0; j < this.stacks; j++) {
            for (var i = 0; i < this.slices; i++) {
                var current = j * (this.slices + 1) + i;
                var next = current + this.slices + 1;

                this.indices.push(current, next, next + 1);
                this.indices.push(current, next + 1, current + 1);
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