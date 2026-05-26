import { MyHayBale } from "./MyHayBale.js";
import { CGFappearance } from "../../../lib/CGF.js";
import * as PlacementUtils from "../../utils/PlacementUtils.js";
import { CollisionSphere } from "../../utils/CollisionSphere.js";

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
            const scale = 1.8;
            const height = this.ground ? this.ground.getHeight(pos.x, pos.z) : 0;
            const baleY = height + scale * 0.5;
            return {
                x: pos.x,
                z: pos.z,
                rotation: Math.random() * Math.PI * 2,
                scale: scale,
                bale: new MyHayBale(this.scene, this.appearance),
                captured: false,
                collider: new CollisionSphere(pos.x, baleY, pos.z, scale)
            };
        });
    }

    checkCollisions(wagon, gameController, isKeyPressedP) {
        if (!isKeyPressedP) return;

        for (const bale of this.hayBales) {
            if (bale.captured) continue;
            if (!bale.collider) continue;

            const baleHeight = this.ground ? this.ground.getHeight(bale.x, bale.z) : 0;
            const baleY = baleHeight + bale.scale * 0.5;

            // keep the bale's collider in sync (important after dropping)
            bale.collider.setPosition(bale.x, baleY, bale.z);

            if (wagon.collider && wagon.collider.collidesWith(bale.collider)) {
                const success = gameController.captureBale(bale.scale);
                if (success) {
                    bale.captured = true;
                    console.log("Captured hay bale! Total carried: " + gameController.wagonBales);
                }
            }
        }
    }

    dropBale(wagon, gameController) {
        if (gameController.wagonBales <= 0) return;

        const baleToDrop = this.hayBales.find(b => b.captured);
        if (baleToDrop) {
            const droppedScale = gameController.dropBale();

            // place the bale back on the ground at the wagon's coordinates
            baleToDrop.x = wagon.x;
            baleToDrop.z = wagon.z;
            baleToDrop.scale = droppedScale || 1.8;
            baleToDrop.captured = false;

            // sync the collider's coordinates on drop
            const height = this.ground ? this.ground.getHeight(wagon.x, wagon.z) : 0;
            const baleY = height + baleToDrop.scale * 0.5;
            baleToDrop.collider.setPosition(wagon.x, baleY, wagon.z);
            baleToDrop.collider.radius = baleToDrop.scale;

            console.log("Dropped hay bale at: (" + wagon.x.toFixed(1) + ", " + wagon.z.toFixed(1) + ")");
        }
    }

    display() {
        for (const bale of this.hayBales) {
            if (bale.captured) continue;

            const height = this.ground ? this.ground.getHeight(bale.x, bale.z) : 0;
            this.scene.pushMatrix();
            this.scene.translate(bale.x, height + bale.scale * 0.5 + (bale.yOffset || 0), bale.z);
            this.scene.rotate(bale.rotation, 0, 1, 0);
            this.scene.scale(bale.scale, bale.scale, bale.scale);
            bale.bale.display();
            this.scene.popMatrix();
        }
    }
}
