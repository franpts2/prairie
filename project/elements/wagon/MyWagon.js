import { CGFobject, CGFappearance } from '../../../lib/CGF.js';
import { MyBed } from './MyBed.js';
import { MyWheelSet } from './MyWheelSet.js';
import { MyTongue } from './MyTongue.js';
import { MySeat } from './MySeat.js';
import { MyCover } from './MyCover.js';
import { MyCollectedHaybales } from './MyCollectedHaybales.js';
import { WagonPhysics } from './WagonPhysics.js';
import { MyCylinder } from '../../shapes/MyCylinder.js';
import { MyHorse } from './MyHorse.js';

export class MyWagon extends CGFobject {
    constructor(scene, physics) {
        super(scene);

        // Inject or automatically instantiate the physics simulation
        this.physics = physics || new WagonPhysics(scene);

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
        this.collectedBales = new MyCollectedHaybales(scene);
        this.wheelRotationAngle = 0;
        this.pivotPin = new MyCylinder(scene, 12, 1, true);

        // horses attached to the tongue
        this.horseLeft = new MyHorse(scene);
        this.horseRight = new MyHorse(scene);

        // Damage & Heal flash feedback states
        this.damageFlashTimer = 0;
        this.damageFlashDuration = 0.5; // Fades out over 0.5 seconds

        this.healFlashTimer = 0;
        this.healFlashDuration = 0.5;   // Fades out over 0.5 seconds
    }

    // --- Getters & Setters ---

    get x() { return this.physics.x; }
    set x(val) { this.physics.x = val; }

    get y() { return this.physics.y; }
    set y(val) { this.physics.y = val; }

    get z() { return this.physics.z; }
    set z(val) { this.physics.z = val; }

    get angle() { return this.physics.angle; }
    set angle(val) { this.physics.angle = val; }

    get pitchAngle() { return this.physics.pitchAngle || 0; }
    set pitchAngle(val) { this.physics.pitchAngle = val; }

    get radius() { return this.physics.radius; }
    set radius(val) { this.physics.radius = val; }

    get collider() { return this.physics.collider; }
    set collider(val) { this.physics.collider = val; }

    get currentlyColliding() { return this.physics.currentlyColliding; }
    set currentlyColliding(val) { this.physics.currentlyColliding = val; }

    get speed() { return this.physics.speed; }
    set speed(val) { this.physics.speed = val; }

    get maxSpeed() { return this.physics.maxSpeed; }
    set maxSpeed(val) { this.physics.maxSpeed = val; }

    get acceleration() { return this.physics.acceleration; }
    set acceleration(val) { this.physics.acceleration = val; }

    get brakeDecel() { return this.physics.brakeDecel; }
    set brakeDecel(val) { this.physics.brakeDecel = val; }

    get friction() { return this.physics.friction; }
    set friction(val) { this.physics.friction = val; }

    get steerAngle() { return this.physics.steerAngle; }
    set steerAngle(val) { this.physics.steerAngle = val; }

    get maxSteerAngle() { return this.physics.maxSteerAngle; }
    set maxSteerAngle(val) { this.physics.maxSteerAngle = val; }

    get steerSpeed() { return this.physics.steerSpeed; }
    set steerSpeed(val) { this.physics.steerSpeed = val; }

    get steerReturnSpeed() { return this.physics.steerReturnSpeed; }
    set steerReturnSpeed(val) { this.physics.steerReturnSpeed = val; }

    // --- Delegate Methods ---

    update(dt) {
        this.physics.update(dt);
        this.wheelRotationAngle -= (this.speed * dt) / 1.0;

        // decrement flash timers
        if (this.damageFlashTimer > 0) {
            this.damageFlashTimer = Math.max(0, this.damageFlashTimer - dt);
        }
        if (this.healFlashTimer > 0) {
            this.healFlashTimer = Math.max(0, this.healFlashTimer - dt);
        }

        // apply emissive glows based on active timers
        const intensityRed = this.damageFlashTimer > 0 ? (this.damageFlashTimer / this.damageFlashDuration) * 0.6 : 0.0;
        const intensityGreen = this.healFlashTimer > 0 ? (this.healFlashTimer / this.healFlashDuration) * 0.6 : 0.0;

        if (this.woodAppearance) this.woodAppearance.setEmission(intensityRed, intensityGreen, 0.0, 1.0);
        if (this.metalAppearance) this.metalAppearance.setEmission(intensityRed, intensityGreen, 0.0, 1.0);
        if (this.cover && this.cover.clothAppearance) {
            this.cover.clothAppearance.setEmission(intensityRed, intensityGreen, 0.0, 1.0);
        }
    }

    triggerDamageFlash() {
        this.damageFlashTimer = this.damageFlashDuration;
    }

