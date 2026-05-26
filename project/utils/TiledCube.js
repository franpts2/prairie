import { MyUnitCube } from "../shapes/MyUnitCube.js";

export class TiledCube {
    constructor(scene, width, height, depth) {
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.depth = depth;
        
        // Match texture coordinate scaling (widthTex, heightTex, depthTex) to the physical scale
        this.cube = new MyUnitCube(scene, width, height, depth);
    }

    /**
     * Translates, scales, and renders the tiled cube.
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @param {number} [angleY=0] - optional rotation around the Y axis
     */
    display(x, y, z, angleY = 0) {
        this.scene.pushMatrix();
        this.scene.translate(x, y, z);
        if (angleY !== 0) {
            this.scene.rotate(angleY, 0, 1, 0);
        }
        this.scene.scale(this.width, this.height, this.depth);
        this.cube.display();
        this.scene.popMatrix();
    }
}
