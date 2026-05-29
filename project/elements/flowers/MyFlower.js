import { CGFappearance } from "../../../lib/CGF.js";
import { MySphere } from "../../shapes/MySphere.js";
import { MyFlowerStemMesh } from "./MyFlowerStemMesh.js";
import { MyFlowerPetalsMesh } from "./MyFlowerPetalsMesh.js";

/**
 * MyFlower
 * @constructor
 * @param scene - Reference to MyScene object
 * @param petalCount - Number of petals per layer (default 12)
 * @param petalColor - Array of 3 floats [r, g, b] (default pink)
 * @param flowerScale - Scale factor for the flower head (default 1.0)
 * @param windStrength - Strength of the swaying animation (default 1.0)
 */
export class MyFlower {
    constructor(scene, petalCount = 12, petalColor = [0.9, 0.25, 0.35], flowerScale = 1.0, windStrength = 1.0) {
        this.scene = scene;
        this.petalCount = petalCount;
        this.petalColor = petalColor;
        this.flowerScale = flowerScale;
        this.windStrength = windStrength;

        // stem parameters
        this.numStemSegments = 3;
        this.segmentLength = 0.5;
        this.stemRadius = 0.03;

        // center parameters
        this.centerRadius = 0.4;
        this.centerHeight = 0.3;

        // petal parameters
        this.petalWidth = 0.25;
        this.petalLength = 0.85;
        this.petalThickness = 0.05;
        this.petalTiltOuter = 0.10;
        this.petalTiltInner = 0.10;

        // geometry primitives (pre-compiled VBOs)
        this.stemMesh = new MyFlowerStemMesh(scene, this.stemRadius, this.segmentLength, this.numStemSegments);
        this.petalsMesh = new MyFlowerPetalsMesh(scene, {
            petalCount: this.petalCount,
            petalWidth: this.petalWidth,
            petalLength: this.petalLength,
            petalThickness: this.petalThickness,
            petalTiltOuter: this.petalTiltOuter,
            petalTiltInner: this.petalTiltInner,
            centerRadius: this.centerRadius
        });

        // center sphere (same size as original, radius 0.5, scaled in display)
        this.centerSphere = new MySphere(scene, 20, 10, 0.50);

        this.time = 0;

        this.initMaterials();
    }

    initMaterials() {
        // stem material - green
        this.stemMaterial = new CGFappearance(this.scene);
        this.stemMaterial.setAmbient(0.08, 0.35, 0.08, 1.0);
        this.stemMaterial.setDiffuse(0.12, 0.55, 0.12, 1.0);
        this.stemMaterial.setSpecular(0.05, 0.15, 0.05, 1.0);
        this.stemMaterial.setShininess(10.0);

        // center material - yellow with soft shine
        this.centerMaterial = new CGFappearance(this.scene);
        this.centerMaterial.setAmbient(0.65, 0.5, 0.05, 1.0);
        this.centerMaterial.setDiffuse(0.85, 0.65, 0.08, 1.0);
        this.centerMaterial.setSpecular(0.15, 0.15, 0.1, 1.0);
        this.centerMaterial.setShininess(8.0);

        this.petalMaterial = new CGFappearance(this.scene);
        this.updatePetalMaterial();
    }

    updatePetalMaterial() {
        const r = this.petalColor[0];
        const g = this.petalColor[1];
        const b = this.petalColor[2];

        // petal material - satiny appearance
        this.petalMaterial.setAmbient(r * 0.7, g * 0.7, b * 0.7, 1.0);
        this.petalMaterial.setDiffuse(r, g, b, 1.0);
        this.petalMaterial.setSpecular(0.6, 0.6, 0.6, 1.0);
        this.petalMaterial.setShininess(30.0);
    }

    update(time) {
        this.time = time;
    }

    display() {
        this.updatePetalMaterial();

        this.scene.pushMatrix();

        this.scene.scale(this.flowerScale, this.flowerScale, this.flowerScale);

        // calculate dynamic sway angle based on wind strength and time
        const swayFreq = 1.8;
        const baseSway = Math.sin(this.time * swayFreq);
        const windAngleX = baseSway * 0.035 * this.windStrength;
        const windAngleZ = Math.cos(this.time * swayFreq * 0.7) * 0.02 * this.windStrength;

        // wind sway rotation at the root of the flower
        this.scene.rotate(windAngleX * 1.5, 1, 0, 0);
        this.scene.rotate(windAngleZ * 1.5, 0, 0, 1);

        // consolidated stem segments
        this.stemMaterial.apply();
        this.stemMesh.display();

        // replicate pos at the top of the bent stem
        for (let i = 0; i < this.numStemSegments; i++) {
            this.scene.rotate(0.05, 0, 0, 1);
            this.scene.rotate(0.02, 1, 0, 0);
            this.scene.translate(0, this.segmentLength, 0);
        }

        // flower center
        this.scene.pushMatrix();
        this.scene.scale(-this.centerRadius, this.centerHeight, this.centerRadius);
        this.centerMaterial.apply();
        this.centerSphere.display();
        this.scene.popMatrix();

        // flower petals
        this.petalMaterial.apply();
        this.petalsMesh.display();

        this.scene.popMatrix();
    }
}
