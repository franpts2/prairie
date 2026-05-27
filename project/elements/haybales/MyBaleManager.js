import * as PlacementUtils from "../../utils/PlacementUtils.js";
import { CollisionSphere } from "../../utils/CollisionSphere.js";
import { MyHayBale } from "./MyHayBale.js";

export class BaleManager {
    constructor(scene) {
        this.scene = scene;
        this.hayBales = [];
        this.terrainSize = 400;

        this.initPlacement();
    }

    /**
     * Scatters the hay bales randomly on the terrain
     */
    initPlacement() {
        const count = 30;
        const positions = PlacementUtils.generateScatterPositions({
            count: count,
            minX: -150,
            maxX: 150,
            minZ: -150,
            maxZ: 150,
            minDistance: 15,
        });

        const ground = this.scene.ground;
        this.hayBales = positions.map(pos => {
            const scale = MyHayBale.SCALE;
            const height = ground ? ground.getHeight(pos.x, pos.z) : 0;
            const baleY = height + scale * 0.5;
            return {
                x: pos.x,
                y: baleY,
                z: pos.z,
                rotation: Math.random() * Math.PI * 2,
                scale: scale,
                captured: false,
                collider: new CollisionSphere(pos.x, baleY, pos.z, scale),
                yOffset: 0
            };
        });
    }

    /**
     * Checks if the wagon is close enough to collect any uncaptured hay bale
     */
    checkCollisions(wagon, gameController, isKeyPressedP) {
        if (!isKeyPressedP) return;

        for (const bale of this.hayBales) {
            if (bale.captured) continue;
            if (!bale.collider) continue;

            // keep the bale's collider in sync (important after dropping)
            bale.collider.setPosition(bale.x, bale.y, bale.z);

            if (wagon.collider && wagon.collider.collidesWith(bale.collider)) {
                const success = gameController.captureBale();
                if (success) {
                    bale.captured = true;
                    console.log("Captured hay bale! Total carried: " + gameController.wagonBales);
                }
            }
        }
    }

    /**
     * Drops a hay bale from the wagon onto the ground at the wagon's current coordinates
     */
    dropBale(wagon, gameController) {
        if (gameController.wagonBales <= 0) return;

        const baleToDrop = this.hayBales.find(b => b.captured);
        if (baleToDrop) {
            const droppedScale = gameController.dropBale();

            // place the bale back on the ground at the wagon's coordinates
            baleToDrop.x = wagon.x;
            baleToDrop.z = wagon.z;
            baleToDrop.scale = droppedScale || MyHayBale.SCALE;
            baleToDrop.captured = false;

            // sync the collider's coordinates on drop
            const ground = this.scene.ground;
            const height = ground ? ground.getHeight(wagon.x, wagon.z) : 0;
            const baleY = height + baleToDrop.scale * 0.5;
            baleToDrop.y = baleY;
            baleToDrop.collider.setPosition(wagon.x, baleY, wagon.z);
            baleToDrop.collider.radius = baleToDrop.scale;

            console.log("Dropped hay bale at: (" + wagon.x.toFixed(1) + ", " + wagon.z.toFixed(1) + ")");
        }
    }

    /**
     * Updates the visibility progress of the hay bales based on their distance to the wagon
     * @param {number} dt - Time delta in seconds
     */
    update(dt) {
        const wagon = this.scene.wagon;
        if (!wagon) return;

        const wagonX = wagon.x;
        const wagonZ = wagon.z;
        const VISIBILITY_RANGE = 40.0;
        const TRANSITION_SPEED = 4.0; // 0.25 seconds to transition fully

        for (const bale of this.hayBales) {
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
}
