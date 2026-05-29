import { MyRock } from "./MyRock.js";
import { CGFappearance, CGFtexture } from "../../../lib/CGF.js";
import * as PlacementUtils from "../../utils/PlacementUtils.js";
import { CollisionSphere } from "../../utils/CollisionSphere.js";
import { MyRocksMesh } from "./MyRocksMesh.js";

export class MyRocks {
    constructor(scene, ground) {
        this.scene = scene;
        this.ground = ground;
        this.rockItems = [];
        this.terrainSize = 400;

        const pathData = scene.assetManager.getPixelData('path');
        this.pathMapImage = pathData;

        this.rockAppearances = this.initAppearances();
        this.initPlacement();
    }

    initAppearances() {
        const textureKeys = ['rock1', 'rock2', 'rock3', 'rock4'];
        const appearances = [];
        for (let i = 0; i < textureKeys.length; i++) {
            const appearance = new CGFappearance(this.scene);
            appearance.setAmbient(0.3, 0.3, 0.3, 1.0);
            appearance.setDiffuse(0.6, 0.6, 0.6, 1.0);
            appearance.setSpecular(0.2, 0.2, 0.2, 1.0);
            appearance.setShininess(10.0);

            const texture = this.scene.assetManager.getTexture(textureKeys[i]);
            appearance.setTexture(texture);
            appearance.setTextureWrap("REPEAT", "REPEAT");

            appearances.push(appearance);
        }
        return appearances;
    }

    getPathValue(x, z) {
        if (!this.pathMapImage) return 0;

        const halfSize = this.terrainSize / 2;
        const u = (x + halfSize) / this.terrainSize;
        const v = (z + halfSize) / this.terrainSize;

        const px = Math.floor(u * (this.pathMapImage.width - 1));
        const py = Math.floor(v * (this.pathMapImage.height - 1));

        const idx = (py * this.pathMapImage.width + px) * 4;
        const pathValue = this.pathMapImage.data[idx] / 255;

        return pathValue;
    }

    getRockSize() {
        const sizeRoll = Math.random();

        if (sizeRoll < 0.45) {
            return 0.2 + Math.random() * 0.3; // small stones (0.2 - 0.5)
        }

        if (sizeRoll < 0.90) {
            return 0.5 + Math.random() * 0.5; // regular rocks (0.5 - 1.0)
        }

        return 1.0 + Math.random() * 0.5; // boulders (1.0 - 1.5)
    }

    rocksOverlap(a, b) {
        const ROCK_RADIUS_PADDING = 1.25;
        const ROCK_GAP = 0.35;
        const dx = a.x - b.x;
        const dz = a.z - b.z;
        const minDistance = (a.size + b.size) * ROCK_RADIUS_PADDING + ROCK_GAP;

        return dx * dx + dz * dz < minDistance * minDistance;
    }

    initPlacement() {
        const groups = PlacementUtils.generateClusteredPositions({
            groupCount: 20,
            minGroupSize: 1,
            maxGroupSize: 10,
            minX: -120,
            maxX: 120,
            minZ: -120,
            maxZ: 120,
            minGroupDistance: 50,
            clusterRadius: { min: 5, max: 15 },
            minItemDistance: 5,
        });

        const rockCandidates = groups.flatMap((group, groupIndex) =>
            group.items.map((item, itemIndex) => {
                
                if (item.x * item.x + item.z * item.z > 200 * 200) return null;

                const seed = groupIndex * 100 + itemIndex;
                const size = this.getRockSize();
                const height = this.ground ? this.ground.getHeight(item.x, item.z) : 0;
                const rockY = height + size * 0.2;
                return {
                    x: item.x,
                    z: item.z,
                    size: size,
                    rotation: Math.random() * Math.PI * 2,
                    groupIndex,
                    rock: new MyRock(this.scene, this.rockAppearances, 1, seed),
                    collider: new CollisionSphere(item.x, rockY, item.z, size * 1.6)
                };
            })
        ).filter(item => item !== null);

        this.rockItems = [];
        rockCandidates
            .sort((a, b) => b.size - a.size)
            .forEach((candidate) => {
                const pathValue = this.getPathValue(candidate.x, candidate.z);
                if (pathValue > 0.5) return;

                if (this.rockItems.every((rock) => !this.rocksOverlap(candidate, rock))) {
                    this.rockItems.push(candidate);
                }
            });

        // Build the batched meshes per texture appearance group
        this.rockMeshes = [];
        for (let i = 0; i < this.rockAppearances.length; i++) {
            const groupRocks = this.rockItems.filter(r => (r.rock.seed % this.rockAppearances.length) === i);
            if (groupRocks.length > 0) {
                this.rockMeshes[i] = new MyRocksMesh(this.scene, groupRocks, this.ground);
            } else {
                this.rockMeshes[i] = null;
            }
        }
    }

    display() {
        for (let i = 0; i < this.rockAppearances.length; i++) {
            if (this.rockMeshes[i]) {
                this.rockAppearances[i].apply();
                this.rockMeshes[i].display();
            }
        }
    }
}
