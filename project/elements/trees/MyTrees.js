import { MyTree } from "./MyTree.js";
import { CGFappearance } from "../../../lib/CGF.js";
import * as PlacementUtils from "../../utils/PlacementUtils.js";
import { CollisionSphere } from "../../utils/CollisionSphere.js";

export class MyTrees {
    constructor(scene, ground) {
        this.scene = scene;
        this.ground = ground;
        this.treeItems = [];
        this.terrainSize = 400;

        const pathData = scene.assetManager.getPixelData('path');
        this.pathMapImage = pathData;

        this.initAppearances();
        this.initPlacement();
    }

    initAppearances() {
        this.trunkAppearance = new CGFappearance(this.scene);
        this.trunkAppearance.setAmbient(0.3, 0.25, 0.2, 1.0);
        this.trunkAppearance.setDiffuse(0.65, 0.55, 0.45, 1.0);
        this.trunkAppearance.setSpecular(0.1, 0.08, 0.05, 1.0);
        this.trunkAppearance.setShininess(5.0);
        this.trunkAppearance.setTexture(this.scene.assetManager.getTexture('soil'));
        this.trunkAppearance.setTextureWrap("REPEAT", "REPEAT");

        this.canopyAppearance = new CGFappearance(this.scene);
        this.canopyAppearance.setAmbient(0.4, 0.4, 0.4, 1.0);
        this.canopyAppearance.setDiffuse(0.8, 0.8, 0.8, 1.0);
        this.canopyAppearance.setSpecular(0.15, 0.15, 0.15, 1.0);
        this.canopyAppearance.setShininess(5.0);
        this.canopyAppearance.setTexture(this.scene.assetManager.getTexture('leaves'));
        this.canopyAppearance.setTextureWrap("REPEAT", "REPEAT");
    }

    getPathValue(x, z) {
        if (!this.pathMapImage) return 0;

        const halfSize = this.terrainSize / 2;
        const u = (x + halfSize) / this.terrainSize;
        const v = (z + halfSize) / this.terrainSize;

        if (u < 0 || u > 1 || v < 0 || v > 1) return 0;

        const px = Math.floor(u * (this.pathMapImage.width - 1));
        const py = Math.floor(v * (this.pathMapImage.height - 1));

        const idx = (py * this.pathMapImage.width + px) * 4;
        return this.pathMapImage.data[idx] / 255;
    }

    initPlacement() {
        const halfSize = this.terrainSize / 2 - 25;
        const minX = -halfSize;
        const maxX = halfSize;
        const minZ = -halfSize;
        const maxZ = halfSize;

        const candidates = PlacementUtils.generateScatterPositions({
            count: 50,
            minX, maxX, minZ, maxZ,
            minDistance: 15.0,
            maxAttempts: 100
        });

        this.treeItems = [];

        for (const candidate of candidates) {
            const x = candidate.x;
            const z = candidate.z;

            const pathValue = this.getPathValue(x, z);
            if (pathValue > 0.15) continue;

            const height = this.ground ? this.ground.getHeight(x, z) : 0;
            if (height < -0.5) continue;

            let overlapsRock = false;
            if (this.scene.rocks && this.scene.rocks.rockItems) {
                for (const rock of this.scene.rocks.rockItems) {
                    const dx = x - rock.x;
                    const dz = z - rock.z;
                    const distSq = dx * dx + dz * dz;
                    const minAllowedDist = (rock.size * 1.5) + 3.0;
                    if (distSq < minAllowedDist * minAllowedDist) {
                        overlapsRock = true;
                        break;
                    }
                }
            }
            if (overlapsRock) continue;

            const trunkHeight = 2.2 + Math.random() * 1.6;
            const trunkRadius = 0.18 + Math.random() * 0.12;
            const canopyHeight = 3.2 + Math.random() * 2.2;
            const canopyRadius = 1.4 + Math.random() * 0.9;
            const rotationAngle = Math.random() * Math.PI * 2;

            const treeInstance = new MyTree(
                this.scene,
                trunkHeight,
                trunkRadius,
                canopyHeight,
                canopyRadius
            );

            const treeY = height + trunkHeight * 0.5;
            const treeColliderRadius = trunkRadius * 4.0;

            this.treeItems.push({
                x,
                y: height,
                z,
                rotation: rotationAngle,
                trunkRadius,
                canopyRadius,
                tree: treeInstance,
                collider: new CollisionSphere(x, treeY, z, treeColliderRadius)
            });
        }
    }

    display() {
        for (const item of this.treeItems) {
            this.scene.pushMatrix();
            this.scene.translate(item.x, item.y, item.z);
            this.scene.rotate(item.rotation, 0, 1, 0);
            
            item.tree.display(this.trunkAppearance, this.canopyAppearance);
            
            this.scene.popMatrix();
        }
    }
}
