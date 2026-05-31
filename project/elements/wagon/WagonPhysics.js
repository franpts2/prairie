import { CollisionSphere, CompoundWagonCollider } from '../../utils/CollisionSphere.js';

export class WagonPhysics {
    constructor(scene) {
        this.scene = scene;

        // position and motion variables
        this.x = -40;
        this.y = 0;
        this.z = -65;
        this.angle = Math.PI;
        this.pitchAngle = 0;
        this.heightOffset = 0.15;

        this.worldLimitRadius = 200;
        this.worldLimitMargin = 10;

        // compound collider with two overlapping spheres:
        // - Wagon bed: radius 2.5
        // - Horses: radius 2.2
        this.collider = new CompoundWagonCollider(2.5, 2.2);
        this.currentlyColliding = new Set();
        this.wasOutOfBounds = false;
        this.wasInWater = false;
        this.pathMapImage = null;

        this.speed = 0;
        this.maxSpeed = 8;
        this.acceleration = 4;
        this.brakeDecel = 11;
        this.friction = 2;

        // steering variables
        this.steerAngle = 0;
        this.maxSteerAngle = 45 * Math.PI / 180; // 45 degrees
        this.steerSpeed = 0.45;
        this.steerReturnSpeed = 2.0;

        // Horse visual properties (simulated values exposed for rendering)
        this.theta = 0;
        this.horseLeftX = 0;
        this.horseLeftZ = 0;
        this.horseRightX = 0;
        this.horseRightZ = 0;
        this.horseYOffset = 0;
        this.yLeft = 0;
        this.pitchLeft = 0;
        this.yRight = 0;
        this.pitchRight = 0;
    }

