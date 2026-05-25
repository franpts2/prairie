import { CGFobject } from '../../lib/CGF.js';

/**
 * MyDonut
 * @constructor
 * @param scene - Reference to MyScene object
 * @param slices - number of divisions around the axis
 * @param innerRadius - radius of the inner hole
 * @param outerRadius - radius of the outer cylinder
 */
export class MyDonut extends CGFobject {
    constructor(scene, slices, innerRadius, outerRadius) {
        super(scene);
        this.slices = slices;
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        const alphaAng = 2 * Math.PI / this.slices;

        // --- Outer surface (z=0 to z=1) ---
        for (let i = 0; i <= this.slices; i++) {
            const ang = i * alphaAng;
            const x = Math.cos(ang);
            const y = Math.sin(ang);

            // z=0
            this.vertices.push(x * this.outerRadius, y * this.outerRadius, 0);
            this.normals.push(x, y, 0);
            this.texCoords.push(i / this.slices, 1);

            // z=1
            this.vertices.push(x * this.outerRadius, y * this.outerRadius, 1);
            this.normals.push(x, y, 0);
            this.texCoords.push(i / this.slices, 0);
        }

        // --- Inner surface (z=0 to z=1) ---
        const innerBase = this.vertices.length / 3;
        for (let i = 0; i <= this.slices; i++) {
            const ang = i * alphaAng;
            const x = Math.cos(ang);
            const y = Math.sin(ang);

            // z=0
            this.vertices.push(x * this.innerRadius, y * this.innerRadius, 0);
            this.normals.push(-x, -y, 0); // Pointing inward
            this.texCoords.push(i / this.slices, 1);

            // z=1
            this.vertices.push(x * this.innerRadius, y * this.innerRadius, 1);
            this.normals.push(-x, -y, 0);
            this.texCoords.push(i / this.slices, 0);
        }

        // --- Top ring (z=1) ---
        const topBase = this.vertices.length / 3;
        for (let i = 0; i <= this.slices; i++) {
            const ang = i * alphaAng;
            const x = Math.cos(ang);
            const y = Math.sin(ang);

            // Outer point
            this.vertices.push(x * this.outerRadius, y * this.outerRadius, 1);
            this.normals.push(0, 0, 1);
            this.texCoords.push(0.5 + 0.5 * x, 0.5 - 0.5 * y);

            // Inner point
            this.vertices.push(x * this.innerRadius, y * this.innerRadius, 1);
            this.normals.push(0, 0, 1);
            this.texCoords.push(0.5 + 0.5 * (x * this.innerRadius / this.outerRadius), 0.5 - 0.5 * (y * this.innerRadius / this.outerRadius));
        }

        // --- Bottom ring (z=0) ---
        const bottomBase = this.vertices.length / 3;
        for (let i = 0; i <= this.slices; i++) {
            const ang = i * alphaAng;
            const x = Math.cos(ang);
            const y = Math.sin(ang);

            // Outer point
            this.vertices.push(x * this.outerRadius, y * this.outerRadius, 0);
            this.normals.push(0, 0, -1);
            this.texCoords.push(0.5 + 0.5 * x, 0.5 - 0.5 * y);

            // Inner point
            this.vertices.push(x * this.innerRadius, y * this.innerRadius, 0);
            this.normals.push(0, 0, -1);
            this.texCoords.push(0.5 + 0.5 * (x * this.innerRadius / this.outerRadius), 0.5 - 0.5 * (y * this.innerRadius / this.outerRadius));
        }

        // --- Indices ---
        for (let i = 0; i < this.slices; i++) {
            const v0 = i * 2;
            const v1 = v0 + 1;
            const v2 = v0 + 2;
            const v3 = v0 + 3;

            // Outer surface
            this.indices.push(v0, v2, v1);
            this.indices.push(v1, v2, v3);

            // Inner surface
            const i0 = innerBase + v0;
            const i1 = innerBase + v1;
            const i2 = innerBase + v2;
            const i3 = innerBase + v3;
            this.indices.push(i0, i1, i2);
            this.indices.push(i1, i3, i2);

            // Top ring
            const t0 = topBase + v0;
            const t1 = topBase + v1;
            const t2 = topBase + v2;
            const t3 = topBase + v3;
            this.indices.push(t0, t2, t1);
            this.indices.push(t1, t2, t3);

            // Bottom ring
            const b0 = bottomBase + v0;
            const b1 = bottomBase + v1;
            const b2 = bottomBase + v2;
            const b3 = bottomBase + v3;
            this.indices.push(b0, b1, b2);
            this.indices.push(b1, b3, b2);
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
