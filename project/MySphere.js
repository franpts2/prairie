import { CGFobject } from '../lib/CGF.js';

export class MySphere extends CGFobject {
    constructor(scene, slices, stacks) {
        super(scene);
        this.slices = slices;  // divisions around the poles (longitude)
        this.stacks = stacks;  // divisions from pole to pole (latitude)
        this.radius = 500;     // radius of sphere
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];

        const alphaAng = 2 * Math.PI / this.slices;  // angle between longitude lines
        const betaAng = Math.PI / this.stacks;       // angle between latitude lines

        // Generate vertices using spherical coordinates
        for (let stack = 0; stack <= this.stacks; stack++) {
            const beta = stack * betaAng;
            const sinBeta = Math.sin(beta);
            const cosBeta = Math.cos(beta);

            for (let slice = 0; slice <= this.slices; slice++) {
                const alpha = slice * alphaAng;
                const sinAlpha = Math.sin(alpha);
                const cosAlpha = Math.cos(alpha);

                // Vertex position (on unit sphere)
                const x = cosAlpha * sinBeta;
                const y = cosBeta;
                const z = sinAlpha * sinBeta;

                this.vertices.push(x * this.radius, y * this.radius, z * this.radius);
                
                // Normal (points outward from center - same as vertex for unit sphere)
                this.normals.push(-x, -y, -z);
            }
        }

        // Generate indices (triangles connecting vertices)
        for (let stack = 0; stack < this.stacks; stack++) {
            for (let slice = 0; slice < this.slices; slice++) {
                const current = stack * (this.slices + 1) + slice;
                const next = current + this.slices + 1;

                // Two triangles per quad
                this.indices.push(current, next, next + 1);
                this.indices.push(current, next + 1, current + 1);
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    updateBuffers(complexity) {
        this.slices = 3 + Math.round(9 * complexity);
        this.stacks = 3 + Math.round(9 * complexity);
        this.initBuffers();
        this.initNormalVizBuffers();
    }
}