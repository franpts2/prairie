import { CGFobject } from '../../lib/CGF.js';

export class MyPrism extends CGFobject {
    constructor(scene, widthTex = 1, heightTex = 1, depthTex = 1) {
        super(scene);
        this.widthTex = widthTex;
        this.heightTex = heightTex;
        this.depthTex = depthTex;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [
            -0.5, 0.0, 0.5,
             0.5, 0.0, 0.5,
             0.0, 1.0, 0.5,

            -0.5, 0.0, -0.5,
             0.5, 0.0, -0.5,
             0.0, 1.0, -0.5,

             0.5, 0.0, 0.5,
             0.5, 0.0, -0.5,
             0.0, 1.0, -0.5,
             0.0, 1.0, 0.5,

            -0.5, 0.0, -0.5,
            -0.5, 0.0, 0.5,
             0.0, 1.0, 0.5,
             0.0, 1.0, -0.5,

            -0.5, 0.0, 0.5,
            -0.5, 0.0, -0.5,
             0.5, 0.0, -0.5,
             0.5, 0.0, 0.5
        ];

        this.indices = [
            0, 1, 2,

            3, 5, 4,

            6, 7, 8,
            6, 8, 9,

            10, 11, 12,
            10, 12, 13,

            14, 15, 16,
            14, 16, 17
        ];

        const nSlopeX = 2.0 / Math.sqrt(5.0);
        const nSlopeY = 1.0 / Math.sqrt(5.0);

        this.normals = [
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,

            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,

            nSlopeX, nSlopeY, 0.0,
            nSlopeX, nSlopeY, 0.0,
            nSlopeX, nSlopeY, 0.0,
            nSlopeX, nSlopeY, 0.0,

            -nSlopeX, nSlopeY, 0.0,
            -nSlopeX, nSlopeY, 0.0,
            -nSlopeX, nSlopeY, 0.0,
            -nSlopeX, nSlopeY, 0.0,

            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0
        ];

        this.texCoords = [
            0.0, 0.0,
            this.widthTex, 0.0,
            this.widthTex / 2.0, this.heightTex,

            this.widthTex, 0.0,
            0.0, 0.0,
            this.widthTex / 2.0, this.heightTex,

            this.widthTex, 0.0,
            this.widthTex, this.depthTex,
            0.0, this.depthTex,
            0.0, 0.0,

            0.0, this.depthTex,
            0.0, 0.0,
            this.widthTex, 0.0,
            this.widthTex, this.depthTex,

            0.0, this.depthTex,
            0.0, 0.0,
            this.widthTex, 0.0,
            this.widthTex, this.depthTex
        ];

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
