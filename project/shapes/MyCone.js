import { CGFobject } from '../../lib/CGF.js';

export class MyCone extends CGFobject {
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

        const alphaAng = (2 * Math.PI) / this.slices;
        const stackStep = 1.0 / this.stacks;

        for (let j = 0; j <= this.stacks; j++) {
            const z = j * stackStep;
            const radius = 1.0 - z;
            const v = 1 - z;

            for (let i = 0; i <= this.slices; i++) {
                const ang = i * alphaAng;
                const x = radius * Math.cos(ang);
                const y = -radius * Math.sin(ang);

                this.vertices.push(x, y, z);

                const nx = Math.cos(ang);
                const ny = -Math.sin(ang);
                const nz = 0.5;
                const len = Math.sqrt(nx * nx + ny * ny + nz * nz);

                this.normals.push(nx / len, ny / len, nz / len);

                const u = i / this.slices;
                this.texCoords.push(u, v);
            }
        }

        for (let j = 0; j < this.stacks; j++) {
            for (let i = 0; i < this.slices; i++) {
                const current = j * (this.slices + 1) + i;
                const next = current + this.slices + 1;

                this.indices.push(current, next + 1, next);
                this.indices.push(current, current + 1, next + 1);
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    updateBuffers(complexity) {
        this.slices = 3 + Math.round(9 * complexity);
        this.initBuffers();
        this.initNormalVizBuffers();
    }
}
