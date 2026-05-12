const HASH_PRIME_X = 73856093;
const HASH_PRIME_Y = 19349663;
const HASH_PRIME_Z = 83492791;
const HASH_MULTIPLIER = 1274126177;
const HASH_SHIFT_A = 13;
const HASH_SHIFT_B = 16;
const HASH_MASK = 2147483647;
const CELLULAR_OFFSET = 100;
const CELLULAR_INITIAL_MIN_DIST = 1.0;

export class NoiseGenerator {
    constructor(seed = 0) {
        this.seed = seed;
    }

    // Hash function for pseudo-random values based on position and seed
    hash(x, y, z) {
        let h = this.seed + Math.floor(x * HASH_PRIME_X) ^ Math.floor(y * HASH_PRIME_Y) ^ Math.floor(z * HASH_PRIME_Z);
        h = (h ^ (h >> HASH_SHIFT_A)) * HASH_MULTIPLIER;
        return ((h ^ (h >> HASH_SHIFT_B)) & HASH_MASK) / HASH_MASK;
    }

    // Smoothstep function for smooth interpolation
    smoothstep(t) {
        return t * t * (3 - 2 * t);
    }

    // Perlin-like noise using cubic interpolation
    perlinNoise(x, y, z) {
        const xi = Math.floor(x);
        const yi = Math.floor(y);
        const zi = Math.floor(z);
        const xf = x - xi;
        const yf = y - yi;
        const zf = z - zi;

        const u = this.smoothstep(xf);
        const v = this.smoothstep(yf);
        const w = this.smoothstep(zf);

        const n000 = this.hash(xi, yi, zi);
        const n100 = this.hash(xi + 1, yi, zi);
        const n010 = this.hash(xi, yi + 1, zi);
        const n110 = this.hash(xi + 1, yi + 1, zi);
        const n001 = this.hash(xi, yi, zi + 1);
        const n101 = this.hash(xi + 1, yi, zi + 1);
        const n011 = this.hash(xi, yi + 1, zi + 1);
        const n111 = this.hash(xi + 1, yi + 1, zi + 1);

        const nx00 = n000 * (1 - u) + n100 * u;
        const nx10 = n010 * (1 - u) + n110 * u;
        const nx01 = n001 * (1 - u) + n101 * u;
        const nx11 = n011 * (1 - u) + n111 * u;

        const nxy0 = nx00 * (1 - v) + nx10 * v;
        const nxy1 = nx01 * (1 - v) + nx11 * v;

        return nxy0 * (1 - w) + nxy1 * w;
    }

    // Ridge noise for rocky edges and sharp features
    ridgeNoise(x, y, z, octaves = 3) {
        let value = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            const n = this.perlinNoise(x * frequency, y * frequency, z * frequency);
            const ridge = 1 - Math.abs(n * 2 - 1);
            value += amplitude * ridge;
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2.5;
        }

        return value / maxValue;
    }

    // Billowy noise for rounded, flowing features
    billowNoise(x, y, z, octaves = 3) {
        let value = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            const n = Math.abs(this.perlinNoise(x * frequency, y * frequency, z * frequency) * 2 - 1);
            value += amplitude * n;
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }

        return value / maxValue;
    }

    // Cellular (Worley-like) noise for irregular surface details
    cellularNoise(x, y, z) {
        const xi = Math.floor(x);
        const yi = Math.floor(y);
        const zi = Math.floor(z);
        const xf = x - xi;
        const yf = y - yi;
        const zf = z - zi;

        let minDist = CELLULAR_INITIAL_MIN_DIST;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dz = -1; dz <= 1; dz++) {
                    const px = this.hash(xi + dx, yi + dy, zi + dz);
                    const py = this.hash(xi + dx + CELLULAR_OFFSET, yi + dy + CELLULAR_OFFSET, zi + dz + CELLULAR_OFFSET);
                    const pz = this.hash(xi + dx + CELLULAR_OFFSET * 2, yi + dy + CELLULAR_OFFSET * 2, zi + dz + CELLULAR_OFFSET * 2);

                    const dx2 = (dx + px - xf);
                    const dy2 = (dy + py - yf);
                    const dz2 = (dz + pz - zf);
                    const dist = dx2 * dx2 + dy2 * dy2 + dz2 * dz2;

                    if (dist < minDist) minDist = dist;
                }
            }
        }

        return Math.sqrt(minDist);
    }

    // Fractal Brownian Motion for natural multi-scale variations
    fbmNoise(x, y, z, octaves = 4) {
        let value = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            value += amplitude * (this.perlinNoise(x * frequency, y * frequency, z * frequency) - 0.5) * 2;
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }

        return value / maxValue;
    }
}
