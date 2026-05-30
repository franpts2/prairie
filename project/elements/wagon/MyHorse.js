import { CGFobject, CGFappearance } from '../../../lib/CGF.js';
import { CGFobjModel } from '../../../lib/extra/CGFobjModel.js';

export class MyHorse extends CGFobject {
    constructor(scene) {
        super(scene);

        // load the OBJ mesh
        this.model = new CGFobjModel(scene, "obj/ImageToStl.com_horse/horse.obj");

        // horse appearance using the registered texture
        this.appearance = new CGFappearance(scene);
        this.appearance.setAmbient(0.4, 0.4, 0.4, 1.0);
        this.appearance.setDiffuse(0.7, 0.7, 0.7, 1.0);
        this.appearance.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.appearance.setShininess(5.0);
        this.appearance.setTexture(this.scene.assetManager.getTexture('horse'));
    }

    display() {
        this.scene.pushMatrix();

        // make the horse face forward (negative Z-axis)
        this.scene.rotate(Math.PI, 0, 1, 0);

        this.appearance.apply();

        this.model.display();

        this.scene.popMatrix();
        this.scene.setDefaultAppearance();
    }
}