    triggerHealFlash() {
        this.healFlashTimer = this.healFlashDuration;
    }

    resolveCollisions() {
        this.physics.resolveCollisions();
    }

    accelerate(dt) {
        this.physics.accelerate(dt);
    }

    brake(dt) {
        this.physics.brake(dt);
    }

    decelerate(dt) {
        this.physics.decelerate(dt);
    }

    steer(dir, dt) {
        this.physics.steer(dir, dt);
    }

    // --- Rendering ---

    display() {
        this.scene.pushMatrix();

        this.scene.translate(this.x, this.y, this.z);
        this.scene.rotate(this.angle, 0, 1, 0);
        this.scene.rotate(this.pitchAngle, 1, 0, 0);

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
        this.wheelSet.display(this.wheelRotationAngle);
        this.scene.popMatrix();

        // --- Front Wheel Set ---
        this.scene.pushMatrix();
        this.scene.translate(0, 1, -2.4);
        this.scene.rotate(this.steerAngle, 0, 1, 0);
        this.scene.pushMatrix();
        this.metalAppearance.apply();
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.translate(0, 0, -0.4);
        this.scene.scale(0.15, 0.15, 0.8);
        this.pivotPin.display();
        this.scene.popMatrix();
        this.wheelSet.display(this.wheelRotationAngle);
        this.scene.popMatrix();

        // --- Front Tongue ---
        this.scene.pushMatrix();
        this.scene.translate(0, 1, -2.4);
        this.scene.rotate(this.steerAngle, 0, 1, 0);
        this.tongue.display();
        this.scene.popMatrix();

        // --- Cover ---
        this.scene.pushMatrix();
        this.scene.translate(0, 1.2, 0); // same base translation as bed
        this.cover.display();
        this.scene.popMatrix();

        // --- Hay Bales ---
        this.collectedBales.display();

        this.scene.popMatrix();

        const pivotX = this.x - 2.4 * Math.sin(this.angle);
        const pivotZ = this.z - 2.4 * Math.cos(this.angle);
        const theta = this.angle + this.steerAngle;

        const xL_local = -1.5;
        const zL_local = -5.0;
        const horseLeftX = pivotX + xL_local * Math.cos(theta) + zL_local * Math.sin(theta);
        const horseLeftZ = pivotZ - xL_local * Math.sin(theta) + zL_local * Math.cos(theta);

        const xR_local = 1.5;
        const zR_local = -5.0;
        const horseRightX = pivotX + xR_local * Math.cos(theta) + zR_local * Math.sin(theta);
        const horseRightZ = pivotZ - xR_local * Math.sin(theta) + zR_local * Math.cos(theta);

        const horseYOffset = (this.physics.heightOffset || 0.15) + 1.0 + 1.8;

        let yLeft = 0;
        let pitchLeft = 0;
        let yRight = 0;
        let pitchRight = 0;

        if (this.scene.ground) {
            const dirX = -Math.sin(theta);
            const dirZ = -Math.cos(theta);

            const frontXL = horseLeftX + 1.0 * dirX;
            const frontZL = horseLeftZ + 1.0 * dirZ;
            const backXL = horseLeftX - 1.0 * dirX;
            const backZL = horseLeftZ - 1.0 * dirZ;

            const yFL = this.scene.ground.getHeight(frontXL, frontZL);
            const yBL = this.scene.ground.getHeight(backXL, backZL);

            yLeft = (yFL + yBL) / 2;
            pitchLeft = Math.asin(Math.max(-1.0, Math.min(1.0, (yFL - yBL) / 2.0)));

            const frontXR = horseRightX + 1.0 * dirX;
            const frontZR = horseRightZ + 1.0 * dirZ;
            const backXR = horseRightX - 1.0 * dirX;
            const backZR = horseRightZ - 1.0 * dirZ;

            const yFR = this.scene.ground.getHeight(frontXR, frontZR);
            const yBR = this.scene.ground.getHeight(backXR, backZR);

            yRight = (yFR + yBR) / 2;
            pitchRight = Math.asin(Math.max(-1.0, Math.min(1.0, (yFR - yBR) / 2.0)));
        }

        this.scene.pushMatrix();
        this.scene.translate(horseLeftX, yLeft + horseYOffset, horseLeftZ);
        this.scene.rotate(theta, 0, 1, 0);
        this.scene.rotate(pitchLeft, 1, 0, 0);
        this.scene.scale(3.0, 3.0, 3.0);
        this.horseLeft.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(horseRightX, yRight + horseYOffset, horseRightZ);
        this.scene.rotate(theta, 0, 1, 0);
        this.scene.rotate(pitchRight, 1, 0, 0);
        this.scene.scale(3.0, 3.0, 3.0);
        this.horseRight.display();
        this.scene.popMatrix();
    }
}
