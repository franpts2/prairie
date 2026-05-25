import { CGFobject } from '../../../lib/CGF.js';
import { MyCylinder } from '../../shapes/MyCylinder.js';

export class MyAxle extends CGFobject {
    constructor(scene, woodAppearance) {
        super(scene);
        this.axle = new MyCylinder(scene, 12, 1, true);
        this.woodAppearance = woodAppearance;
    }

    display() {
        if (this.woodAppearance) this.woodAppearance.apply();
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.scene.scale(0.1, 0.1, 4.4);
        this.axle.display();
        this.scene.popMatrix();
        this.scene.setDefaultAppearance();
    }
}
