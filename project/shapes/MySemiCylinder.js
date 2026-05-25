import { CGFobject } from '../../lib/CGF.js';

/**
 * MySemiCylinder
 * @constructor
 * @param scene - Reference to MyScene object
 * @param slices - number of divisions around the half Y axis
 * @param stacks - number of divisions along the Z axis
 */
export class MySemiCylinder extends CGFobject {
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
        this.texCoords = [];

        const alphaAng = Math.PI / this.slices; // Only half circle
        const stackStep = 1.0 / this.stacks;

        // --- Side Surface ---
        for (let j = 0; j <= this.stacks; j++) {
            const z = j * stackStep;
            for (let i = 0; i <= this.slices; i++) {
                const ang = i * alphaAng;
                const x = Math.cos(ang);
                const y = Math.sin(ang);

                this.vertices.push(x, y, z);
                this.normals.push(x, y, 0);
                this.texCoords.push(i / this.slices, 1 - (j / this.stacks));
            }
        }

        for (let j = 0; j < this.stacks; j++) {
            for (let i = 0; i < this.slices; i++) {
                const current = j * (this.slices + 1) + i;
                const next = current + this.slices + 1;

                // Outside faces
                this.indices.push(current, next, next + 1);
                this.indices.push(current, next + 1, current + 1);
                
                // Inside faces (inverted normals logic for the cloth interior)
                this.indices.push(current, next + 1, next);
                this.indices.push(current, current + 1, next + 1);
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
