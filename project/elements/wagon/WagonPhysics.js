import { CollisionSphere, CompoundWagonCollider } from '../../utils/CollisionSphere.js';

export class WagonPhysics {
    // Initializes the wagon's positioning parameters, physics properties (speed, steering, friction), and the compound collision detection system.
    constructor(scene) {
        this.scene = scene;

        this.x = -40;
        this.y = 0;
        this.z = -65;
        this.angle = Math.PI;
        this.pitchAngle = 0;
        this.heightOffset = 0.15;

        this.worldLimitRadius = 200;
        this.worldLimitMargin = 10;

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

        this.steerAngle = 0;
        this.maxSteerAngle = 45 * Math.PI / 180;
        this.steerSpeed = 0.45;
        this.steerReturnSpeed = 2.0;

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

    // Calculates the wagon's next position/rotation, confines it within world boundary limits, enforces knockback on water entry, computes height adaptation over terrain surfaces, and matches horse coordinates with the wagon's movement.
    update(dt) {

        const nextX = this.x - this.speed * Math.sin(this.angle) * dt;
        const nextZ = this.z - this.speed * Math.cos(this.angle) * dt;
        const nextAngle = this.angle + (this.speed * dt / 4.8) * Math.sin(this.steerAngle);

        const currentWaterCount = this.countWaterPointsAt(this.x, this.z, this.angle, this.steerAngle);
        const nextWaterCount = this.countWaterPointsAt(nextX, nextZ, nextAngle, this.steerAngle);

        if (nextWaterCount > 0 && nextWaterCount > currentWaterCount) {

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

    // Checks for wagon overlap against active scene colliders, processes collision responses (like knockbacks), and displaces the wagon away from obstacles.
    resolveCollisions() {
        if (!this.collider) return;

        const obstacles = this.scene.getColliders ? this.scene.getColliders() : [];
        const newColliding = new Set();
        let collided = false;
        let appliedKnockback = false;

        for (const obstacle of obstacles) {
            if (this.collider.collidesWith(obstacle.collider)) {

                newColliding.add(obstacle.item);

                const response = this.handleCollisionResponse(obstacle);
                if (response.appliedKnockback) appliedKnockback = true;
                if (response.collided) collided = true;

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

    // Checks if the ground system marks a given coordinate as a water hazard.
    isPointInWater(x, z) {
        return this.scene.ground ? this.scene.ground.isPointInWater(x, z) : false;
    }

    // Counts how many sample points on the wagon and horse hulls are currently submerged in water.
    countWaterPointsAt(x, z, angle, steerAngle) {

        const wagonSphere = { x, z, radius: 2.5 };

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

    // Checks several sample coordinates along a bounding sphere's circumference and center to evaluate water submersion.
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

    // Triggers damage/collision notifications on first impact and initiates speed reduction or knockbacks for solid obstacles.
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

            this.speed = -2.0;
            appliedKnockback = true;
        }

        if (obstacle.type !== 'rock' && obstacle.type !== 'tree' && obstacle.type !== 'barn' && obstacle.type !== 'haybaleplatform') {
            collided = true;
        }

        return { appliedKnockback, collided };
    }

    // Applies a backward speed impulse (rebound) to the wagon upon solid obstacle impacts.
    applyKnockback() {
        const knockbackSpeed = Math.max(4.0, Math.abs(this.speed) * 0.8);
        this.speed = -knockbackSpeed;
    }

    // Displaces the wagon's position away from a static obstacle's center to resolve physical overlaps.
    pushOutFromObstacle(staticCollider) {

        let activeCollider = this.collider.wagonCollider;
        if (this.collider.horseCollider && this.collider.horseCollider.collidesWith(staticCollider)) {
            activeCollider = this.collider.horseCollider;
        }

        const dx = activeCollider.x - staticCollider.x;
        const dy = activeCollider.y - staticCollider.y;
        const dz = activeCollider.z - staticCollider.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        const radiusSum = activeCollider.radius + staticCollider.radius;

        if (distance > 0.001) {
            const overlap = radiusSum - distance;

            this.x += (dx / distance) * overlap;
            this.z += (dz / distance) * overlap;
        } else {

            this.x += activeCollider.radius + staticCollider.radius;
        }

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

        if (this.collider.updatePositions) {
            this.collider.updatePositions(this.x, this.y, this.z, this.angle, this.steerAngle);
        } else {
            this.collider.setPosition(this.x, this.y, this.z);
        }
    }

    // Increases forward speed based on acceleration rate up to maximum velocity.
    accelerate(dt) {
        this.speed += this.acceleration * dt;
        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
    }

    // Applies active braking deceleration to rapidly reduce forward speed.
    brake(dt) {
        if (this.speed > 0) {
            this.speed = Math.max(0, this.speed - this.brakeDecel * dt);
        } else if (this.speed < 0) {
            this.speed = Math.min(0, this.speed + this.brakeDecel * dt);
        }
    }

    // Applies passive ground friction to slowly decelerate the wagon when no controls are pressed.
    decelerate(dt) {
        if (this.speed > 0) {
            this.speed = Math.max(0, this.speed - this.friction * dt);
        } else if (this.speed < 0) {
            this.speed = Math.min(0, this.speed + this.friction * dt);
        }
    }

    // Interpolates steering wheel angles based on input direction, returning the wheels to center when there is no active steering input.
    steer(dir, dt) {
        if (dir > 0) {

            this.steerAngle += this.steerSpeed * dt;
            if (this.steerAngle > this.maxSteerAngle) {
                this.steerAngle = this.maxSteerAngle;
            }
        } else if (dir < 0) {

            this.steerAngle -= this.steerSpeed * dt;
            if (this.steerAngle < -this.maxSteerAngle) {
                this.steerAngle = -this.maxSteerAngle;
            }
        } else {

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