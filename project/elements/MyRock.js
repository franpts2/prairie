import { CGFappearance, CGFtexture } from "../../lib/CGF.js";
import { MyPerturbedSphere } from "../shapes/MyPerturbedSphere.js";

export class MyRock {
    constructor(scene, size = 1, seed = 0) {
        this.scene = scene;
        this.size = size;
        this.seed = seed;

        // Create perturbed sphere geometry with vertex perturbation
        this.geometry = new MyPerturbedSphere(
            scene,
            16,           // slices
            16,           // stacks
            1,            // radius (will be scaled)
            0.25,         // perturbationStrength - creates irregularity
            seed          // seed for consistent appearance per rock
        );

        // Array of rock textures for variety
        this.textureNames = [
            "./images/rock1.png",
            "./images/rock2.png",
            "./images/rock3.png",
            "./images/rock4.png",
        ];

        // appearances for different rock textures
        this.appearances = [];
        this.setupAppearances();
    }

    setupAppearances() {
        for (let i = 0; i < this.textureNames.length; i++) {
            const appearance = new CGFappearance(this.scene);
            appearance.setAmbient(0.3, 0.3, 0.3, 1.0);
            appearance.setDiffuse(0.6, 0.6, 0.6, 1.0);
            appearance.setSpecular(0.2, 0.2, 0.2, 1.0);
            appearance.setShininess(10.0);

            try {
                const texture = new CGFtexture(this.scene, this.textureNames[i]);
                appearance.setTexture(texture);
                appearance.setTextureWrap("REPEAT", "REPEAT");
            } catch (e) {
                appearance.setAmbient(0.4, 0.35, 0.3, 1.0);
                appearance.setDiffuse(0.6, 0.5, 0.4, 1.0);
            }

            this.appearances.push(appearance);
        }
    }

    /**
     * Get appearance based on seed for consistent texture per rock
     */
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
