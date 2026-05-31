const HASH_PRIME_X = 73856093;
const HASH_PRIME_Y = 19349663;
const HASH_PRIME_Z = 83492791;
const HASH_MULTIPLIER = 1274126177;
const HASH_SHIFT_A = 13;
const HASH_SHIFT_B = 16;
const HASH_MASK = 2147483647;

export class NoiseGenerator {
    // Initializes the noise generator with a specific integer seed.
    constructor(seed = 0) {
        this.seed = seed;
    }

    // Generates a pseudo-random floating-point value in [0, 1] using coordinate bit-shifting and large primes.
    hash(x, y, z) {
        let h = this.seed + Math.floor(x * HASH_PRIME_X) ^ Math.floor(y * HASH_PRIME_Y) ^ Math.floor(z * HASH_PRIME_Z);
        h = (h ^ (h >> HASH_SHIFT_A)) * HASH_MULTIPLIER;
        return ((h ^ (h >> HASH_SHIFT_B)) & HASH_MASK) / HASH_MASK;
    }

    // Applies smoothstep cubic interpolation to smooth transition boundaries between points.
    smoothstep(t) {
        return t * t * (3 - 2 * t);
    }

    // Generates 3D smooth value noise using trilinear interpolation of hashed grid values.
    noise(x, y, z) {
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

    // Generates multi-scale fractal Brownian motion noise by summing multiple octaves of standard 3D noise.
    fractalNoise(x, y, z, octaves = 4) {
        let value = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            value += amplitude * (this.noise(x * frequency, y * frequency, z * frequency) * 2 - 1);
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }

        return value / maxValue;
    }
}