import { CGFobject } from '../../../lib/CGF.js';
import { MyUnitCube } from '../../shapes/MyUnitCube.js';

export class MyBed extends CGFobject {
    constructor(scene, woodAppearance) {
        super(scene);
        this.cube = new MyUnitCube(scene);
        this.woodAppearance = woodAppearance;
    }

    display() {
        if (this.woodAppearance) this.woodAppearance.apply();

        // --- Base ---
        this.scene.pushMatrix();
        this.scene.scale(3.4, 0.2, 7);
        this.cube.display();
        this.scene.popMatrix();

        // --- Back Wall ---
        this.scene.pushMatrix();
        this.scene.translate(0, 0.7, 3.45);
        this.scene.scale(3.4, 2.0, 0.1);
        this.cube.display();
        this.scene.popMatrix();

        // --- Front Wall ---
        this.scene.pushMatrix();
        this.scene.translate(0, 0.7, -3.45);
        this.scene.scale(3.4, 2.0, 0.1);
        this.cube.display();
        this.scene.popMatrix();

        // --- Left Wall ---
        this.scene.pushMatrix();
        this.scene.translate(-1.65, 0.7, 0);
        this.scene.scale(0.1, 2.0, 7);
        this.cube.display();
        this.scene.popMatrix();

        // --- Right Wall ---
        this.scene.pushMatrix();
        this.scene.translate(1.65, 0.7, 0);
        this.scene.scale(0.1, 2.0, 7);
        this.cube.display();
        this.scene.popMatrix();

        this.scene.setDefaultAppearance();
    }
}
