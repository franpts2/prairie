import { CGFobject } from '../../../lib/CGF.js';
import { MyWagonBed } from './MyWagonBed.js';
import { MyWagonWheelSet } from './MyWheelSet.js';
import { MyWagonTongue } from './MyWagonTongue.js';
import { MyWagonSeat } from './MySeat.js';

/**
 * MyWagon
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyWagon extends CGFobject {
    constructor(scene) {
        super(scene);
        this.bed = new MyWagonBed(scene);
        this.wheelSet = new MyWagonWheelSet(scene);
        this.tongue = new MyWagonTongue(scene);
        this.seat = new MyWagonSeat(scene);
    }

    display() {
        // --- Bed ---
        this.scene.pushMatrix();
        this.scene.translate(0, 1.2, 0);
        this.bed.display();
        this.scene.popMatrix();

        // --- Driver Seat ---
        this.scene.pushMatrix();
        this.scene.translate(0, 2.5, -2.5);
        this.seat.display();
        this.scene.popMatrix();

        // --- Back Wheel Set ---
        this.scene.pushMatrix();
        this.scene.translate(0, 1, 2.4);
        this.wheelSet.display();
        this.scene.popMatrix();

        // --- Front Wheel Set ---
        this.scene.pushMatrix();
        this.scene.translate(0, 1, -2.4);
        this.wheelSet.display();
        this.scene.popMatrix();

        // --- Front Tongue ---
        this.scene.pushMatrix();
        this.scene.translate(0, 1, -2.4);
        this.tongue.display();
        this.scene.popMatrix();
    }
}
