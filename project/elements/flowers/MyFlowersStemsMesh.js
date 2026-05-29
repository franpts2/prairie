import { CGFobject } from '../../../lib/CGF.js';

export class MyFlowersStemsMesh extends CGFobject {
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

        // base unit cylinder coordinates (z from 0 to 1, radius 1)
        const slices = 12;
        const stacks = 4;
        const alphaAng = 2 * Math.PI / slices;
        const stackStep = 1.0 / stacks;

        const baseVerts = [];
        const baseNorms = [];
        const baseTex = [];
        const baseIndices = [];

        // sides
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
        baseVerts.push(0, 0, 0); // center point
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

        const topCapBaseIndex = baseVerts.length / 3;
        baseVerts.push(0, 0, 1); // Center point
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

        let vertexOffset = 0;

        for (const item of this.flowerItems) {
            const f = item.flower;
            const flowerScale = f.flowerScale;
            
            // F = world transformation (Translate * Scale)
            const F = mat4.create();
            mat4.translate(F, F, vec3.fromValues(item.x, item.y, item.z));
            mat4.scale(F, F, vec3.fromValues(flowerScale, flowerScale, flowerScale));

            const m = mat4.create();

            for (let seg = 0; seg < f.numStemSegments; seg++) {
                mat4.rotateZ(m, m, 0.05);
                mat4.rotateX(m, m, 0.02);

                const drawMat = mat4.create();
                mat4.multiply(drawMat, F, m);
                mat4.rotateX(drawMat, drawMat, -Math.PI / 2);
                mat4.scale(drawMat, drawMat, vec3.fromValues(f.stemRadius, f.stemRadius, f.segmentLength));

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

                    // local vertical ratio along stem for the sway factor
                    let localZ = baseVerts[i+2]; // base cylinder z from 0 to 1
                    
                    // if cap, use appropriate z
                    const vertIndex = i / 3;
                    let capZ = -1;
                    if (vertIndex >= baseIndex && vertIndex < topCapBaseIndex) {
                        capZ = 0.0; // bottom cap
                    } else if (vertIndex >= topCapBaseIndex) {
                        capZ = 1.0; // top cap
                    }
                    const finalZ = capZ >= 0 ? capZ : localZ;
                    
                    const relativeHeight = (seg + finalZ) / f.numStemSegments;
                    
                    // sway factor goes into textureCoord.x
                    this.texCoords.push(relativeHeight, 0); 
                }

                for (let i = 0; i < baseIndices.length; i++) {
                    this.indices.push(baseIndices[i] + vertexOffset);
                }

                vertexOffset += baseVerts.length / 3;

                mat4.translate(m, m, vec3.fromValues(0, f.segmentLength, 0));
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
