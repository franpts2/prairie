import { CGFobject } from '../../lib/CGF.js';
import { NoiseGenerator } from '../utils/NoiseUtils.js';

export class MyPerturbedSphere extends CGFobject {
    constructor(scene, slices, stacks, radius = 1, perturbationStrength = 0.5, seed = 0, roughness = 0.5) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        this.radius = radius;
        this.perturbationStrength = perturbationStrength;
        this.seed = seed;
        this.roughness = Math.max(0, Math.min(1, roughness)); // Clamp 0-1
        this.noise = new NoiseGenerator(seed);
        this.initBuffers();
    }

    /**
     * Generate rock shape with roughness variation
     * Roughness 0: smooth, round rocks
     * Roughness 0.5: balanced appearance
     * Roughness 1: very jagged, craggy rocks
     */
    generateRockShape(x, y, z) {
        const BASE_WEIGHT = 0.45;
        const DETAIL_WEIGHT = 0.2 + 0.3 * this.roughness;
        const EDGE_WEIGHT = 0.12 + 0.28 * this.roughness;
        const FINAL_SCALE = 0.55 + 0.25 * this.roughness;

        const base = this.noise.noise(x * 1.5, y * 1.5, z * 1.5) * 2 - 1;
        const detail = this.noise.fractalNoise(x * 4, y * 4, z * 4, 4);
        const edges = (1 - Math.abs(detail)) * 2 - 1;

        const combined = base * BASE_WEIGHT + detail * DETAIL_WEIGHT + edges * EDGE_WEIGHT;
        return combined * FINAL_SCALE;
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        const alphaAng = 2 * Math.PI / this.slices;
        const betaAng = (Math.PI / 2) / this.stacks;

        // Generate vertices with procedural rock geometry
        for (let stack = 0; stack <= this.stacks; stack++) {
            const beta = stack * betaAng;
            const sinBeta = Math.sin(beta);
            const cosBeta = Math.cos(beta);

            for (let slice = 0; slice <= this.slices; slice++) {
                const alpha = slice * alphaAng;
                const sinAlpha = Math.sin(alpha);
                const cosAlpha = Math.cos(alpha);

                // Base sphere direction
                const x = cosAlpha * sinBeta;
                const y = cosBeta;
                const z = sinAlpha * sinBeta;

                // Apply procedural rock generation
                const rockShape = this.generateRockShape(x, y, z);
                const radiusVariation = 1 + rockShape * this.perturbationStrength;

                // Scale vertex by procedurally generated radius
                const finalRadius = this.radius * radiusVariation;
                this.vertices.push(
                    x * finalRadius,
                    y * finalRadius,
                    z * finalRadius
                );

                // Normal points outward from center
                this.normals.push(x, y, z);

                // UV coordinates
                const u = 1 - (slice / this.slices);
                const v = 1 - (stack / this.stacks);
                this.texCoords.push(u, v);
            }
        }

        // Generate indices
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
