import { CGFobject } from '../../../lib/CGF.js';

export class MyTreesCanopiesMesh extends CGFobject {
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

        // base cone geometry
        const slices = 12;
        const stacks = 4;
        const alphaAng = (2 * Math.PI) / slices;
        const stackStep = 1.0 / stacks;

        const baseVerts = [];
        const baseNorms = [];
        const baseTex = [];
        const baseIndices = [];

        for (let j = 0; j <= stacks; j++) {
            const z = j * stackStep;
            const radius = 1.0 - z;
            const v = 1 - z;

            for (let i = 0; i <= slices; i++) {
                const ang = i * alphaAng;
                const x = radius * Math.cos(ang);
                const y = -radius * Math.sin(ang);

                baseVerts.push(x, y, z);

                const nx = Math.cos(ang);
                const ny = -Math.sin(ang);
                const nz = 0.5;
                const len = Math.sqrt(nx * nx + ny * ny + nz * nz);

                baseNorms.push(nx / len, ny / len, nz / len);

                const u = i / slices;
                baseTex.push(u, v);
            }
        }

        for (let j = 0; j < stacks; j++) {
            for (let i = 0; i < slices; i++) {
                const current = j * (slices + 1) + i;
                const next = current + slices + 1;
                baseIndices.push(current, next + 1, next);
                baseIndices.push(current, current + 1, next + 1);
            }
        }

        // merge all tree canopies (3 layers per tree)
        const numLayers = 3;
        const heightFactor = 0.45;
        const radiusShrink = 0.75;
        const heightShrink = 0.85;

        let vertexOffset = 0;

        for (const item of this.treeItems) {
            for (let layer = 0; layer < numLayers; layer++) {
                const currentY = item.tree.trunkHeight + (layer * item.tree.canopyHeight * heightFactor);
                const scaleRadius = item.tree.canopyRadius * Math.pow(radiusShrink, layer);
                const scaleHeight = item.tree.canopyHeight * Math.pow(heightShrink, layer);

                // transformation matrix for canopy layer cone
                const m = mat4.create();
                mat4.translate(m, m, vec3.fromValues(item.x, item.y, item.z));
                mat4.rotateY(m, m, item.rotation);
                mat4.translate(m, m, vec3.fromValues(0, currentY, 0));
                mat4.rotateX(m, m, -Math.PI / 2);
                mat4.scale(m, m, vec3.fromValues(scaleRadius, scaleRadius, scaleHeight));

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
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
