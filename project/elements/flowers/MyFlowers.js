import { MyFlower } from "./MyFlower.js";
import * as PlacementUtils from "../../utils/PlacementUtils.js";
import { CGFshader } from "../../../lib/CGF.js";
import { MyFlowersStemsMesh } from "./MyFlowersStemsMesh.js";
import { MyFlowersCentersMesh } from "./MyFlowersCentersMesh.js";
import { MyFlowersPetalsMesh } from "./MyFlowersPetalsMesh.js";

export class MyFlowers {
    constructor(scene, ground) {
        this.scene = scene;
        this.ground = ground;
        this.flowerItems = [];
        this.terrainSize = 400;
        this.time = 0;

        const pathData = scene.assetManager.getPixelData('path');
        this.pathMapImage = pathData;

        this.flowerColors = [
            [0.87, 0.02, 0.15],  // red
            [0.82, 0.44, 0.06],  // orange
            [1, 0.91, 0.36],     // yellow
            [0.35, 0.51, 0.28],  // green
            [0.20, 0.35, 0.46],  // blue
            [0.87, 0.07, 0.33],  // magenta
            [1, 0.44, 0.55],     // pink
            [0.46, 0.41, 0.71],  // lilac
        ];

        this.flowerShader = new CGFshader(scene.gl, "shaders/flower.vert", "shaders/flower.frag");
        
        this.scene.setActiveShader(this.flowerShader);
        this.flowerShader.setUniformsValues({
            uWindSpeed: 1.8,
            uWindStrength: 0.06
        });
        this.scene.setActiveShader(this.scene.defaultShader);

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

                // avoid dead grass patches
                let overlapsDeadGrass = false;
                if (this.scene.grass && this.scene.grass.deadPatchGroups) {
                    for (const group of this.scene.grass.deadPatchGroups) {
                        const dx = x - group.center.x;
                        const dz = z - group.center.z;
                        const distSq = dx * dx + dz * dz;
                        // the max distance of dead grass in this group is Math.sqrt(group.radius)
                        // add buffer of 2.0 units to clear the patch boundary
                        const maxDist = Math.sqrt(group.radius) + 2.0;
                        if (distSq < maxDist * maxDist) {
                            overlapsDeadGrass = true;
                            break;
                        }
                    }
                }
                if (overlapsDeadGrass) continue;

                // randomize flower properties
                const scale = 0.45 + Math.random() * 0.4;
                const petalCount = 8 + Math.floor(Math.random() * 8);
                const color = this.flowerColors[Math.floor(Math.random() * this.flowerColors.length)];
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

        // batched meshes in chunks to stay under the 16-bit index limit
        this.stemsMeshes = [];
        const STEMS_CHUNK = 200;
        for (let i = 0; i < this.flowerItems.length; i += STEMS_CHUNK) {
            const chunk = this.flowerItems.slice(i, i + STEMS_CHUNK);
            this.stemsMeshes.push(new MyFlowersStemsMesh(this.scene, chunk));
        }

        this.centersMeshes = [];
        const CENTERS_CHUNK = 250;
        for (let i = 0; i < this.flowerItems.length; i += CENTERS_CHUNK) {
            const chunk = this.flowerItems.slice(i, i + CENTERS_CHUNK);
            this.centersMeshes.push(new MyFlowersCentersMesh(this.scene, chunk));
        }

        this.petalsMeshes = []; // 2D array: [colorIndex][chunkIndex]
        const PETALS_CHUNK = 18;
        for (let i = 0; i < this.flowerColors.length; i++) {
            const groupFlowers = this.flowerItems.filter(item => {
                const fCol = item.flower.petalColor;
                const col = this.flowerColors[i];
                return Math.abs(fCol[0] - col[0]) < 0.01 && 
                       Math.abs(fCol[1] - col[1]) < 0.01 && 
                       Math.abs(fCol[2] - col[2]) < 0.01;
            });

            this.petalsMeshes[i] = [];
            for (let j = 0; j < groupFlowers.length; j += PETALS_CHUNK) {
                const chunk = groupFlowers.slice(j, j + PETALS_CHUNK);
                this.petalsMeshes[i].push(new MyFlowersPetalsMesh(this.scene, chunk));
            }
        }
    }

    update(time) {
        this.time = time;
    }

    display() {
        this.scene.setActiveShader(this.flowerShader);
        this.flowerShader.setUniformsValues({
            uTime: this.time,
            uLightEnabled: this.scene.lights[0].enabled,
            uLightPosition: this.scene.lights[0].position
        });

        // all stems (green)
        this.flowerShader.setUniformsValues({ uColor: [0.12, 0.55, 0.12, 1.0] });
        for (const mesh of this.stemsMeshes) {
            mesh.display();
        }

        // all centers (yellow)
        this.flowerShader.setUniformsValues({ uColor: [0.85, 0.65, 0.08, 1.0] });
        for (const mesh of this.centersMeshes) {
            mesh.display();
        }

        // all petals by color group
        for (let i = 0; i < this.flowerColors.length; i++) {
            const col = this.flowerColors[i];
            this.flowerShader.setUniformsValues({ uColor: [col[0], col[1], col[2], 1.0] });
            for (const mesh of this.petalsMeshes[i]) {
                mesh.display();
            }
        }

        this.scene.setActiveShader(this.scene.defaultShader);
    }
}
