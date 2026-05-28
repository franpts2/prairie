import { CollisionSphere } from '../../utils/CollisionSphere.js';

export class WagonPhysics {
    constructor(scene) {
        this.scene = scene;

        // position and motion variables
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.angle = 0;
        this.radius = 5;

        this.collider = new CollisionSphere(this.x, this.y, this.z, this.radius);
        this.currentlyColliding = new Set();

        this.speed = 0;
        this.maxSpeed = 10;
        this.acceleration = 5;
        this.brakeDecel = 11;
        this.friction = 2;

        // steering variables
        this.steerAngle = 0;
        this.maxSteerAngle = 45 * Math.PI / 180; // 45 degrees
        this.steerSpeed = 0.75;
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

        if (this.scene.barn && this.scene.barn.collider) {
            obstacles.push({ type: 'barn', item: this.scene.barn, collider: this.scene.barn.collider });
        }

        const newColliding = new Set();
        let collided = false;
        let appliedKnockback = false;

        for (const obstacle of obstacles) {
            const staticCollider = obstacle.collider;
            if (this.collider.collidesWith(staticCollider)) {
                // track this active collision
                newColliding.add(obstacle.item);

                // if this is the FIRST FRAME OF CONTACT (was not colliding in the previous frame)
                if (!this.currentlyColliding.has(obstacle.item)) {
                    if (obstacle.type !== 'barn') {
                        // generate a random damage number between 5 and 15
                        const damage = Math.floor(Math.random() * (15 - 5 + 1)) + 5;
                        if (this.scene.gameController) {
                            this.scene.gameController.applyDamage(damage);
                            console.log(`Wagon hit a ${obstacle.type}! Took ${damage} HP damage. Remaining HP: ${this.scene.gameController.hp.toFixed(1)}`);
                        }
                    } else {
                        console.log(`Wagon hit a ${obstacle.type}! No damage taken.`);
                    }

                    if (obstacle.type === 'tree' || obstacle.type === 'barn') {
                        const knockbackSpeed = Math.max(4.0, Math.abs(this.speed) * 0.8);
                        this.speed = -knockbackSpeed;
                        appliedKnockback = true;
                    }
                } else if ((obstacle.type === 'tree' || obstacle.type === 'barn') && this.speed > 0) {
                    // still driving into the tree/barn, keep bouncing back
                    this.speed = -2.0;
                    appliedKnockback = true;
                }

                // push-out and stop logic only applies to trees/barn
                if (obstacle.type !== 'rock') {
                    if (obstacle.type !== 'tree' && obstacle.type !== 'barn') {
                        collided = true;
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
        }

        // update the set of currently colliding objects for the next frame
        this.currentlyColliding = newColliding;

        if (collided && !appliedKnockback) {
            // stop the wagon on impact (only for non-rock obstacles that didn't get knockback)
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
        if (this.speed > 0) {
            this.speed = Math.max(0, this.speed - this.brakeDecel * dt);
        } else if (this.speed < 0) {
            this.speed = Math.min(0, this.speed + this.brakeDecel * dt);
        }
    }

    decelerate(dt) {
        if (this.speed > 0) {
            this.speed = Math.max(0, this.speed - this.friction * dt);
        } else if (this.speed < 0) {
            this.speed = Math.min(0, this.speed + this.friction * dt);
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
}
