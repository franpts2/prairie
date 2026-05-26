import { CGFobject, CGFappearance } from '../../../lib/CGF.js';
import { MyBed } from './MyBed.js';
import { MyWheelSet } from './MyWheelSet.js';
import { MyTongue } from './MyTongue.js';
import { MySeat } from './MySeat.js';
import { MyCover } from './MyCover.js';
import { MyCollectedHaybales } from './MyCollectedHaybales.js';
import { WagonPhysics } from './WagonPhysics.js';

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
        this.scene.rotate(this.steerAngle, 0, 1, 0);
        this.wheelSet.display();
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
    }
}
