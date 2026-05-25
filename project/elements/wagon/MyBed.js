import { CGFobject } from '../../../lib/CGF.js';
import { MyUnitCube } from '../../shapes/MyUnitCube.js';

export class MyBed extends CGFobject {
    constructor(scene, woodAppearance) {
        super(scene);
        
        // --- Tiled Cube Instances ---
        // Base: 3.4 x 0.2 x 7
        this.baseCube = new MyUnitCube(scene, 3.4, 0.2, 7);
        // Front/Back Walls: 3.4 x 2.0 x 0.1
        this.wallFB = new MyUnitCube(scene, 3.4, 2.0, 0.1);
        // Left/Right Walls: 0.1 x 2.0 x 7
        this.wallLR = new MyUnitCube(scene, 0.1, 2.0, 7);

        this.woodAppearance = woodAppearance;
    }

    display() {
        if (this.woodAppearance) this.woodAppearance.apply();

        // --- Base ---
        this.scene.pushMatrix();
        this.scene.scale(3.4, 0.2, 7);
        this.baseCube.display();
        this.scene.popMatrix();

        // --- Back Wall ---
        this.scene.pushMatrix();
        this.scene.translate(0, 0.7, 3.45);
        this.scene.scale(3.4, 2.0, 0.1);
        this.wallFB.display();
        this.scene.popMatrix();

        // --- Front Wall ---
        this.scene.pushMatrix();
        this.scene.translate(0, 0.7, -3.45);
        this.scene.scale(3.4, 2.0, 0.1);
        this.wallFB.display();
        this.scene.popMatrix();

        // --- Left Wall ---
        this.scene.pushMatrix();
        this.scene.translate(-1.65, 0.7, 0);
        this.scene.scale(0.1, 2.0, 7);
        this.wallLR.display();
        this.scene.popMatrix();

        // --- Right Wall ---
        this.scene.pushMatrix();
        this.scene.translate(1.65, 0.7, 0);
        this.scene.scale(0.1, 2.0, 7);
        this.wallLR.display();
        this.scene.popMatrix();

        this.scene.setDefaultAppearance();
    }
}
