import { CGFobject } from '../../../lib/CGF.js';
import { MyUnitCube } from '../../shapes/MyUnitCube.js';

export class MyTongue extends CGFobject {
    constructor(scene, woodAppearance) {
        super(scene);
        this.cube = new MyUnitCube(scene);
        this.woodAppearance = woodAppearance;
    }

    display() {
        if (this.woodAppearance) this.woodAppearance.apply();

        // Left main beam
        this.scene.pushMatrix();
        this.scene.translate(-0.3, 0, -2.1);
        this.scene.scale(0.15, 0.15, 4.5);
        this.cube.display();
        this.scene.popMatrix();

        // Right main beam
        this.scene.pushMatrix();
        this.scene.translate(0.3, 0, -2.1);
        this.scene.scale(0.15, 0.15, 4.5);
        this.cube.display();
        this.scene.popMatrix();

        // Cross-bar at the end
        this.scene.pushMatrix();
        this.scene.translate(0, 0, -4.2);
        this.scene.scale(2.5, 0.15, 0.15);
        this.cube.display();
        this.scene.popMatrix();

        this.scene.setDefaultAppearance();
    }
}
