import { CGFobject, CGFappearance } from '../../../lib/CGF.js';
import { MyHayBale } from '../haybales/MyHayBale.js';

export class MyCollectedHaybales extends CGFobject {
    constructor(scene, hayAppearance) {
        super(scene);

        // reuse the appearance from the ground haybales
        const appearance = hayAppearance || (scene.hayBales ? scene.hayBales.appearance : null);
        this.hayBale = new MyHayBale(scene, appearance);
    }

    display() {
        const wagonBales = this.scene.gameController.wagonBales;
        const scale = 1.8;
        
        // bale 1 (close to the left wall)
        if (wagonBales >= 1) {
            this.scene.pushMatrix();
            this.scene.translate(-0.75, 1.3 + (0.6 * scale) / 2, 1.8); // X = -0.75 (left wall side), Z = 1.8 (leaving space to the back wall)
            this.scene.rotate(Math.PI / 2, 0, 1, 0); // Rotate lengthwise
            this.scene.scale(scale, scale, scale);
            this.hayBale.display();
            this.scene.popMatrix();
        }
        
        // bale 2 (side-by-side with bale 1)
        if (wagonBales >= 2) {
            this.scene.pushMatrix();
            this.scene.translate(0.75, 1.3 + (0.6 * scale) / 2, 1.8); // X = 0.75 (right wall side), Z = 1.8 (leaving space to the back wall)
            this.scene.rotate(Math.PI / 2, 0, 1, 0); // Rotate lengthwise
            this.scene.scale(scale, scale, scale);
            this.hayBale.display();
            this.scene.popMatrix();
        }
    }
}
