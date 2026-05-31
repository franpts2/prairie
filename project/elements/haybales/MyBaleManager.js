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

    initPlacement() {
        const count = 30;
        const positions = PlacementUtils.generateScatterPositions({
            count: count,
            minX: -150,
            maxX: 150,
            minZ: -150,
            maxZ: 150,
            minDistance: 15,
            validate: (pos) => this.isValidPlacement(pos)
        });

        const ground = this.scene.ground;
        this.hayBales = positions.map(pos => {
            const scale = MyHayBale.SCALE;
            const height = ground ? ground.getHeight(pos.x, pos.z) : 0;
            const baleY = height + 0.3 * scale;
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

    checkCollisions(wagon, gameController, isKeyPressedP) {
        if (!isKeyPressedP) return;

        for (const bale of this.hayBales) {
            if (bale.captured) continue;
            if (!bale.collider) continue;

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

    dropBale(wagon, gameController) {
        if (gameController.wagonBales <= 0) return;

        const baleToDrop = this.hayBales.find(b => b.captured);
        if (baleToDrop) {
            const droppedScale = gameController.dropBale();

            baleToDrop.x = wagon.x;
            baleToDrop.z = wagon.z;
            baleToDrop.scale = droppedScale || MyHayBale.SCALE;
            baleToDrop.captured = false;

            const ground = this.scene.ground;
            const height = ground ? ground.getHeight(wagon.x, wagon.z) : 0;
            const baleY = height + 0.3 * baleToDrop.scale;
            baleToDrop.y = baleY;
            baleToDrop.collider.setPosition(wagon.x, baleY, wagon.z);
            baleToDrop.collider.radius = baleToDrop.scale;

            console.log("Dropped hay bale at: (" + wagon.x.toFixed(1) + ", " + wagon.z.toFixed(1) + ")");
        }
    }

    respawnBales(count) {
        if (count <= 0) return;

        const positions = PlacementUtils.generateScatterPositions({
            count: count,
            minX: -150,
            maxX: 150,
            minZ: -150,
            maxZ: 150,
            minDistance: 15,
            validate: (pos) => this.isValidPlacement(pos)
        });

        const ground = this.scene.ground;
        const newBales = positions.map(pos => {
            const scale = MyHayBale.SCALE;
            const height = ground ? ground.getHeight(pos.x, pos.z) : 0;
            const baleY = height + 0.3 * scale;
            return {
                x: pos.x,
                y: baleY,
                z: pos.z,
                rotation: Math.random() * Math.PI * 2,
                scale: scale,
                captured: false,
                collider: new CollisionSphere(pos.x, baleY, pos.z, scale),
                yOffset: 0,
                visibilityProgress: 0.0
            };
        });

        this.hayBales.push(...newBales);
        console.log(`Respawned ${newBales.length} new hay bales on the terrain!`);
    }

    isPointInWater(x, z) {
        return this.scene.ground ? this.scene.ground.isPointInWater(x, z) : false;
    }

    isValidPlacement(pos) {
        const baleRadius = MyHayBale.SCALE;

        // WATER CHECK
        if (this.isPointInWater(pos.x, pos.z)) {
            return false;
        }
        // also check if any point near the bale is in water to prevent spawning too close to the riverbed
        const checkOffsets = [
            { x: baleRadius * 1.5, z: 0 },
            { x: -baleRadius * 1.5, z: 0 },
            { x: 0, z: baleRadius * 1.5 },
            { x: 0, z: -baleRadius * 1.5 }
        ];
        for (const offset of checkOffsets) {
            if (this.isPointInWater(pos.x + offset.x, pos.z + offset.z)) {
                return false;
            }
        }

        // BARN CHECK
        const barn = this.scene.barn;
        const barnX = barn ? barn.x : -12;
        const barnZ = barn ? barn.z : -90;
        const barnRadius = (barn && barn.collider) ? barn.collider.radius : 13.0;
        const dxBarn = pos.x - barnX;
        const dzBarn = pos.z - barnZ;
        const distBarn = Math.sqrt(dxBarn * dxBarn + dzBarn * dzBarn);
        if (distBarn < barnRadius + baleRadius + 1.0) {
            return false;
        }

        // PLATFORM CHECK
        const platform = this.scene.gameController ? this.scene.gameController.haybaleplatform : null;
        const platformX = platform ? platform.centerX : -55;
        const platformZ = platform ? platform.centerZ : -90;
        const platformRadius = (platform && platform.collider) ? platform.collider.radius : 3.0;
        const dxPlat = pos.x - platformX;
        const dzPlat = pos.z - platformZ;
        const distPlat = Math.sqrt(dxPlat * dxPlat + dzPlat * dzPlat);
        if (distPlat < platformRadius + baleRadius + 3.0) {
            return false;
        }

        //  ROCKS CHECK
        if (this.scene.rocks && this.scene.rocks.rockItems) {
            for (const rock of this.scene.rocks.rockItems) {
                const rockRadius = rock.collider ? rock.collider.radius : (rock.size * 1.6);
                const dxRock = pos.x - rock.x;
                const dzRock = pos.z - rock.z;
                const distRock = Math.sqrt(dxRock * dxRock + dzRock * dzRock);
                if (distRock < rockRadius + baleRadius + 0.5) {
                    return false;
                }
            }
        }

        // TREES CHECK
        if (this.scene.trees && this.scene.trees.treeItems) {
            for (const tree of this.scene.trees.treeItems) {
                const treeRadius = tree.canopyRadius || 3.0;
                const dxTree = pos.x - tree.x;
                const dzTree = pos.z - tree.z;
                const distTree = Math.sqrt(dxTree * dxTree + dzTree * dzTree);
                if (distTree < treeRadius + baleRadius + 0.5) {
                    return false;
                }
            }
        }

        return true;
    }

    update(dt) {
        const wagon = this.scene.wagon;
        if (!wagon) return;

        const wagonX = wagon.x;
        const wagonZ = wagon.z;
        const VISIBILITY_RANGE = 40.0;
        const TRANSITION_SPEED = 4.0;

        for (const bale of this.hayBales) {
            if (bale.captured) continue;

            if (bale.onPlatform) {
                bale.visibilityProgress = 1.0;
                continue;
            }

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
