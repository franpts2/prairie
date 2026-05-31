import { CGFobject } from '../../../lib/CGF.js';

export class MyFlowersCentersMesh extends CGFobject {
    constructor(scene, flowerItems) {
        super(scene);
        this.flowerItems = flowerItems;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        // base hemisphere coordinates
        const slices = 6;
        const stacks = 3;
        const radius = 0.5;

        const baseVerts = [];
        const baseNorms = [];
        const baseTex = [];
        const baseIndices = [];

        const alphaAng = 2 * Math.PI / slices;
        const betaAng = (Math.PI / 2) / stacks;

        for (let stack = 0; stack <= stacks; stack++) {
            const beta = stack * betaAng;
            const sinBeta = Math.sin(beta);
            const cosBeta = Math.cos(beta);

            for (let slice = 0; slice <= slices; slice++) {
                const alpha = slice * alphaAng;
                const sinAlpha = Math.sin(alpha);
                const cosAlpha = Math.cos(alpha);

                const x = cosAlpha * sinBeta;
                const y = cosBeta;
                const z = sinAlpha * sinBeta;

                baseVerts.push(x * radius, y * radius, z * radius);
                baseNorms.push(x, y, z);
                baseTex.push(1 - (slice / slices), 1 - (stack / stacks));
            }
        }

        for (let stack = 0; stack < stacks; stack++) {
            for (let slice = 0; slice < slices; slice++) {
                const current = stack * (slices + 1) + slice;
                const next = current + slices + 1;
                baseIndices.push(current, next, next + 1);
                baseIndices.push(current, next + 1, current + 1);
            }
        }

        let vertexOffset = 0;

        for (const item of this.flowerItems) {
            const f = item.flower;
            const flowerScale = f.flowerScale;

            const F = mat4.create();
            mat4.translate(F, F, vec3.fromValues(item.x, item.y, item.z));
            mat4.scale(F, F, vec3.fromValues(flowerScale, flowerScale, flowerScale));

            const m = mat4.create();
            for (let seg = 0; seg < f.numStemSegments; seg++) {
                mat4.rotateZ(m, m, 0.05);
                mat4.rotateX(m, m, 0.02);
                mat4.translate(m, m, vec3.fromValues(0, f.segmentLength, 0));
            }

            const drawMat = mat4.create();
            mat4.multiply(drawMat, F, m);
            mat4.scale(drawMat, drawMat, vec3.fromValues(-f.centerRadius, f.centerHeight, f.centerRadius));

            const normMat = mat4.clone(drawMat);
            normMat[12] = 0;
            normMat[13] = 0;
            normMat[14] = 0;

            for (let i = 0; i < baseVerts.length; i += 3) {
                const v = vec3.fromValues(baseVerts[i], baseVerts[i+1], baseVerts[i+2]);
                const tv = vec3.create();
                vec3.transformMat4(tv, v, drawMat);
                this.vertices.push(tv[0], tv[1], tv[2]);

                const n = vec3.fromValues(baseNorms[i], baseNorms[i+1], baseNorms[i+2]);
                const tn = vec3.create();
                vec3.transformMat4(tn, n, normMat);
                vec3.normalize(tn, tn);
                this.normals.push(tn[0], tn[1], tn[2]);

                // sway factor for centers is always 1.0 (fully swaying at the top)
                this.texCoords.push(1.0, 0.0);
            }

            for (let i = 0; i < baseIndices.length; i++) {
                this.indices.push(baseIndices[i] + vertexOffset);
            }

            vertexOffset += baseVerts.length / 3;
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
