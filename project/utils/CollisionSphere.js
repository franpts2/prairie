export class CollisionSphere {
    constructor(x = 0, y = 0, z = 0, radius = 1.0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.radius = radius;
    }

    /**
     * Updates the position of the sphere collider.
     */
    setPosition(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Checks if this sphere overlaps with another CollisionSphere.
     * @param {CollisionSphere} other - The other sphere collider to check against.
     * @returns {boolean} - True if colliding, false otherwise.
     */
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
    constructor(wagonRadius = 2.5, horseRadius = 2.2) {
        this.wagonCollider = new CollisionSphere(0, 0, 0, wagonRadius);
        this.horseCollider = new CollisionSphere(0, 0, 0, horseRadius);
        
        // Backward-compatibility properties
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.radius = wagonRadius; // fallback
    }

    /**
     * Updates the position of the individual spheres based on the wagon's state.
     */
    updatePositions(x, y, z, angle, steerAngle) {
        this.x = x;
        this.y = y;
        this.z = z;

        // 1. Wagon Bed Sphere is centered at the wagon's base coordinates
        this.wagonCollider.setPosition(x, y, z);

        // 2. Horse Sphere is placed forward along the wagon's current tongue direction
        const pivotX = x - 2.4 * Math.sin(angle);
        const pivotZ = z - 2.4 * Math.cos(angle);
        const theta = angle + steerAngle;

        // The horses are offset by -5.0 units along the steer-rotated axis
        const horseCenterX = pivotX - 5.0 * Math.sin(theta);
        const horseCenterZ = pivotZ - 5.0 * Math.cos(theta);

        this.horseCollider.setPosition(horseCenterX, y, horseCenterZ);
    }

    /**
     * Backward-compatibility for callers that use setPosition
     */
    setPosition(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.wagonCollider.setPosition(x, y, z);
        this.horseCollider.setPosition(x, y, z);
    }

    /**
     * Checks if either sphere overlaps with the other CollisionSphere.
     */
    collidesWith(other) {
        return this.wagonCollider.collidesWith(other) || this.horseCollider.collidesWith(other);
    }
}