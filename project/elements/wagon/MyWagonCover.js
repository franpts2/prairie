import { CGFobject, CGFappearance } from '../../../lib/CGF.js';
import { MySemiCylinder } from '../../shapes/MySemiCylinder.js';

export class MyWagonCover extends CGFobject {
    constructor(scene) {
        super(scene);
        this.cloth = new MySemiCylinder(scene, 20, 20);
        this.arch = new MySemiCylinder(scene, 20, 1);

        this.clothAppearance = new CGFappearance(scene);
        this.clothAppearance.setAmbient(0.8, 0.8, 0.7, 1.0);
        this.clothAppearance.setDiffuse(0.8, 0.8, 0.7, 1.0);
        this.clothAppearance.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.clothAppearance.setShininess(1.0);

        this.archAppearance = new CGFappearance(scene);
        this.archAppearance.setAmbient(0.3, 0.2, 0.1, 1.0);
        this.archAppearance.setDiffuse(0.4, 0.3, 0.2, 1.0);
        this.archAppearance.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.archAppearance.setShininess(5.0);
    }

    display() {
        this.scene.pushMatrix();
        this.clothAppearance.apply();
        this.scene.translate(0, 1.7, -3.5); 
        this.scene.scale(1.7, 1.7, 3.5); 
        this.cloth.display();
        this.scene.popMatrix();

        this.archAppearance.apply();
        const numArches = 5;
        const archSpacing = 3.5 / (numArches - 1);
        for (let i = 0; i < numArches; i++) {
            this.scene.pushMatrix();
            this.scene.translate(0, 1.7, -i * archSpacing);
            this.scene.scale(1.71, 1.71, 0.05); 
            this.arch.display();
            this.scene.popMatrix();
        }
        this.scene.setDefaultAppearance();
    }
}
