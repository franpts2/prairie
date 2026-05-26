import { MyUnitCube } from "../../shapes/MyUnitCube.js";
import { CGFappearance } from "../../../lib/CGF.js";

export class MyHayBale {
    static SCALE = 1.8;

    constructor(scene, appearance) {
        this.scene = scene;
        this.appearance = appearance;
        
        this.cube = new MyUnitCube(scene);
        
        this.ropeAppearance = new CGFappearance(scene);
        this.ropeAppearance.setAmbient(0.3, 0.05, 0.05, 1.0);
        this.ropeAppearance.setDiffuse(0.757, 0.071, 0.122, 1.0); // #c1121f
        this.ropeAppearance.setSpecular(0.2, 0.2, 0.2, 1.0);
        this.ropeAppearance.setShininess(10.0);
    }

    display() {
        const width = 1.2;
        const height = 0.6;
        const depth = 0.6;

        this.scene.pushMatrix();

        // body
        this.scene.pushMatrix();
        this.scene.scale(width, height, depth);
        if (this.appearance) {
            this.appearance.apply();
        }
        this.cube.display();
        this.scene.popMatrix();

        // ropes (red bands)
        this.ropeAppearance.apply();
        
        const ropeWidth = 0.05;
        const ropeOffset = 0.3; // distance from center along width

        // rope 1
        this.scene.pushMatrix();
        this.scene.translate(-ropeOffset, 0, 0);
        this.scene.scale(ropeWidth, height + 0.02, depth + 0.02); // slightly larger to avoid z-fighting
        this.cube.display();
        this.scene.popMatrix();

        // rope 2
        this.scene.pushMatrix();
        this.scene.translate(ropeOffset, 0, 0);
        this.scene.scale(ropeWidth, height + 0.02, depth + 0.02);
        this.cube.display();
        this.scene.popMatrix();

        this.scene.popMatrix();
    }
}