    update(dt) {
        // calculate potential next state
        const nextX = this.x - this.speed * Math.sin(this.angle) * dt;
        const nextZ = this.z - this.speed * Math.cos(this.angle) * dt;
        const nextAngle = this.angle + (this.speed * dt / 4.8) * Math.sin(this.steerAngle);

        const currentWaterCount = this.countWaterPointsAt(this.x, this.z, this.angle, this.steerAngle);
        const nextWaterCount = this.countWaterPointsAt(nextX, nextZ, nextAngle, this.steerAngle);

        if (nextWaterCount > 0 && nextWaterCount > currentWaterCount) {
            // Block the movement! Stop at the edge and apply knockback.
            const knockbackSpeed = Math.max(4.0, Math.abs(this.speed) * 0.8);
            if (this.speed > 0) {
                this.speed = -knockbackSpeed;
            } else if (this.speed < 0) {
                this.speed = knockbackSpeed;
            } else {
                this.speed = -4.0;
            }

            if (!this.wasInWater) {
                this.wasInWater = true;
                if (this.scene.gameController && this.scene.gameController.onWagonCollision) {
                    this.scene.gameController.onWagonCollision('water');
                }
            }
        } else {
            this.wasInWater = nextWaterCount > 0;

            const distanceSq = nextX * nextX + nextZ * nextZ;
            const maxRadius = this.worldLimitRadius - this.worldLimitMargin;
            const maxRadiusSq = maxRadius * maxRadius;

            if (distanceSq <= maxRadiusSq) {
                this.x = nextX;
                this.z = nextZ;
                this.wasOutOfBounds = false;
            } else {
                const distance = Math.sqrt(distanceSq);
                this.x = (nextX / distance) * (maxRadius - 0.5);
                this.z = (nextZ / distance) * (maxRadius - 0.5);

                if (!this.wasOutOfBounds) {
                    this.wasOutOfBounds = true;

                    if (this.scene.gameController && this.scene.gameController.onWagonCollision) {
                        this.scene.gameController.onWagonCollision('world_limit');
                    }

                    const knockbackSpeed = Math.max(4.0, Math.abs(this.speed) * 0.8);
                    if (this.speed > 0) {
                        this.speed = -knockbackSpeed;
                    } else if (this.speed < 0) {
                        this.speed = knockbackSpeed;
                    } else {
                        this.speed = -4.0;
                    }
                } else {
                    this.speed = this.speed > 0 ? -2.0 : 2.0;
                }
            }

            this.angle = nextAngle;
        }

        // align height to terrain
        if (this.scene.ground) {
            const frontX = this.x - 2.4 * Math.sin(this.angle);
            const frontZ = this.z - 2.4 * Math.cos(this.angle);
            const backX = this.x + 2.4 * Math.sin(this.angle);
            const backZ = this.z + 2.4 * Math.cos(this.angle);

            const yFront = this.scene.ground.getHeight(frontX, frontZ);
            const yBack = this.scene.ground.getHeight(backX, backZ);

            this.y = (yFront + yBack) / 2 + this.heightOffset;
            this.pitchAngle = Math.asin(Math.max(-1.0, Math.min(1.0, (yFront - yBack) / 4.8)));
        } else {
            this.y = 0;
            this.pitchAngle = 0;
        }

        if (this.collider) {
            if (this.collider.updatePositions) {
                this.collider.updatePositions(this.x, this.y, this.z, this.angle, this.steerAngle);
            } else {
                this.collider.setPosition(this.x, this.y, this.z);
            }
        }

        this.resolveCollisions();

        // --- Horses Visual Position & Pitch Calculations ---
        const pivotX = this.x - 2.4 * Math.sin(this.angle);
        const pivotZ = this.z - 2.4 * Math.cos(this.angle);
        this.theta = this.angle + this.steerAngle;

        const xL_local = -1.5;
        const zL_local = -5.0;
        this.horseLeftX = pivotX + xL_local * Math.cos(this.theta) + zL_local * Math.sin(this.theta);
        this.horseLeftZ = pivotZ - xL_local * Math.sin(this.theta) + zL_local * Math.cos(this.theta);

        const xR_local = 1.5;
        const zR_local = -5.0;
        this.horseRightX = pivotX + xR_local * Math.cos(this.theta) + zR_local * Math.sin(this.theta);
        this.horseRightZ = pivotZ - xR_local * Math.sin(this.theta) + zR_local * Math.cos(this.theta);

        this.horseYOffset = 2.17;

        this.yLeft = 0;
        this.pitchLeft = 0;
        this.yRight = 0;
        this.pitchRight = 0;

        if (this.scene.ground) {
            const dirX = -Math.sin(this.theta);
            const dirZ = -Math.cos(this.theta);

            const frontXL = this.horseLeftX + 1.0 * dirX;
            const frontZL = this.horseLeftZ + 1.0 * dirZ;
            const backXL = this.horseLeftX - 1.0 * dirX;
            const backZL = this.horseLeftZ - 1.0 * dirZ;

            const yFL = this.scene.ground.getHeight(frontXL, frontZL);
            const yBL = this.scene.ground.getHeight(backXL, backZL);

            this.yLeft = (yFL + yBL) / 2;
            this.pitchLeft = Math.asin(Math.max(-1.0, Math.min(1.0, (yFL - yBL) / 2.0)));

            const frontXR = this.horseRightX + 1.0 * dirX;
            const frontZR = this.horseRightZ + 1.0 * dirZ;
            const backXR = this.horseRightX - 1.0 * dirX;
            const backZR = this.horseRightZ - 1.0 * dirZ;

            const yFR = this.scene.ground.getHeight(frontXR, frontZR);
            const yBR = this.scene.ground.getHeight(backXR, backZR);

            this.yRight = (yFR + yBR) / 2;
            this.pitchRight = Math.asin(Math.max(-1.0, Math.min(1.0, (yFR - yBR) / 2.0)));
        }
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

    isPointInWater(x, z) {
        return this.scene.ground ? this.scene.ground.isPointInWater(x, z) : false;
    }

    countWaterPointsAt(x, z, angle, steerAngle) {
        // 1. Wagon Bed Sphere
        const wagonSphere = { x, z, radius: 2.5 };

        // 2. Horse Sphere
        const pivotX = x - 2.4 * Math.sin(angle);
        const pivotZ = z - 2.4 * Math.cos(angle);
        const theta = angle + steerAngle;
        const horseCenterX = pivotX - 5.0 * Math.sin(theta);
        const horseCenterZ = pivotZ - 5.0 * Math.cos(theta);
        const horseSphere = { x: horseCenterX, z: horseCenterZ, radius: 2.2 };

        let count = 0;
        count += this.countSphereWaterPoints(wagonSphere);
        count += this.countSphereWaterPoints(horseSphere);
        return count;
    }

    countSphereWaterPoints(sphere) {
        const cx = sphere.x;
        const cz = sphere.z;
        const rad = sphere.radius;

        const diag = rad * 0.7071;
        const points = [
            { x: cx, z: cz },
            { x: cx + rad, z: cz },
            { x: cx - rad, z: cz },
            { x: cx, z: cz + rad },
            { x: cx, z: cz - rad },
            { x: cx + diag, z: cz + diag },
            { x: cx - diag, z: cz + diag },
            { x: cx + diag, z: cz - diag },
            { x: cx - diag, z: cz - diag }
        ];

        let count = 0;
        for (const pt of points) {
            if (this.isPointInWater(pt.x, pt.z)) {
                count++;
            }
        }
        return count;
    }

    handleCollisionResponse(obstacle) {
        let appliedKnockback = false;
        let collided = false;

        const isFirstFrame = !this.currentlyColliding.has(obstacle.item);

        if (isFirstFrame) {
            if (this.scene.gameController && this.scene.gameController.onWagonCollision) {
                this.scene.gameController.onWagonCollision(obstacle.type);
            }

            if (obstacle.type === 'tree' || obstacle.type === 'barn' || obstacle.type === 'haybaleplatform') {
                this.applyKnockback();
                appliedKnockback = true;
            }
        } else if ((obstacle.type === 'tree' || obstacle.type === 'barn' || obstacle.type === 'haybaleplatform') && this.speed > 0) {
            // still driving into the obstacle, keep bouncing back
            this.speed = -2.0;
            appliedKnockback = true;
        }

        if (obstacle.type !== 'rock' && obstacle.type !== 'tree' && obstacle.type !== 'barn' && obstacle.type !== 'haybaleplatform') {
            collided = true;
        }

        return { appliedKnockback, collided };
    }

    applyKnockback() {
        const knockbackSpeed = Math.max(4.0, Math.abs(this.speed) * 0.8);
        this.speed = -knockbackSpeed;
    }

    pushOutFromObstacle(staticCollider) {
        // find which collider is actually overlapping (default to wagon body)
        let activeCollider = this.collider.wagonCollider;
        if (this.collider.horseCollider && this.collider.horseCollider.collidesWith(staticCollider)) {
            activeCollider = this.collider.horseCollider;
        }

        // 3D push-out vector
        const dx = activeCollider.x - staticCollider.x;
        const dy = activeCollider.y - staticCollider.y;
        const dz = activeCollider.z - staticCollider.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        const radiusSum = activeCollider.radius + staticCollider.radius;

        if (distance > 0.001) {
            const overlap = radiusSum - distance;
            // push the wagon out
            this.x += (dx / distance) * overlap;
            this.z += (dz / distance) * overlap;
        } else {
            // fallback to avoid division by zero
            this.x += activeCollider.radius + staticCollider.radius;
        }

        // update height to align with terrain at new position
        if (this.scene.ground) {
            const frontX = this.x - 2.4 * Math.sin(this.angle);
            const frontZ = this.z - 2.4 * Math.cos(this.angle);
            const backX = this.x + 2.4 * Math.sin(this.angle);
            const backZ = this.z + 2.4 * Math.cos(this.angle);

            const yFront = this.scene.ground.getHeight(frontX, frontZ);
            const yBack = this.scene.ground.getHeight(backX, backZ);

            this.y = (yFront + yBack) / 2 + this.heightOffset;
            this.pitchAngle = Math.asin(Math.max(-1.0, Math.min(1.0, (yFront - yBack) / 4.8)));
        }

        // update the wagon's collider position
        if (this.collider.updatePositions) {
            this.collider.updatePositions(this.x, this.y, this.z, this.angle, this.steerAngle);
        } else {
            this.collider.setPosition(this.x, this.y, this.z);
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
