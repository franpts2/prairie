import { MyHayBale } from "./MyHayBale.js";
import { CGFappearance } from "../../../lib/CGF.js";
import { MyArrow } from "./MyArrow.js";

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

        this.arrow = new MyArrow(scene);
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

    update(dt) {
        if (this.baleManager) {
            this.baleManager.update(dt);
        }
    }


    display() {
        if (!this.baleManager || !this.baleManager.hayBales) return;

        // uniform base time for animation
        const time = this.scene.time || 0.0;

        for (const bale of this.baleManager.hayBales) {
            if (bale.captured) continue;

            const progress = bale.visibilityProgress !== undefined ? bale.visibilityProgress : 0.0;

            if (progress > 0.0) {
                // Smoothstep easing for premium dynamic feel
                const smoothT = progress * progress * (3 - 2 * progress);
                const currentScale = bale.scale * smoothT;

                this.scene.pushMatrix();
                this.scene.translate(bale.x, bale.y + (bale.yOffset || 0), bale.z);
                this.scene.rotate(bale.rotation, 0, 1, 0);
                this.scene.scale(currentScale, currentScale, currentScale);
                this.hayBaleVisual.display();
                this.scene.popMatrix();
            }

            // don't render the arrow if the bale is on the platform
            if (!bale.onPlatform) {
                const phase = bale.x * 0.15 + bale.z * 0.15;
                const bobOffset = Math.sin(time * 4.5 + phase) * 0.15;
                this.arrow.display(bale, bobOffset);
            }
        }
    }
}
