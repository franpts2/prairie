import { CGFobject } from '../../../lib/CGF.js';

export class MyTreesTrunksMesh extends CGFobject {
    constructor(scene, treeItems) {
        super(scene);
        this.treeItems = treeItems;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        // base cylinder trunk geometry
        const slices = 8;
        const stacks = 3;
        const alphaAng = 2 * Math.PI / slices;
        const stackStep = 1.0 / stacks;

        const baseVerts = [];
        const baseNorms = [];
        const baseTex = [];
        const baseIndices = [];

        // side surface
        for (let j = 0; j <= stacks; j++) {
            const z = j * stackStep;
            for (let i = 0; i <= slices; i++) {
                const ang = i * alphaAng;
                const x = Math.cos(ang);
                const y = Math.sin(ang);

                baseVerts.push(x, y, z);
                baseNorms.push(x, y, 0);
                baseTex.push(i / slices, 1 - (j / stacks));
            }
        }

        for (let j = 0; j < stacks; j++) {
            for (let i = 0; i < slices; i++) {
                const current = j * (slices + 1) + i;
                const next = current + slices + 1;
                baseIndices.push(current, current + 1, next + 1);
                baseIndices.push(current, next + 1, next);
            }
        }

        // caps
        const baseIndex = baseVerts.length / 3;

        // bottom Cap (z=0)
        baseVerts.push(0, 0, 0);
        baseNorms.push(0, 0, -1);
        baseTex.push(0.5, 0.5);

        for (let i = 0; i <= slices; i++) {
            const ang = i * alphaAng;
            const x = Math.cos(ang);
            const y = Math.sin(ang);
            baseVerts.push(x, y, 0);
            baseNorms.push(0, 0, -1);
            baseTex.push(0.5 + 0.5 * x, 0.5 - 0.5 * y);
        }

        for (let i = 0; i < slices; i++) {
            baseIndices.push(baseIndex, baseIndex + i + 2, baseIndex + i + 1);
        }

        // top Cap (z=1)
        const topCapBaseIndex = baseVerts.length / 3;
        baseVerts.push(0, 0, 1);
        baseNorms.push(0, 0, 1);
        baseTex.push(0.5, 0.5);

        for (let i = 0; i <= slices; i++) {
            const ang = i * alphaAng;
            const x = Math.cos(ang);
            const y = Math.sin(ang);
            baseVerts.push(x, y, 1);
            baseNorms.push(0, 0, 1);
            baseTex.push(0.5 + 0.5 * x, 0.5 - 0.5 * y);
        }

        for (let i = 0; i < slices; i++) {
            baseIndices.push(topCapBaseIndex, topCapBaseIndex + i + 1, topCapBaseIndex + i + 2);
        }

        // merge all tree trunks
        let vertexOffset = 0;

        for (const item of this.treeItems) {
            const m = mat4.create();
            mat4.translate(m, m, vec3.fromValues(item.x, item.y, item.z));
            mat4.rotateY(m, m, item.rotation);
            mat4.rotateX(m, m, -Math.PI / 2);
            mat4.scale(m, m, vec3.fromValues(item.trunkRadius, item.trunkRadius, item.tree.trunkHeight));

            const normMat = mat4.clone(m);
            normMat[12] = 0;
            normMat[13] = 0;
            normMat[14] = 0;

            for (let i = 0; i < baseVerts.length; i += 3) {
                const v = vec3.fromValues(baseVerts[i], baseVerts[i + 1], baseVerts[i + 2]);
                const tv = vec3.create();
                vec3.transformMat4(tv, v, m);
                this.vertices.push(tv[0], tv[1], tv[2]);

                const n = vec3.fromValues(baseNorms[i], baseNorms[i + 1], baseNorms[i + 2]);
                const tn = vec3.create();
                vec3.transformMat4(tn, n, normMat);
                vec3.normalize(tn, tn);
                this.normals.push(tn[0], tn[1], tn[2]);

                this.texCoords.push(baseTex[(i / 3) * 2], baseTex[(i / 3) * 2 + 1]);
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
