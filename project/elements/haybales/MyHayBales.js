import { MyHayBale } from "./MyHayBale.js";
import { CGFappearance } from "../../../lib/CGF.js";

export class MyHayBales {
    /**
     * @param {CGFscene} scene 
     * @param {BaleManager} baleManager - Reference to the decoupled bale logic manager
     */
    constructor(scene, baleManager) {
        this.scene = scene;
        this.baleManager = baleManager;

        this.appearance = this.initAppearance();
        this.hayBaleVisual = new MyHayBale(scene, this.appearance);
    }

    initAppearance() {
        const appearance = new CGFappearance(this.scene);
        appearance.setAmbient(0.3, 0.3, 0.3, 1.0);
        appearance.setDiffuse(0.8, 0.8, 0.8, 1.0);
        appearance.setSpecular(0.1, 0.1, 0.1, 1.0);
        appearance.setShininess(5.0);

        const texture = this.scene.assetManager.getTexture('hay');
        appearance.setTexture(texture);
        appearance.setTextureWrap("REPEAT", "REPEAT");

        return appearance;
    }

    display() {
        if (!this.baleManager || !this.baleManager.hayBales) return;

        for (const bale of this.baleManager.hayBales) {
            if (bale.captured) continue;

            this.scene.pushMatrix();
            this.scene.translate(bale.x, bale.y + (bale.yOffset || 0), bale.z);
            this.scene.rotate(bale.rotation, 0, 1, 0);
            this.scene.scale(bale.scale, bale.scale, bale.scale);
            this.hayBaleVisual.display();
            this.scene.popMatrix();
        }
    }
}
