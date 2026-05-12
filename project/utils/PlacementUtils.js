export function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

export function squaredDistance(a, b) {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return dx * dx + dz * dz;
}

export function generateScatterPositions({
    count,
    minX,
    maxX,
    minZ,
    maxZ,
    minDistance = 0,
    maxAttempts = 50,
}) {
    const positions = [];
    const minDistance2 = minDistance * minDistance;

    for (let i = 0; i < count; i++) {
        let attempt = 0;
        let position = null;

        while (attempt < maxAttempts) {
            const candidate = {
                x: randomBetween(minX, maxX),
                z: randomBetween(minZ, maxZ),
            };

            const tooClose = positions.some((existing) =>
                squaredDistance(existing, candidate) < minDistance2
            );

            if (!tooClose) {
                position = candidate;
                break;
            }

            attempt++;
        }

        if (position) positions.push(position);
        else break;
    }

    return positions;
}

export function generateGridPositions({
    rows,
    cols,
    minX,
    maxX,
    minZ,
    maxZ,
    jitter = 0,
}) {
    const positions = [];
    const stepX = (maxX - minX) / Math.max(cols - 1, 1);
    const stepZ = (maxZ - minZ) / Math.max(rows - 1, 1);

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            positions.push({
                x: minX + col * stepX + randomBetween(-jitter, jitter),
                z: minZ + row * stepZ + randomBetween(-jitter, jitter),
            });
        }
    }

    return positions;
}
