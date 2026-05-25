import { CGFobject, CGFappearance } from '../../../lib/CGF.js';
import { MyUnitCube } from '../../shapes/MyUnitCube.js';

export class MySeat extends CGFobject {
    constructor(scene, width = 2) {
        super(scene);
        this.width = width;
        this.cube = new MyUnitCube(scene);

        this.woodAppearance = new CGFappearance(scene);
        this.woodAppearance.setAmbient(0.4, 0.2, 0.1, 1.0);
        this.woodAppearance.setDiffuse(0.5, 0.3, 0.1, 1.0);
        this.woodAppearance.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.woodAppearance.setShininess(5.0);
        this.woodAppearance.setTexture(this.scene.assetManager.getTexture('wood'));
        this.woodAppearance.setTextureWrap('REPEAT', 'REPEAT');
    }

    display() {
        this.woodAppearance.apply();

        // Seat Bench
        this.scene.pushMatrix();
        this.scene.scale(this.width, 0.1, 0.6);
        this.cube.display();
        this.scene.popMatrix();
        
        // Seat backrest
        this.scene.pushMatrix();
        this.scene.translate(0, 0.3, 0.3);
        this.scene.scale(this.width, 0.6, 0.1);
        this.cube.display();
        this.scene.popMatrix();

        // Left Seat Support
        this.scene.pushMatrix();
        this.scene.translate(-this.width * 0.4, -0.625, 0);
        this.scene.scale(0.2, 1.15, 0.4);
        this.cube.display();
        this.scene.popMatrix();

        // Right Seat Support
        this.scene.pushMatrix();
        this.scene.translate(this.width * 0.4, -0.625, 0);
        this.scene.scale(0.2, 1.15, 0.4);
        this.cube.display();
        this.scene.popMatrix();

        this.scene.setDefaultAppearance();
    }
}
