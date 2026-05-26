import { CGFobject, CGFappearance } from '../../../lib/CGF.js';
import { MyBed } from './MyBed.js';
import { MyWheelSet } from './MyWheelSet.js';
import { MyTongue } from './MyTongue.js';
import { MySeat } from './MySeat.js';
import { MyCover } from './MyCover.js';
import { MyCollectedHaybales } from './MyCollectedHaybales.js';
import { CollisionSphere } from '../../utils/CollisionSphere.js';

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
        this.collectedBales = new MyCollectedHaybales(scene);

        // position and motion variables
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.angle = 0;
        this.radius = 5;
        
        this.collider = new CollisionSphere(this.x, this.y, this.z, this.radius);
        this.currentlyColliding = new Set();

        this.speed = 0;
        this.maxSpeed = 15;
        this.acceleration = 6;
        this.brakeDecel = 12;
        this.friction = 2;

        // steering variables
        this.steerAngle = 0;
        this.maxSteerAngle = 45 * Math.PI / 180; // 45 degrees
        this.steerSpeed = 1.0;
        this.steerReturnSpeed = 2.0;
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

        if (this.collider) {
            this.collider.setPosition(this.x, this.y, this.z);
        }

        this.resolveCollisions();
    }

    resolveCollisions() {
        if (!this.collider) return;

        const obstacles = [];

        if (this.scene.rocks && this.scene.rocks.rockItems) {
            for (const rock of this.scene.rocks.rockItems) {
                if (rock.collider) {
                    obstacles.push({ type: 'rock', item: rock, collider: rock.collider });
                }
            }
        }

        if (this.scene.trees && this.scene.trees.treeItems) {
            for (const tree of this.scene.trees.treeItems) {
                if (tree.collider) {
                    obstacles.push({ type: 'tree', item: tree, collider: tree.collider });
                }
            }
        }

        const newColliding = new Set();
        let collided = false;

        for (const obstacle of obstacles) {
            const staticCollider = obstacle.collider;
            if (this.collider.collidesWith(staticCollider)) {
                collided = true;
                
                // track this active collision
                newColliding.add(obstacle.item);

                // if this is the FIRST FRAME OF CONTACT (was not colliding in the previous frame)
                if (!this.currentlyColliding.has(obstacle.item)) {
                    // generate a random damage number between 5 and 15
                    const damage = Math.floor(Math.random() * (15 - 5 + 1)) + 5;
                    if (this.scene.gameController) {
                        this.scene.gameController.applyDamage(damage);
                        console.log(`Wagon hit a ${obstacle.type}! Took ${damage} HP damage. Remaining HP: ${this.scene.gameController.hp.toFixed(1)}`);
                    }
                }

                // 3D push-out vector
                const dx = this.x - staticCollider.x;
                const dy = this.y - staticCollider.y;
                const dz = this.z - staticCollider.z;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                const radiusSum = this.collider.radius + staticCollider.radius;

                if (distance > 0.001) {
                    const overlap = radiusSum - distance;
                    // push the wagon out
                    this.x += (dx / distance) * overlap;
                    this.z += (dz / distance) * overlap;
                } else {
                    // fallback to avoid division by zero
                    this.x += this.collider.radius + staticCollider.radius;
                }

                // update height to align with terrain at new position
                if (this.scene.ground) {
                    this.y = this.scene.ground.getHeight(this.x, this.z);
                }

                // update the wagon's collider position
                this.collider.setPosition(this.x, this.y, this.z);
            }
        }

        // update the set of currently colliding objects for the next frame
        this.currentlyColliding = newColliding;

        if (collided) {
            // stop the wagon on impact
            this.speed = 0;
        }
    }

    accelerate(dt) {
        this.speed += this.acceleration * dt;
        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
    }

    brake(dt) {
        this.speed -= this.brakeDecel * dt;
        if (this.speed < 0) {
            this.speed = 0;
        }
    }

    decelerate(dt) {
        this.speed -= this.friction * dt;
        if (this.speed < 0) {
            this.speed = 0;
        }
    }

    steer(dir, dt) {
        if (dir > 0) {
            // Steer left
            this.steerAngle += this.steerSpeed * dt;
            if (this.steerAngle > this.maxSteerAngle) {
                this.steerAngle = this.maxSteerAngle;
            }
        } else if (dir < 0) {
            // Steer right
            this.steerAngle -= this.steerSpeed * dt;
            if (this.steerAngle < -this.maxSteerAngle) {
                this.steerAngle = -this.maxSteerAngle;
            }
        } else {
            // Return to center
            if (this.steerAngle > 0) {
                this.steerAngle -= this.steerReturnSpeed * dt;
                if (this.steerAngle < 0) {
                    this.steerAngle = 0;
                }
            } else if (this.steerAngle < 0) {
                this.steerAngle += this.steerReturnSpeed * dt;
                if (this.steerAngle > 0) {
                    this.steerAngle = 0;
                }
            }
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
