import { CGFobject } from '../../../lib/CGF.js';

export class MyFlowerPetalsMesh extends CGFobject {
    constructor(scene, params) {
        super(scene);
        this.petalCount = params.petalCount || 12;
        this.petalWidth = params.petalWidth || 0.25;
        this.petalLength = params.petalLength || 0.85;
        this.petalThickness = params.petalThickness || 0.05;
        this.petalTiltOuter = params.petalTiltOuter || 0.10;
        this.petalTiltInner = params.petalTiltInner || 0.10;
        this.centerRadius = params.centerRadius || 0.4;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        // base unit sphere coordinates (radius 0.5)
        const slices = 16;
        const stacks = 8;
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

        const addPetal = (angle, translateX, translateY, translateZ, tilt, scaleX, scaleY, scaleZ) => {
            const m = mat4.create();
            mat4.rotateY(m, m, angle);
            mat4.translate(m, m, vec3.fromValues(translateX, translateY, translateZ));
            mat4.rotateZ(m, m, tilt - Math.PI / 2);
            mat4.rotateY(m, m, Math.PI / 2);
            mat4.scale(m, m, vec3.fromValues(scaleX, scaleY, scaleZ));

            const normMat = mat4.clone(m);
            normMat[12] = 0;
            normMat[13] = 0;
            normMat[14] = 0;

            for (let i = 0; i < baseVerts.length; i += 3) {
                const v = vec3.fromValues(baseVerts[i], baseVerts[i+1], baseVerts[i+2]);
                const tv = vec3.create();
                vec3.transformMat4(tv, v, m);
                this.vertices.push(tv[0], tv[1], tv[2]);

                const n = vec3.fromValues(baseNorms[i], baseNorms[i+1], baseNorms[i+2]);
                const tn = vec3.create();
                vec3.transformMat4(tn, n, normMat);
                vec3.normalize(tn, tn);
                this.normals.push(tn[0], tn[1], tn[2]);

                this.texCoords.push(baseTex[(i/3)*2], baseTex[(i/3)*2 + 1]);
            }

            for (let i = 0; i < baseIndices.length; i++) {
                this.indices.push(baseIndices[i] + vertexOffset);
            }

            vertexOffset += baseVerts.length / 3;
        };

        // outer layer of petals
        const numOuter = Math.max(4, this.petalCount);
        for (let i = 0; i < numOuter; i++) {
            const angle = (i * 2 * Math.PI) / numOuter;
            addPetal(
                angle,
                this.centerRadius * 0.45, 0, 0,
                this.petalTiltOuter,
                -this.petalWidth, this.petalLength, this.petalThickness
            );
        }

        // inner layer of petals
        const numInner = Math.max(4, Math.floor(this.petalCount * 0.85));
        for (let i = 0; i < numInner; i++) {
            const angle = ((i + 0.5) * 2 * Math.PI) / numInner;
            addPetal(
                angle,
                this.centerRadius * 0.35, 0.05, 0,
                this.petalTiltInner,
                -this.petalWidth * 0.85, this.petalLength * 0.8, this.petalThickness * 0.85
            );
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
