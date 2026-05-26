import { CGFappearance, CGFtexture } from "../../../lib/CGF.js";
import { MyPerturbedSphere } from "../../shapes/MyPerturbedSphere.js";

export class MyRock {
    constructor(scene, appearances, size = 1, seed = 0) {
        const SEED_MULTIPLIER = 12.9898;
        const HASH_MULTIPLIER = 43758.5453;
        const ROUGHNESS_BIAS_POWER = 1.7; // bias toward rougher rocks
        const BASE_PERTURBATION = 0.6;
        const ROUGHNESS_PERTURBATION_RANGE = 0.5; // 0.6-1.1: high-roughness rocks get extra amplitude

        this.scene = scene;
        this.size = size;
        this.seed = seed;
        this.appearances = appearances;

        // Vary roughness and perturbation based on seed for rock diversity
        const seedHash = Math.abs(Math.sin(seed * SEED_MULTIPLIER) * HASH_MULTIPLIER);
        const uniformRoughness = seedHash % 1;
        const roughness = 1 - Math.pow(1 - uniformRoughness, ROUGHNESS_BIAS_POWER);
        const perturbationStrength = BASE_PERTURBATION + (roughness * ROUGHNESS_PERTURBATION_RANGE);
        
        // Create perturbed sphere geometry with procedural generation
        this.geometry = new MyPerturbedSphere(
            scene,
            16,                         // slices - preserve detail while keeping shape defined
            16,                         // stacks - preserve detail while keeping shape defined
            1,                          // radius (will be scaled)
            perturbationStrength,       // varies per rock
            seed,                       // seed for consistent appearance per rock
            roughness                   // roughness: 0=smooth, 1=very jagged
        );
    }

    getAppearance() {
        const textureIndex = this.seed % this.appearances.length;
        return this.appearances[textureIndex];
    }

    display() {
        this.scene.pushMatrix();
        this.scene.scale(this.size, this.size, this.size);

        const appearance = this.getAppearance();
        appearance.apply();

        this.geometry.display();

        this.scene.popMatrix();
    }
}
