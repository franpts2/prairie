import { MyUnitCube } from "../shapes/MyUnitCube.js";
import { CGFappearance } from "../../lib/CGF.js";

export class MyDepositedHaybalesArea {
    constructor(scene) {
        this.scene = scene;

        this.centerX = -55;
        this.centerZ = -90;

        this.cols = 4;
        this.rows = 4;
        this.spacingX = 1.3;
        this.spacingZ = 1.3;
        this.balesPerLayer = this.cols * this.rows;

        this.baseX = this.centerX - ((this.cols - 1) * this.spacingX) / 2; // -61.95
        this.baseZ = this.centerZ - ((this.rows - 1) * this.spacingZ) / 2; // -91.95

        this.plankThickness = 0.15;
    }

    depositBales(capturedBales, startIndex) {
        // Unified ground height at the center of the platform
        const unifiedGroundHeight = this.scene.ground ? this.scene.ground.getHeight(this.centerX, this.centerZ) : 0;

        for (let i = 0; i < capturedBales.length; i++) {
            const bale = capturedBales[i];
            const k = startIndex + i;

            const layer = Math.floor(k / this.balesPerLayer);
            const localIndex = k % this.balesPerLayer;
            const col = localIndex % this.cols;
            const row = Math.floor(localIndex / this.cols);

            bale.x = this.baseX + col * this.spacingX;
            bale.z = this.baseZ + row * this.spacingZ;
            bale.rotation = Math.PI / 2; // aligned lengthwise

            // Calculate height correction to cancel sloped terrain differences and align hay bales to the flat wooden floor
            const localHeight = this.scene.ground ? this.scene.ground.getHeight(bale.x, bale.z) : 0;
            const heightCorrection = unifiedGroundHeight - localHeight;

            // Shift haybales up by plankThickness, correct for terrain slope, and subtract half-height discrepancy so they sit directly on the wood planks (no space)
            bale.yOffset = heightCorrection + this.plankThickness - 0.2 * bale.scale + layer * (0.58 * bale.scale);

            bale.captured = false; // make it render again in the world
            bale.collider = null;  // remove collider so it can never be collected again
        }
    }

    display() {
        if (!this.woodAppearance) {
            this.woodAppearance = new CGFappearance(this.scene);
            this.woodAppearance.setAmbient(0.4, 0.2, 0.1, 1.0);
            this.woodAppearance.setDiffuse(0.5, 0.3, 0.1, 1.0);
            this.woodAppearance.setSpecular(0.1, 0.1, 0.1, 1.0);
            this.woodAppearance.setShininess(5.0);

            const woodTexture = this.scene.assetManager.getTexture('wood');
            if (woodTexture) {
                this.woodAppearance.setTexture(woodTexture);
                this.woodAppearance.setTextureWrap('REPEAT', 'REPEAT');
            }

            // Set texture scaling matching physical plank and support dimensions to prevent stretching (matching wagon bed aspect ratio)
            this.plankCube = new MyUnitCube(this.scene, 0.9, 0.15, 6.0);
            this.supportCube = new MyUnitCube(this.scene, 5.9, 0.1, 0.25);
        }

        if (this.woodAppearance) {
            this.woodAppearance.apply();
        }

        const totalPlanks = 6;
        const plankWidth = 0.9;
        const plankGap = 0.1;
        const plankLength = 6.0;

        const totalWidth = totalPlanks * plankWidth + (totalPlanks - 1) * plankGap;
        const startX = this.centerX - totalWidth / 2 + plankWidth / 2;

        const groundHeight = this.scene.ground ? this.scene.ground.getHeight(this.centerX, this.centerZ) : 0;

        // support beams below the planks
        const supportThickness = 0.1;
        const supportWidthZ = 0.25;
        const supportLengthX = totalWidth;
        const offsetZ = 2.2;

        const supportZs = [this.centerZ - offsetZ, this.centerZ + offsetZ];
        for (let sz of supportZs) {
            const sy = groundHeight - supportThickness / 2;

            this.scene.pushMatrix();
            this.scene.translate(this.centerX, sy, sz);
            this.scene.scale(supportLengthX, supportThickness, supportWidthZ);
            this.supportCube.display();
            this.scene.popMatrix();
        }

        for (let i = 0; i < totalPlanks; i++) {
            const px = startX + i * (plankWidth + plankGap);
            const pz = this.centerZ;

            const py = groundHeight + this.plankThickness / 2;

            this.scene.pushMatrix();
            this.scene.translate(px, py, pz);
            this.scene.scale(plankWidth, this.plankThickness, plankLength);
            this.plankCube.display();
            this.scene.popMatrix();
        }

        this.scene.setDefaultAppearance();
    }
}
