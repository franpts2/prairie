import { MyHayBale } from "./MyHayBale.js";
import { CGFappearance } from "../../../lib/CGF.js";
import * as PlacementUtils from "../../utils/PlacementUtils.js";

export class MyHayBales {
    constructor(scene, ground) {
        this.scene = scene;
        this.ground = ground;
        this.hayBales = [];
        this.terrainSize = 400;

        this.appearance = this.initAppearance();
        this.initPlacement();
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

    initPlacement() {
        const count = 15;
        const positions = PlacementUtils.generateScatterPositions({
            count: count,
            minX: -100,
            maxX: 100,
            minZ: -100,
            maxZ: 100,
            minDistance: 15,
        });

        this.hayBales = positions.map(pos => {
            return {
                x: pos.x,
                z: pos.z,
                rotation: Math.random() * Math.PI * 2,
                scale: 1.8,
                bale: new MyHayBale(this.scene, this.appearance),
                captured: false
            };
        });
    }

    checkCollisions(wagon, gameController) {
        // Wagon radius is 2.0. Bale scale is roughly 1.5 - 2.0.
        // collision distance threshold = 2.5
        const captureDistance = 2.5;

        for (const bale of this.hayBales) {
            if (bale.captured) continue;

            const dx = wagon.x - bale.x;
            const dz = wagon.z - bale.z;
            const distance = Math.sqrt(dx * dx + dz * dz);

            if (distance < captureDistance) {
                // Try to capture. captureBale() returns true if below capacity limit (2).
                const success = gameController.captureBale(bale.scale);
                if (success) {
                    bale.captured = true;
                    console.log("Captured hay bale! Total carried: " + gameController.wagonBales);
                }
            }
        }
    }

    display() {
        for (const bale of this.hayBales) {
            if (bale.captured) continue;
            
            const height = this.ground ? this.ground.getHeight(bale.x, bale.z) : 0;
            this.scene.pushMatrix();
            this.scene.translate(bale.x, height + bale.scale * 0.5, bale.z);
            this.scene.rotate(bale.rotation, 0, 1, 0);
            this.scene.scale(bale.scale, bale.scale, bale.scale);
            bale.bale.display();
            this.scene.popMatrix();
        }
    }
}
