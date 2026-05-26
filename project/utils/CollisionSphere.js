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