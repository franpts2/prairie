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
        const newX = this.x - this.speed * Math.sin(this.angle) * dt;
        const newZ = this.z - this.speed * Math.cos(this.angle) * dt;

        const distanceSq = newX * newX + newZ * newZ;
        const maxRadius = 200;
        const maxRadiusSq = maxRadius * maxRadius;

        if (distanceSq <= maxRadiusSq) {
            this.x = newX;
            this.z = newZ;
        } else {
            const distance = Math.sqrt(distanceSq);
            this.x = (newX / distance) * maxRadius;
            this.z = (newZ / distance) * maxRadius;
            this.speed = 0;
        }

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

        const obstacles = this.scene.getColliders ? this.scene.getColliders() : [];
        const newColliding = new Set();
        let collided = false;
        let appliedKnockback = false;

        for (const obstacle of obstacles) {
            if (this.collider.collidesWith(obstacle.collider)) {
                // track this active collision
                newColliding.add(obstacle.item);

                const response = this.handleCollisionResponse(obstacle);
                if (response.appliedKnockback) appliedKnockback = true;
                if (response.collided) collided = true;

                // push-out logic only applies to non-rock obstacles
                if (obstacle.type !== 'rock') {
                    this.pushOutFromObstacle(obstacle.collider);
                }
            }
        }

        this.currentlyColliding = newColliding;

        if (collided && !appliedKnockback) {
            this.speed = 0;
        }
    }

    handleCollisionResponse(obstacle) {
        let appliedKnockback = false;
        let collided = false;

        const isFirstFrame = !this.currentlyColliding.has(obstacle.item);

        if (isFirstFrame) {
            if (this.scene.gameController && this.scene.gameController.onWagonCollision) {
                this.scene.gameController.onWagonCollision(obstacle.type);
            }

            if (obstacle.type === 'tree' || obstacle.type === 'barn') {
                this.applyKnockback();
                appliedKnockback = true;
            }
        } else if ((obstacle.type === 'tree' || obstacle.type === 'barn') && this.speed > 0) {
            // still driving into the obstacle, keep bouncing back
            this.speed = -2.0;
            appliedKnockback = true;
        }

        if (obstacle.type !== 'rock' && obstacle.type !== 'tree' && obstacle.type !== 'barn') {
            collided = true;
        }

        return { appliedKnockback, collided };
    }

    applyKnockback() {
        const knockbackSpeed = Math.max(4.0, Math.abs(this.speed) * 0.8);
        this.speed = -knockbackSpeed;
    }

    pushOutFromObstacle(staticCollider) {
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
