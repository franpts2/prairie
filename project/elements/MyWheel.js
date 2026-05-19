import { CGFobject, CGFappearance } from '../../lib/CGF.js';
import { MyCylinder } from '../shapes/MyCylinder.js';
import { MyUnitCube } from '../shapes/MyUnitCube.js';
import { MyDonut } from '../shapes/MyDonut.js';

/**
 * MyWheel
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyWheel extends CGFobject {
    constructor(scene) {
        super(scene);
        this.hub = new MyCylinder(scene, 12, 1, true); 
        this.rim = new MyDonut(scene, 24, 0.8, 1.0); // 0.2 thickness
        this.spoke = new MyUnitCube(scene);
        this.numSpokes = 8;

        this.woodAppearance = new CGFappearance(scene);
        this.woodAppearance.setAmbient(0.4, 0.2, 0.1, 1.0);
        this.woodAppearance.setDiffuse(0.5, 0.3, 0.1, 1.0);
        this.woodAppearance.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.woodAppearance.setShininess(5.0);
    }

    display() {
        this.woodAppearance.apply();

        // --- Hub ---
        this.scene.pushMatrix();
        this.scene.scale(0.2, 0.2, 0.4);
        this.scene.translate(0, 0, -0.5); // Center the hub on Z
        this.hub.display();
        this.scene.popMatrix();

        // --- Rim ---
        this.scene.pushMatrix();
        this.scene.scale(1, 1, 0.3); // Scale Z for rim width
        this.scene.translate(0, 0, -0.5); // Center the rim on Z
        this.rim.display();
        this.scene.popMatrix();

        // --- Spokes ---
        for (let i = 0; i < this.numSpokes; i++) {
            this.scene.pushMatrix();
            this.scene.rotate((i * 2 * Math.PI) / this.numSpokes, 0, 0, 1);
            this.scene.translate(0, 0.45, 0); // Move to middle of tube radius
            this.scene.scale(0.05, 0.9, 0.1); // Thin spoke
            this.spoke.display();
            this.scene.popMatrix();
        }

        this.scene.setDefaultAppearance();
    }
}
