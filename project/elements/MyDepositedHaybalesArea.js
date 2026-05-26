export class MyDepositedHaybalesArea {
    constructor(scene) {
        this.scene = scene;

        this.centerX = -60;
        this.centerZ = -90;

        this.cols = 4;
        this.rows = 4;
        this.spacingX = 1.3;
        this.spacingZ = 1.3;
        this.balesPerLayer = this.cols * this.rows;

        this.baseX = this.centerX - ((this.cols - 1) * this.spacingX) / 2; // -61.95
        this.baseZ = this.centerZ - ((this.rows - 1) * this.spacingZ) / 2; // -91.95
    }

    depositBales(capturedBales, startIndex) {
        for (let i = 0; i < capturedBales.length; i++) {
            const bale = capturedBales[i];
            const k = startIndex + i;

            const layer = Math.floor(k / this.balesPerLayer);
            const localIndex = k % this.balesPerLayer;
            const col = localIndex % this.cols;
            const row = Math.floor(localIndex / this.cols);

            bale.x = this.baseX + col * this.spacingX;
            bale.z = this.baseZ + row * this.spacingZ;
            bale.rotation = Math.PI / 2; // aligned lengthwise

            bale.yOffset = layer * (0.58 * bale.scale);

            bale.captured = false; // make it render again in the world
            bale.collider = null;  // remove collider so it can never be collected again
        }
    }

    // TODO: render wood floor below haybales
}
