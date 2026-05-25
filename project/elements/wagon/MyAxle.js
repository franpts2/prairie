import { CGFobject, CGFappearance } from '../../../lib/CGF.js';
import { MyCylinder } from '../../shapes/MyCylinder.js';

export class MyAxle extends CGFobject {
    constructor(scene) {
        super(scene);
        this.axle = new MyCylinder(scene, 12, 1, true);

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
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.scene.scale(0.1, 0.1, 4.4);
        this.axle.display();
        this.scene.popMatrix();
        this.scene.setDefaultAppearance();
    }
}
