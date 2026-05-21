import { CGFobject } from '../../../lib/CGF.js';
import { MyWagonBed } from './MyWagonBed.js';
import { MyWheel } from './MyWheel.js';

export class MyWagon extends CGFobject {
    constructor(scene) {
        super(scene);
        this.bed = new MyWagonBed(scene);
        this.wheel = new MyWheel(scene);
    }

    display() {
        // --- Bed ---
        this.scene.pushMatrix();
        this.scene.translate(0, 1, 0); // Lift bed above ground
        this.bed.display();
        this.scene.popMatrix();

        // --- Wheels ---
        // Back Right
        this.scene.pushMatrix();
        this.scene.translate(1.1, 1, 1.5);
        this.wheel.display();
        this.scene.popMatrix();

        // Back Left
        this.scene.pushMatrix();
        this.scene.translate(-1.1, 1, 1.5);
        this.wheel.display();
        this.scene.popMatrix();

        // Front Right
        this.scene.pushMatrix();
        this.scene.translate(1.1, 1, -1.5);
        this.wheel.display();
        this.scene.popMatrix();

        // Front Left
        this.scene.pushMatrix();
        this.scene.translate(-1.1, 1, -1.5);
        this.wheel.display();
        this.scene.popMatrix();
    }
}
