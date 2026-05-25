import { MyCylinder } from "../shapes/MyCylinder.js";
import { MyCone } from "../shapes/MyCone.js";

export class MyTree {
    constructor(scene, trunkHeight, trunkRadius, canopyHeight, canopyRadius) {
        this.scene = scene;
        this.trunkHeight = trunkHeight;
        this.trunkRadius = trunkRadius;
        this.canopyHeight = canopyHeight;
        this.canopyRadius = canopyRadius;

        this.trunk = new MyCylinder(scene, 8, 3);
        this.canopy = new MyCone(scene, 12, 4);
    }

    display(trunkAppearance, canopyAppearance) {
        this.scene.pushMatrix();

        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.scene.scale(this.trunkRadius, this.trunkRadius, this.trunkHeight);

        if (trunkAppearance) {
            trunkAppearance.apply();
        }
        this.trunk.display();
        this.scene.popMatrix();

        const numLayers = 3;
        const heightFactor = 0.45;
        const radiusShrink = 0.75;
        const heightShrink = 0.85;

        this.scene.gl.disable(this.scene.gl.CULL_FACE);

        if (canopyAppearance) {
            canopyAppearance.apply();
        }

        for (let i = 0; i < numLayers; i++) {
            this.scene.pushMatrix();

            const currentY = this.trunkHeight + (i * this.canopyHeight * heightFactor);
            this.scene.translate(0, currentY, 0);

            this.scene.rotate(-Math.PI / 2, 1, 0, 0);

            const scaleRadius = this.canopyRadius * Math.pow(radiusShrink, i);
            const scaleHeight = this.canopyHeight * Math.pow(heightShrink, i);
            this.scene.scale(scaleRadius, scaleRadius, scaleHeight);

            this.canopy.display();
            this.scene.popMatrix();
        }

        this.scene.gl.enable(this.scene.gl.CULL_FACE);
    }
}
