import { MyHayBale } from "./MyHayBale.js";
import { CGFappearance } from "../../../lib/CGF.js";

export class MyHayBales {
    /**
     * @param {CGFscene} scene 
     * @param {BaleManager} baleManager
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

        const wagon = this.scene.wagon;
        const wagonX = wagon ? wagon.x : 0;
        const wagonZ = wagon ? wagon.z : 0;

        const VISIBILITY_RANGE = 40.0;
        const MIN_RANGE = 30.0;

        for (const bale of this.baleManager.hayBales) {
            if (bale.captured) continue;

            let currentScale = bale.scale;

            if (wagon) {
                const dx = bale.x - wagonX;
                const dz = bale.z - wagonZ;
                const distance = Math.sqrt(dx * dx + dz * dz)

                if (distance > VISIBILITY_RANGE) {
                    continue;
                } else if (distance > MIN_RANGE) {
                    // scale down as the player gets further away
                    const t = (VISIBILITY_RANGE - distance) / (VISIBILITY_RANGE - MIN_RANGE);
                    const smoothT = t * t * (3 - 2 * t); // smoothstep interpolation
                    currentScale *= smoothT;
                }
            }

            this.scene.pushMatrix();
            this.scene.translate(bale.x, bale.y + (bale.yOffset || 0), bale.z);
            this.scene.rotate(bale.rotation, 0, 1, 0);
            this.scene.scale(currentScale, currentScale, currentScale);
            this.hayBaleVisual.display();
            this.scene.popMatrix();
        }
    }
}
