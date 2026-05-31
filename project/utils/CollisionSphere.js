export class CollisionSphere {
    // Initializes the collision sphere with position coordinates and a radius.
     constructor(x = 0, y = 0, z = 0, radius = 1.0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.radius = radius;
    }

    // Updates the position coordinates of the sphere.
    setPosition(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    // Performs a 3D spherical distance collision check against another sphere.
    collidesWith(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const dz = this.z - other.z;
        const distanceSq = dx * dx + dy * dy + dz * dz;
        const radiusSum = this.radius + other.radius;
        return distanceSq < (radiusSum * radiusSum);
    }
}

export class CompoundWagonCollider {
    // Initializes a compound collider containing separate spheres for the wagon and horse.
    constructor(wagonRadius = 2.5, horseRadius = 2.2) {
        this.wagonCollider = new CollisionSphere(0, 0, 0, wagonRadius);
        this.horseCollider = new CollisionSphere(0, 0, 0, horseRadius);

        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.radius = wagonRadius;
    }

    // Calculates and updates the wagon and horse bounding sphere positions based on the steer and pivot angles.
    updatePositions(x, y, z, angle, steerAngle) {
        this.x = x;
        this.y = y;
        this.z = z;

        this.wagonCollider.setPosition(x, y, z);

        const pivotX = x - 2.4 * Math.sin(angle);
        const pivotZ = z - 2.4 * Math.cos(angle);
        const theta = angle + steerAngle;

        const horseCenterX = pivotX - 5.0 * Math.sin(theta);
        const horseCenterZ = pivotZ - 5.0 * Math.cos(theta);

        this.horseCollider.setPosition(horseCenterX, y, horseCenterZ);
    }

    // Sets the position for both the wagon and the horse colliders directly.
    setPosition(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.wagonCollider.setPosition(x, y, z);
        this.horseCollider.setPosition(x, y, z);
    }

    // Checks if either the wagon or the horse bounding sphere is currently intersecting another sphere.
    collidesWith(other) {
        return this.wagonCollider.collidesWith(other) || this.horseCollider.collidesWith(other);
    }
}