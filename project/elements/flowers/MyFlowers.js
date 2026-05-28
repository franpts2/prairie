import { MyFlower } from "./MyFlower.js";
import * as PlacementUtils from "../../utils/PlacementUtils.js";

export class MyFlowers {
    constructor(scene, ground) {
        this.scene = scene;
        this.ground = ground;
        this.flowerItems = [];
        this.terrainSize = 400;

        const pathData = scene.assetManager.getPixelData('path');
        this.pathMapImage = pathData;

        this.initPlacement();
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

        const flowerColors = [
            [0.87, 0.02, 0.15],  // Red
            [0.82, 0.44, 0.06],  // Orange
            [1, 0.91, 0.36],     // Yellow
            [0.35, 0.51, 0.28],  // Green
            [0.20, 0.35, 0.46],  // Blue
            [0.87, 0.07, 0.33],  // Magenta
            [1, 0.44, 0.55],     // Pink
            [0.46, 0.41, 0.71],  // Lilac
        ];

        // generate clusters of flowers
        const groups = PlacementUtils.generateClusteredPositions({
            groupCount: 80,
            minGroupSize: 8,
            maxGroupSize: 30,
            minX, maxX, minZ, maxZ,
            minGroupDistance: 20,
            clusterRadius: { min: 5, max: 80 },
            minItemDistance: 2.0,
        });

        this.flowerItems = [];

        for (const group of groups) {
            for (const item of group.items) {
                const x = item.x;
                const z = item.z;

                if (x * x + z * z > 200 * 200) continue;

                // avoid the path
                const pathValue = this.getPathValue(x, z);
                if (pathValue > 0.15) continue;

                // get height and avoid underwater
                const height = this.ground ? this.ground.getHeight(x, z) : 0;
                if (height < -0.5) continue;

                // avoid rocks
                let overlapsRock = false;
                if (this.scene.rocks && this.scene.rocks.rockItems) {
                    for (const rock of this.scene.rocks.rockItems) {
                        const dx = x - rock.x;
                        const dz = z - rock.z;
                        const distSq = dx * dx + dz * dz;
                        const minAllowedDist = (rock.size * 1.2) + 0.8;
                        if (distSq < minAllowedDist * minAllowedDist) {
                            overlapsRock = true;
                            break;
                        }
                    }
                }
                if (overlapsRock) continue;

                // avoid overlapping trees
                let overlapsTree = false;
                if (this.scene.trees && this.scene.trees.treeItems) {
                    for (const tree of this.scene.trees.treeItems) {
                        const dx = x - tree.x;
                        const dz = z - tree.z;
                        const distSq = dx * dx + dz * dz;
                        const minAllowedDist = tree.trunkRadius + 1.2;
                        if (distSq < minAllowedDist * minAllowedDist) {
                            overlapsTree = true;
                            break;
                        }
                    }
                }
                if (overlapsTree) continue;

                // randomize flower properties
                const scale = 0.45 + Math.random() * 0.4;
                const petalCount = 8 + Math.floor(Math.random() * 8);
                const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
                const timeOffset = Math.random() * 100.0;

                const flowerInstance = new MyFlower(
                    this.scene,
                    petalCount,
                    color,
                    scale,
                    1.0
                );

                this.flowerItems.push({
                    x,
                    y: height,
                    z,
                    timeOffset,
                    flower: flowerInstance
                });
            }
        }
    }

    update(time) {
        for (const item of this.flowerItems) {
            item.flower.update(time + item.timeOffset);
        }
    }

    display() {
        for (const item of this.flowerItems) {
            this.scene.pushMatrix();
            this.scene.translate(item.x, item.y, item.z);
            item.flower.display();
            this.scene.popMatrix();
        }
    }
}
