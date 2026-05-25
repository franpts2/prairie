import { CGFobject } from '../../lib/CGF.js';

/**
 * MyTilt
 * @constructor
 * @param scene - Reference to MyScene object
 * @param slices - number of divisions around the half Y axis
 * @param stacks - number of divisions along the Z axis
 * @param numHoops - number of arches/hoops the cloth is stretched over
 * @param sagAmplitude - how much the cloth sags between hoops
 */
export class MyTilt extends CGFobject {
    constructor(scene, slices, stacks, numHoops = 5, sagAmplitude = 0.08) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        this.numHoops = numHoops;
        this.sagAmplitude = sagAmplitude;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        const alphaAng = Math.PI / this.slices;
        const stackStep = 1.0 / this.stacks;

        for (let j = 0; j <= this.stacks; j++) {
            const z = j * stackStep;
            
            // Calculate sagging factor
            // The cloth sags between hoops. Hoops are at z = k / (numHoops - 1)
            const sagFactor = Math.abs(Math.sin(z * Math.PI * (this.numHoops - 1)));
            const sag = this.sagAmplitude * Math.pow(sagFactor, 1.5); // Parabolic sag
            
            for (let i = 0; i <= this.slices; i++) {
                const ang = i * alphaAng;
                const baseX = Math.cos(ang);
                const baseY = Math.sin(ang);

                const radius = 1.0 - sag;

                const x = baseX * radius;
                const y = baseY * radius;

                this.vertices.push(x, y, z);
                
                // Normal points outward
                this.normals.push(baseX, baseY, 0);
                
                this.texCoords.push(i / this.slices, 1 - z);
            }
        }

        for (let j = 0; j < this.stacks; j++) {
            for (let i = 0; i < this.slices; i++) {
                const current = j * (this.slices + 1) + i;
                const next = current + this.slices + 1;

                // Outside faces
                this.indices.push(current, next, next + 1);
                this.indices.push(current, next + 1, current + 1);
                
                // Inside faces
                this.indices.push(current, next + 1, next);
                this.indices.push(current, current + 1, next + 1);
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
