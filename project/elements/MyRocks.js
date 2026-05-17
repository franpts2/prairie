import { MyRock } from "./MyRock.js";
import * as PlacementUtils from "../utils/PlacementUtils.js";

export class MyRocks {
    constructor(scene, ground) {
        this.scene = scene;
        this.ground = ground;
        this.rockItems = [];

        this.initPlacement();
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
            groupCount: 10,
            minGroupSize: 1,
            maxGroupSize: 10,
            minX: -120,
            maxX: 120,
            minZ: -120,
            maxZ: 120,
            minGroupDistance: 50,
            clusterRadius: 20,
            minItemDistance: 5,
        });

        const rockCandidates = groups.flatMap((group, groupIndex) =>
            group.items.map((item, itemIndex) => {
                const seed = groupIndex * 100 + itemIndex;
                return {
                    x: item.x,
                    z: item.z,
                    size: this.getRockSize(),
                    rotation: Math.random() * Math.PI * 2,
                    groupIndex,
                    rock: new MyRock(this.scene, 1, seed),
                };
            })
        );

        this.rockItems = [];
        rockCandidates
            .sort((a, b) => b.size - a.size)
            .forEach((candidate) => {
                if (this.rockItems.every((rock) => !this.rocksOverlap(candidate, rock))) {
                    this.rockItems.push(candidate);
                }
            });
    }

    display() {
        for (const rock of this.rockItems) {
            const height = this.ground ? this.ground.getHeight(rock.x, rock.z) : 0;
            this.scene.pushMatrix();
            this.scene.translate(rock.x, height + rock.size * 0.8, rock.z);
            this.scene.rotate(rock.rotation, 0, 1, 0);
            this.scene.scale(rock.size, rock.size, rock.size);
            rock.rock.display();
            this.scene.popMatrix();
        }
    }
}
