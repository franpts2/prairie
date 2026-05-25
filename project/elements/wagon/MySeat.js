import { CGFobject } from '../../../lib/CGF.js';
import { MyUnitCube } from '../../shapes/MyUnitCube.js';

export class MySeat extends CGFobject {
    constructor(scene, width = 2, woodAppearance) {
        super(scene);
        this.width = width;
        this.woodAppearance = woodAppearance;

        // --- Tiled Plank Instances ---
        this.benchPlank = new MyUnitCube(scene, width, 0.1, 0.28);      // Bench Plank: width x 0.1 x 0.28
        this.backrestPlank = new MyUnitCube(scene, width, 0.28, 0.1);   // Backrest Plank: width x 0.28 x 0.1
        this.supportBeam = new MyUnitCube(scene, 0.15, 1.15, 0.4);      // Support Beam: 0.15 x 1.15 x 0.4
    }

    display() {
        if (this.woodAppearance) this.woodAppearance.apply();

        // --- Seat Bench (2 planks) ---
        // Front plank
        this.scene.pushMatrix();
        this.scene.translate(0, 0, -0.15);
        this.scene.scale(this.width, 0.1, 0.28);
        this.benchPlank.display();
        this.scene.popMatrix();
        
        // Back plank
        this.scene.pushMatrix();
        this.scene.translate(0, 0, 0.15);
        this.scene.scale(this.width, 0.1, 0.28);
        this.benchPlank.display();
        this.scene.popMatrix();
        
        // --- Seat Backrest (2 planks) ---
        // Bottom plank
        this.scene.pushMatrix();
        this.scene.translate(0, 0.15, 0.3);
        this.scene.scale(this.width, 0.28, 0.1);
        this.backrestPlank.display();
        this.scene.popMatrix();

        // Top plank
        this.scene.pushMatrix();
        this.scene.translate(0, 0.45, 0.3);
        this.scene.scale(this.width, 0.28, 0.1);
        this.backrestPlank.display();
        this.scene.popMatrix();

        // --- Supports ---
        // Left Seat Support
        this.scene.pushMatrix();
        this.scene.translate(-this.width * 0.4, -0.625, 0);
        this.scene.scale(0.15, 1.15, 0.4);
        this.supportBeam.display();
        this.scene.popMatrix();

        // Right Seat Support
        this.scene.pushMatrix();
        this.scene.translate(this.width * 0.4, -0.625, 0);
        this.scene.scale(0.15, 1.15, 0.4);
        this.supportBeam.display();
        this.scene.popMatrix();

        this.scene.setDefaultAppearance();
    }
}
