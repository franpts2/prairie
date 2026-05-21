import { CGFobject, CGFappearance } from '../../../lib/CGF.js';
import { MyWagonBed } from './MyWagonBed.js';
import { MyWheel } from './MyWheel.js';
import { MyCylinder } from '../../shapes/MyCylinder.js';

/**
 * MyWagon
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyWagon extends CGFobject {
    constructor(scene) {
        super(scene);
        this.bed = new MyWagonBed(scene);
        this.wheel = new MyWheel(scene);
        this.axle = new MyCylinder(scene, 12, 1, true);

        this.woodAppearance = new CGFappearance(scene);
        this.woodAppearance.setAmbient(0.4, 0.2, 0.1, 1.0);
        this.woodAppearance.setDiffuse(0.5, 0.3, 0.1, 1.0);
        this.woodAppearance.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.woodAppearance.setShininess(5.0);
    }

    display() {
        // --- Bed ---
        this.scene.pushMatrix();
        this.scene.translate(0, 1.2, 0);
        this.bed.display();
        this.scene.popMatrix();

        // --- Axles ---
        this.woodAppearance.apply();
        
        // Back Axle
        this.scene.pushMatrix();
        this.scene.translate(-2.2, 1, 2.4);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.scene.scale(0.1, 0.1, 4.4);
        this.axle.display();
        this.scene.popMatrix();

        // Front Axle
        this.scene.pushMatrix();
        this.scene.translate(-2.2, 1, -2.4);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.scene.scale(0.1, 0.1, 4.4);
        this.axle.display();
        this.scene.popMatrix();

        // --- Wheels ---
        // Back Right
        this.scene.pushMatrix();
        this.scene.translate(2.2, 1, 2.4);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.wheel.display();
        this.scene.popMatrix();

        // Back Left
        this.scene.pushMatrix();
        this.scene.translate(-2.2, 1, 2.4);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.wheel.display();
        this.scene.popMatrix();

        // Front Right
        this.scene.pushMatrix();
        this.scene.translate(2.2, 1, -2.4);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.wheel.display();
        this.scene.popMatrix();

        // Front Left
        this.scene.pushMatrix();
        this.scene.translate(-2.2, 1, -2.4);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.wheel.display();
        this.scene.popMatrix();
    }
}
