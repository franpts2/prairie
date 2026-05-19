import { CGFobject } from '../../lib/CGF.js';

/**
 * MyCylinder
 * @constructor
 * @param scene - Reference to MyScene object
 * @param slices - number of divisions around the Y axis
 * @param stacks - number of divisions along the Z axis
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
        this.texCoords = [];

        const alphaAng = 2 * Math.PI / this.slices;
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

                this.indices.push(current, next, next + 1);
                this.indices.push(current, next + 1, current + 1);
            }
        }

        // --- Caps ---
        const baseIndex = this.vertices.length / 3;

        // Bottom Cap (z=0)
        this.vertices.push(0, 0, 0); // Center point
        this.normals.push(0, 0, -1);
        this.texCoords.push(0.5, 0.5);

        for (let i = 0; i <= this.slices; i++) {
            const ang = i * alphaAng;
            const x = Math.cos(ang);
            const y = Math.sin(ang);

            this.vertices.push(x, y, 0);
            this.normals.push(0, 0, -1);
            this.texCoords.push(0.5 + 0.5 * x, 0.5 - 0.5 * y);
        }

        for (let i = 0; i < this.slices; i++) {
            this.indices.push(baseIndex, baseIndex + i + 1, baseIndex + i + 2);
        }

        // Top Cap (z=1)
        const topCapBaseIndex = this.vertices.length / 3;
        this.vertices.push(0, 0, 1); // Center point
        this.normals.push(0, 0, 1);
        this.texCoords.push(0.5, 0.5);

        for (let i = 0; i <= this.slices; i++) {
            const ang = i * alphaAng;
            const x = Math.cos(ang);
            const y = Math.sin(ang);

            this.vertices.push(x, y, 1);
            this.normals.push(0, 0, 1);
            this.texCoords.push(0.5 + 0.5 * x, 0.5 - 0.5 * y);
        }

        for (let i = 0; i < this.slices; i++) {
            this.indices.push(topCapBaseIndex, topCapBaseIndex + i + 2, topCapBaseIndex + i + 1);
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
