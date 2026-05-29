/**
 * MyFlower
 * @constructor
 * @param scene - Reference to MyScene object
 * @param petalCount - Number of petals per layer (default 12)
 * @param petalColor - Array of 3 floats [r, g, b] (default pink)
 * @param flowerScale - Scale factor for the flower head (default 1.0)
 * @param windStrength - Strength of the swaying animation (default 1.0)
 */
export class MyFlower {
    constructor(scene, petalCount = 12, petalColor = [0.9, 0.25, 0.35], flowerScale = 1.0, windStrength = 1.0) {
        this.scene = scene;
        this.petalCount = petalCount;
        this.petalColor = petalColor;
        this.flowerScale = flowerScale;
        this.windStrength = windStrength;

        // stem parameters
        this.numStemSegments = 3;
        this.segmentLength = 0.5;
        this.stemRadius = 0.03;

        // center parameters
        this.centerRadius = 0.4;
        this.centerHeight = 0.3;

        // petal parameters
        this.petalWidth = 0.25;
        this.petalLength = 0.85;
        this.petalThickness = 0.05;
        this.petalTiltOuter = 0.10;
        this.petalTiltInner = 0.10;

        this.time = 0;
    }

    update(time) {
        this.time = time;
    }
}
