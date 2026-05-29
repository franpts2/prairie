import { CGFobject } from '../../../lib/CGF.js';

export class MyRocksMesh extends CGFobject {
    constructor(scene, rockItems, ground) {
        super(scene);
        this.rockItems = rockItems;
        this.ground = ground;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        let vertexOffset = 0;

        for (const rockItem of this.rockItems) {
            const geom = rockItem.rock.geometry;
            const x = rockItem.x;
            const z = rockItem.z;
            const size = rockItem.size;
            const rotation = rockItem.rotation;
            const height = this.ground ? this.ground.getHeight(x, z) : 0;
            const y = height + size * 0.2;

            // transformation matrix for this rock
            const m = mat4.create();
            mat4.translate(m, m, vec3.fromValues(x, y, z));
            mat4.rotateY(m, m, rotation);
            mat4.scale(m, m, vec3.fromValues(size, size, size));

            // normal matrix (rotation and scale only)
            const normMat = mat4.clone(m);
            normMat[12] = 0;
            normMat[13] = 0;
            normMat[14] = 0;

            const baseVerts = geom.vertices;
            const baseNorms = geom.normals;
            const baseTex = geom.texCoords;
            const baseIndices = geom.indices;

            // transform vertices and normals
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

            // offset and push indices
            for (let i = 0; i < baseIndices.length; i++) {
                this.indices.push(baseIndices[i] + vertexOffset);
            }

            vertexOffset += baseVerts.length / 3;
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
