// Generates a random float value in the range [min, max].
export function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

// Calculates the squared 2D distance between two points to avoid expensive square root operations.
export function squaredDistance(a, b) {
    const dx = a.x - b.x;
    const dz = a.z - b.z;

    return dx * dx + dz * dz;
}

// Generates a set of 2D scatter coordinates spaced out by a minimum required distance using a simple rejection sampling method.
export function generateScatterPositions({
    count,
    minX, maxX, minZ, maxZ,
    minDistance = 0, maxAttempts = 50,
    validate = null
}) {
    const positions = [];
    const minDistance2 = minDistance * minDistance;

    for (let i = 0; i < count; i++) {
        let attempt = 0;
        let position = null;

        while (attempt < maxAttempts) {
            const candidate = {
                x: randomBetween(minX, maxX),
                z: randomBetween(minZ, maxZ)
            };

            const tooClose = positions.some((existing) =>
                squaredDistance(existing, candidate) < minDistance2
            );

            if (!tooClose && (!validate || validate(candidate))) {
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

// Generates multiple grouped clusters of 2D coordinates, maintaining a minimum spacing between clusters as well as between items within a cluster.
export function generateClusteredPositions({
    groupCount, minGroupSize = 3, maxGroupSize = 6,
    minX, maxX, minZ, maxZ,
    minGroupDistance = 0, clusterRadius = 20, minItemDistance = 0,
    maxGroupItems = 100, maxItemAttempts = 50
}) {
    const groups = [];
    const minGroupDistance2 = minGroupDistance * minGroupDistance;
    const maxGroupAttempts = 50;

    const computeClusterRadius = () =>
        typeof clusterRadius == "number"
            ? clusterRadius
            : randomBetween(clusterRadius.min, clusterRadius.max);

    for (let groupIdx = 0; groupIdx < groupCount; groupIdx++) {
        let attempt = 0;
        let center = null;

        while (attempt < maxGroupAttempts) {
            const candidate = {
                x: randomBetween(minX, maxX),
                z: randomBetween(minZ, maxZ)
            };

            const tooClose = groups.some((existing) =>
                squaredDistance(existing.center, candidate) < minGroupDistance2
            );

            if (!tooClose) {
                center = candidate;
                break;
            }

            attempt++;
        }

        if (!center) break;

        const groupSize = Math.round(randomBetween(minGroupSize, maxGroupSize));
        const radius = computeClusterRadius();
        const items = [];
        const minItemDistance2 = minItemDistance * minItemDistance;

        for (let itemIdx = 0; itemIdx < groupSize; itemIdx++) {
            let itemAttempt = 0;
            let itemPosition = null;

            while (itemAttempt < maxItemAttempts) {
                const angle = randomBetween(0, 2 * Math.PI);
                const distance = Math.sqrt(Math.random() * radius);
                const candidate = {
                    x: center.x + Math.cos(angle) * distance,
                    z: center.z + Math.sin(angle) * distance,
                };

                if (
                    candidate.x < minX || candidate.x > maxX ||
                    candidate.z < minZ || candidate.z > maxZ
                ) {
                    itemAttempt++;
                    continue;
                }

                const tooCloseToItem = items.some((existing) =>
                    squaredDistance(existing, candidate) < minItemDistance2
                );

                if (!tooCloseToItem) {
                    itemPosition = candidate;
                    break;
                }

                itemAttempt++;
            }

            if (itemPosition) items.push(itemPosition);
            else break;
        }

        groups.push({ center, radius, size: items.length, items });
    }

    return groups;
}