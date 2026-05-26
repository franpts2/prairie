import { CGFobject, CGFappearance } from '../../../lib/CGF.js';
import { MyHayBale } from '../MyHayBale.js';

export class MyCollectedHaybales extends CGFobject {
    constructor(scene, hayAppearance) {
        super(scene);

        // reuse the appearance from the ground haybales
        const appearance = hayAppearance || (scene.hayBales ? scene.hayBales.appearance : null);
        this.hayBale = new MyHayBale(scene, appearance);
    }

    display() {
        const wagonBales = this.scene.gameController.wagonBales;
        const baleScales = this.scene.gameController.wagonBaleScales || [];
        
        // bale 1 (close to the left wall)
        if (wagonBales >= 1) {
            const scale = baleScales[0] || 1.8;
            this.scene.pushMatrix();
            this.scene.translate(-0.75, 1.3 + (0.6 * scale) / 2, 1.8); // X = -0.75 (left wall side), Z = 1.8 (leaving space to the back wall)
            this.scene.rotate(Math.PI / 2, 0, 1, 0); // Rotate lengthwise
            this.scene.scale(scale, scale, scale);
            this.hayBale.display();
            this.scene.popMatrix();
        }
        
        // bale 2 (side-by-side with bale 1)
        if (wagonBales >= 2) {
            const scale = baleScales[1] || 1.8;
            this.scene.pushMatrix();
            this.scene.translate(0.75, 1.3 + (0.6 * scale) / 2, 1.8); // X = 0.75 (right wall side), Z = 1.8 (leaving space to the back wall)
            this.scene.rotate(Math.PI / 2, 0, 1, 0); // Rotate lengthwise
            this.scene.scale(scale, scale, scale);
            this.hayBale.display();
            this.scene.popMatrix();
        }
        
        // bale 3 (placed on top of both bales, forming a pyramid)
        if (wagonBales >= 3) {
            const scaleBottom = baleScales[0] || 1.8;
            const scaleTop = baleScales[2] || 1.8;
            this.scene.pushMatrix();
            const yPos = 1.3 + (0.6 * scaleBottom) + (0.6 * scaleTop) / 2; // X = 0.0 (centered), Z = 1.5 (aligned with bottom layer), Y = atop the first layer
            this.scene.translate(0.0, yPos, 1.8);
            this.scene.rotate(Math.PI / 2, 0, 1, 0); // Rotate lengthwise
            this.scene.scale(scaleTop, scaleTop, scaleTop);
            this.hayBale.display();
            this.scene.popMatrix();
        }
    }
}
