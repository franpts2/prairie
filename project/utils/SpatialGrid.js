export class SpatialGrid {
    // Initializes the spatial partitioning grid with a specific cell size.
    constructor(cellSize = 2) {
        this.cellSize = cellSize;
        this.grid = {};
    }

    // Registers an obstacle into all grid cells that its bounding circle overlaps.
    addObstacle(x, z, radius) {
        const radiusSq = radius * radius;
        const minGx = Math.floor((x - radius) / this.cellSize);
        const maxGx = Math.floor((x + radius) / this.cellSize);
        const minGz = Math.floor((z - radius) / this.cellSize);
        const maxGz = Math.floor((z + radius) / this.cellSize);

        for (let gx = minGx; gx <= maxGx; gx++) {
            for (let gz = minGz; gz <= maxGz; gz++) {
                const key = `${gx},${gz}`;
                if (!this.grid[key]) this.grid[key] = [];
                this.grid[key].push({ x, z, radiusSq });
            }
        }
    }

    // Checks if a coordinate falls inside any obstacle located in its corresponding grid cell.
    isBlocked(x, z) {
        const gx = Math.floor(x / this.cellSize);
        const gz = Math.floor(z / this.cellSize);
        const cell = this.grid[`${gx},${gz}`];

        if (!cell) return false;

        for (const obstacle of cell) {
            const dx = x - obstacle.x;
            const dz = z - obstacle.z;
            if (dx * dx + dz * dz < obstacle.radiusSq) {
                return true;
            }
        }
        return false;
    }
}