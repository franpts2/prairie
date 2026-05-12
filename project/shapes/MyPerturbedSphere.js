import { CGFobject } from '../../lib/CGF.js';

export class MyPerturbedSphere extends CGFobject {
    constructor(scene, slices, stacks, radius = 1, perturbationStrength = 0.2, seed = 0) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        this.radius = radius;
        this.perturbationStrength = perturbationStrength;
        this.seed = seed;
        this.initBuffers();
    }

    seededRandom(x, y, z) {
        const seed = this.seed;
        const n = Math.sin(x * 12.9898 + y * 78.233 + z * 45.164 + seed) * 43758.5453;
        return n - Math.floor(n);
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        const alphaAng = 2 * Math.PI / this.slices;
        const betaAng = (Math.PI / 2) / this.stacks;

        // generate vertices with perturbation
        for (let stack = 0; stack <= this.stacks; stack++) {
            const beta = stack * betaAng;
            const sinBeta = Math.sin(beta);
            const cosBeta = Math.cos(beta);

            for (let slice = 0; slice <= this.slices; slice++) {
                const alpha = slice * alphaAng;
                const sinAlpha = Math.sin(alpha);
                const cosAlpha = Math.cos(alpha);

                // base sphere vertex
                let x = cosAlpha * sinBeta;
                let y = cosBeta;
                let z = sinAlpha * sinBeta;

                // perturbation based on position
                const perturbX = (this.seededRandom(x, y, z) - 0.5) * this.perturbationStrength;
                const perturbY = (this.seededRandom(x + 10, y + 10, z + 10) - 0.5) * this.perturbationStrength;
                const perturbZ = (this.seededRandom(x + 20, y + 20, z + 20) - 0.5) * this.perturbationStrength;

                // displace vertex
                x += perturbX;
                y += perturbY;
                z += perturbZ;

                // normalize to maintain sphere-like shape
                const len = Math.sqrt(x * x + y * y + z * z);
                x /= len;
                y /= len;
                z /= len;

                // scale by radius
                this.vertices.push(x * this.radius, y * this.radius, z * this.radius);

                // normal points outward
                this.normals.push(-x, -y, -z);

                // UV coordinates
                const u = 1 - (slice / this.slices);
                const v = 1 - (stack / this.stacks);
                this.texCoords.push(u, v);
            }
        }

        // indices
        for (let stack = 0; stack < this.stacks; stack++) {
            for (let slice = 0; slice < this.slices; slice++) {
                const current = stack * (this.slices + 1) + slice;
                const next = current + this.slices + 1;

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
