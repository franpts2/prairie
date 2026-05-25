import { CGFobject, CGFappearance } from '../../../lib/CGF.js';
import { MyBed } from './MyBed.js';
import { MyWheelSet } from './MyWheelSet.js';
import { MyTongue } from './MyTongue.js';
import { MySeat } from './MySeat.js';
import { MyCover } from './MyCover.js';

export class MyWagon extends CGFobject {
    constructor(scene) {
        super(scene);

        // Centralized wood appearance
        this.woodAppearance = new CGFappearance(scene);
        this.woodAppearance.setAmbient(0.4, 0.2, 0.1, 1.0);
        this.woodAppearance.setDiffuse(0.5, 0.3, 0.1, 1.0);
        this.woodAppearance.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.woodAppearance.setShininess(5.0);
        this.woodAppearance.setTexture(this.scene.assetManager.getTexture('wood'));
        this.woodAppearance.setTextureWrap('REPEAT', 'REPEAT');

        // Centralized metal appearance
        this.metalAppearance = new CGFappearance(scene);
        this.metalAppearance.setAmbient(0.2, 0.2, 0.2, 1.0);
        this.metalAppearance.setDiffuse(0.3, 0.3, 0.3, 1.0);
        this.metalAppearance.setSpecular(0.8, 0.8, 0.8, 1.0);
        this.metalAppearance.setShininess(20.0);

        this.bed = new MyBed(scene, this.woodAppearance, this.metalAppearance);
        this.wheelSet = new MyWheelSet(scene, this.woodAppearance);
        this.tongue = new MyTongue(scene, this.woodAppearance);
        this.seat = new MySeat(scene, 2, this.woodAppearance);
        this.cover = new MyCover(scene, 2.5, this.woodAppearance, this.metalAppearance);

        // position and motion variables
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.angle = 0;

        this.speed = 0;
        this.maxSpeed = 15;
        this.acceleration = 6;
        
        // steering variables
        this.steerAngle = 0;
    }

    update(dt) {
        // move wagon forward along local negative Z axis, rotated by this.angle
        this.x += -this.speed * Math.sin(this.angle) * dt;
        this.z += -this.speed * Math.cos(this.angle) * dt;

        // adjust wagon orientation based on speed and steering angle
        // bicycle model: d(theta)/dt = (speed / L) * Math.sin(steerAngle)
        // wheelbase (L) between front and back axle is 4.8
        this.angle += (this.speed * dt / 4.8) * Math.sin(this.steerAngle);

        // align height to terrain
        if (this.scene.ground) {
            this.y = this.scene.ground.getHeight(this.x, this.z);
        }
    }

    accelerate(dt) {
        this.speed += this.acceleration * dt;
        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
    }

    display() {
        this.scene.pushMatrix();
        this.scene.translate(this.x, this.y, this.z);
        this.scene.rotate(this.angle, 0, 1, 0);

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

        this.scene.popMatrix();
    }
}
