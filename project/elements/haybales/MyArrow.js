import { CGFappearance } from "../../../lib/CGF.js";
import { MyCylinder } from "../../shapes/MyCylinder.js";
import { MyCone } from "../../shapes/MyCone.js";


export class MyArrow {
    constructor(scene) {
        this.scene = scene;

        this.cylinder = new MyCylinder(scene, 12, 4, true);
        this.cone = new MyCone(scene, 12, 4);

        // glossy bright red/orange
        this.appearance = new CGFappearance(this.scene);
        this.appearance.setAmbient(0.8, 0.15, 0.05, 1.0);
        this.appearance.setDiffuse(0.95, 0.2, 0.05, 1.0);
        this.appearance.setSpecular(0.8, 0.8, 0.8, 1.0);
        this.appearance.setShininess(50.0);
    }

    /**
     * Renders a floating, bobbing arrow above a target position
     * @param {Object} target - Object with coordinates x, y, z
     * @param {number} bobOffset - Vertical animation offset
     */
    display(target, bobOffset = 0.0) {
        const hoverHeight = 4.0 + bobOffset;

        this.scene.pushMatrix();
        
        // draw the arrow above the target
        this.scene.translate(target.x, target.y + hoverHeight, target.z);
        
        this.scene.rotate(Math.PI / 2, 1, 0, 0);

        this.appearance.apply();

        // draw cylinder
        this.scene.pushMatrix();
        this.scene.scale(0.08, 0.08, 0.5); // length 0.5
        this.cylinder.display();
        this.scene.popMatrix();

        // draw cone
        this.scene.pushMatrix();
        this.scene.translate(0, 0, 0.5);
        this.scene.scale(0.24, 0.24, 0.4);
        this.cone.display();
        this.scene.popMatrix();

        this.scene.popMatrix();
    }
}
