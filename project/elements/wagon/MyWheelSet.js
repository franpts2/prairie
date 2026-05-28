import { CGFobject } from '../../../lib/CGF.js';
import { MyWheel } from './MyWheel.js';
import { MyAxle } from './MyAxle.js';

export class MyWheelSet extends CGFobject {
    constructor(scene, woodAppearance) {
        super(scene);
        this.wheel = new MyWheel(scene, woodAppearance);
        this.axle = new MyAxle(scene, woodAppearance);
    }

    display(wheelRotationAngle = 0) {
        // --- Axle ---
        this.scene.pushMatrix();
        this.scene.translate(-2.2, 0, 0); // Axle is drawn from X=0 to 4.4, so offset to center it
        this.axle.display();
        this.scene.popMatrix();

        // --- Right Wheel ---
        this.scene.pushMatrix();
        this.scene.translate(2.2, 0, 0);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.scene.rotate(wheelRotationAngle, 0, 0, 1);
        this.wheel.display();
        this.scene.popMatrix();

        // --- Left Wheel ---
        this.scene.pushMatrix();
        this.scene.translate(-2.2, 0, 0);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.scene.rotate(wheelRotationAngle, 0, 0, 1);
        this.wheel.display();
        this.scene.popMatrix();
    }
}
