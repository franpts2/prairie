import { CGFobject, CGFappearance } from '../../../lib/CGF.js';
import { MyPlane } from '../../shapes/MyPlane.js';

export class MyBarnWindows extends CGFobject {
    constructor(scene) {
        super(scene);
        this.quad = new MyPlane(scene);

        this.windowAppearance = new CGFappearance(scene);
        this.windowAppearance.setAmbient(0.5, 0.5, 0.5, 1.0);
        this.windowAppearance.setDiffuse(0.9, 0.9, 0.9, 1.0);
        this.windowAppearance.setSpecular(0.6, 0.6, 0.6, 1.0);
        this.windowAppearance.setShininess(30.0);
        this.windowAppearance.setTexture(scene.assetManager.getTexture('barnWindow'));
        this.windowAppearance.setTextureWrap('CLAMP_TO_EDGE', 'CLAMP_TO_EDGE');
    }

    display() {
        const zFightOffset = 0.015;
        this.windowAppearance.apply();

        // front window (top)
        this.scene.pushMatrix();
        this.scene.translate(0, 9.5, 6.0 + zFightOffset);
        this.scene.scale(1.4, 1.4, 1);
        this.quad.display();
        this.scene.popMatrix();

        // front window (middle)
        this.scene.pushMatrix();
        this.scene.translate(0, 6.5, 6.0 + zFightOffset);
        this.scene.scale(1.8, 1.8, 1);
        this.quad.display();
        this.scene.popMatrix();

        // wing front windows (left/right)
        const frontWingXs = [-4.5, 4.5];
        for (const wX of frontWingXs) {
            this.scene.pushMatrix();
            this.scene.translate(wX, 2.5, 6.0 + zFightOffset);
            this.scene.scale(1.6, 1.6, 1);
            this.quad.display();
            this.scene.popMatrix();
        }

        // side windows
        const sideWindowZs = [-3, 3];
        for (const wZ of sideWindowZs) {
            this.scene.pushMatrix();
            this.scene.translate(-6.0 - zFightOffset, 2.5, wZ);
            this.scene.rotate(-Math.PI / 2, 0, 1, 0);
            this.scene.scale(2, 2, 1);
            this.quad.display();
            this.scene.popMatrix();
        }

        for (const wZ of sideWindowZs) {
            this.scene.pushMatrix();
            this.scene.translate(6.0 + zFightOffset, 2.5, wZ);
            this.scene.rotate(Math.PI / 2, 0, 1, 0);
            this.scene.scale(2, 2, 1);
            this.quad.display();
            this.scene.popMatrix();
        }

        // central back window
        this.scene.pushMatrix();
        this.scene.translate(0, 9.5, -6.0 - zFightOffset);
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.scene.scale(1.4, 1.4, 1);
        this.quad.display();
        this.scene.popMatrix();

        // wing back windows (left/right)
        const backWingXs = [-4.5, 4.5];
        for (const wX of backWingXs) {
            this.scene.pushMatrix();
            this.scene.translate(wX, 2.5, -6.0 - zFightOffset);
            this.scene.rotate(Math.PI, 0, 1, 0);
            this.scene.scale(1.6, 1.6, 1);
            this.quad.display();
            this.scene.popMatrix();
        }

        // Upper side windows
        for (const wZ of sideWindowZs) {
            this.scene.pushMatrix();
            this.scene.translate(-3.0 - zFightOffset, 7.5, wZ);
            this.scene.rotate(-Math.PI / 2, 0, 1, 0);
            this.scene.scale(1.2, 1.2, 1);
            this.quad.display();
            this.scene.popMatrix();
        }

        for (const wZ of sideWindowZs) {
            this.scene.pushMatrix();
            this.scene.translate(3.0 + zFightOffset, 7.5, wZ);
            this.scene.rotate(Math.PI / 2, 0, 1, 0);
            this.scene.scale(1.2, 1.2, 1);
            this.quad.display();
            this.scene.popMatrix();
        }
    }
}
