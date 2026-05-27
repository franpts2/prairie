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

    update(dt) {
        if (!this.baleManager || !this.baleManager.hayBales) return;

        const wagon = this.scene.wagon;
        if (!wagon) return;

        const wagonX = wagon.x;
        const wagonZ = wagon.z;
        const VISIBILITY_RANGE = 40.0;
        const TRANSITION_SPEED = 4.0; // 0.25 seconds to transition fully

        for (const bale of this.baleManager.hayBales) {
            if (bale.captured) continue;

            if (bale.visibilityProgress === undefined) {
                bale.visibilityProgress = 0.0;
            }

            const dx = bale.x - wagonX;
            const dz = bale.z - wagonZ;
            const distance = Math.sqrt(dx * dx + dz * dz);

            const isNear = distance <= VISIBILITY_RANGE;
            const target = isNear ? 1.0 : 0.0;

            if (bale.visibilityProgress !== target) {
                if (target > bale.visibilityProgress) {
                    bale.visibilityProgress = Math.min(1.0, bale.visibilityProgress + TRANSITION_SPEED * dt);
                } else {
                    bale.visibilityProgress = Math.max(0.0, bale.visibilityProgress - TRANSITION_SPEED * dt);
                }
            }
        }
    }


    display() {
        if (!this.baleManager || !this.baleManager.hayBales) return;

        for (const bale of this.baleManager.hayBales) {
            if (bale.captured) continue;

            const progress = bale.visibilityProgress !== undefined ? bale.visibilityProgress : 0.0;

            if (progress <= 0.0) continue; // completely invisible

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
    }
}
