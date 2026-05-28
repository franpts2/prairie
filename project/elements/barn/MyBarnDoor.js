import { CGFobject, CGFappearance } from '../../../lib/CGF.js';
import { MyPlane } from '../../shapes/MyPlane.js';

export class MyBarnDoor extends CGFobject {
    constructor(scene) {
        super(scene);
        this.quad = new MyPlane(scene);

        this.doorAppearance = new CGFappearance(scene);
        this.doorAppearance.setAmbient(0.4, 0.4, 0.4, 1.0);
        this.doorAppearance.setDiffuse(0.8, 0.8, 0.8, 1.0);
        this.doorAppearance.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.doorAppearance.setShininess(5.0);
        this.doorAppearance.setTexture(scene.assetManager.getTexture('barnDoor'));
        this.doorAppearance.setTextureWrap('CLAMP_TO_EDGE', 'CLAMP_TO_EDGE');
    }

    display() {
        const zFightOffset = 0.015;

        this.scene.pushMatrix();
        this.scene.translate(0, 2.25, 6.0 + zFightOffset);
        this.scene.scale(4, 4.5, 1);
        this.doorAppearance.apply();
        this.quad.display();
        this.scene.popMatrix();
    }
}
