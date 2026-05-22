import { CGFobject } from '../../../lib/CGF.js';
import { MyBed } from './MyBed.js';
import { MyWheelSet } from './MyWheelSet.js';
import { MyTongue } from './MyTongue.js';
import { MySeat } from './MySeat.js';
import { MyCover } from './MyCover.js';

export class MyWagon extends CGFobject {
    constructor(scene) {
        super(scene);
        this.bed = new MyBed(scene);
        this.wheelSet = new MyWheelSet(scene);
        this.tongue = new MyTongue(scene);
        this.seat = new MySeat(scene);
        this.cover = new MyCover(scene);
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

        // --- Cover ---
        this.scene.pushMatrix();
        this.scene.translate(0, 1.2, 0); // same base translation as bed
        this.cover.display();
        this.scene.popMatrix();
    }
}
