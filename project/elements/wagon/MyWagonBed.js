import { CGFobject, CGFappearance } from '../../../lib/CGF.js';
import { MyUnitCube } from '../../shapes/MyUnitCube.js';


export class MyWagonBed extends CGFobject {
    constructor(scene) {
        super(scene);
        this.cube = new MyUnitCube(scene);

        this.woodAppearance = new CGFappearance(scene);
        this.woodAppearance.setAmbient(0.4, 0.2, 0.1, 1.0);
        this.woodAppearance.setDiffuse(0.5, 0.3, 0.1, 1.0);
        this.woodAppearance.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.woodAppearance.setShininess(5.0);
    }

    display() {
        this.woodAppearance.apply();

        // --- Base ---
        this.scene.pushMatrix();
        this.scene.scale(2, 0.2, 4);
        this.cube.display();
        this.scene.popMatrix();

        // --- Back Wall ---
        this.scene.pushMatrix();
        this.scene.translate(0, 0.5, 1.95);
        this.scene.scale(2, 0.8, 0.1);
        this.cube.display();
        this.scene.popMatrix();

        // --- Front Wall ---
        this.scene.pushMatrix();
        this.scene.translate(0, 0.5, -1.95);
        this.scene.scale(2, 0.8, 0.1);
        this.cube.display();
        this.scene.popMatrix();

        // --- Left Wall ---
        this.scene.pushMatrix();
        this.scene.translate(-0.95, 0.5, 0);
        this.scene.scale(0.1, 0.8, 4);
        this.cube.display();
        this.scene.popMatrix();

        // --- Right Wall ---
        this.scene.pushMatrix();
        this.scene.translate(0.95, 0.5, 0);
        this.scene.scale(0.1, 0.8, 4);
        this.cube.display();
        this.scene.popMatrix();

        this.scene.setDefaultAppearance();
    }
}
