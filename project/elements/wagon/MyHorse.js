import { CGFobject, CGFappearance, CGFshader } from '../../../lib/CGF.js';
import { CGFobjModel } from '../../../lib/extra/CGFobjModel.js';

export class MyHorse extends CGFobject {
    constructor(scene, model = null) {
        super(scene);

        // load the OBJ mesh (reusing the shared model if provided to save VBO memory)
        this.model = model || new CGFobjModel(scene, "obj/ImageToStl.com_horse/horse.obj");

        // horse appearance using the registered texture
        this.appearance = new CGFappearance(scene);
        this.appearance.setAmbient(0.4, 0.4, 0.4, 1.0);
        this.appearance.setDiffuse(0.7, 0.7, 0.7, 1.0);
        this.appearance.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.appearance.setShininess(5.0);
        this.appearance.setTexture(this.scene.assetManager.getTexture('horse'));

        // instantiate horse animation shader
        this.shader = new CGFshader(scene.gl, "shaders/horse.vert", "shaders/horse.frag");
    }

    display(speed = 0.0) {
        this.scene.pushMatrix();

        // make the horse face forward (negative Z-axis)
        this.scene.rotate(Math.PI, 0, 1, 0);

        this.appearance.apply();

        // activate custom horse shader
        this.scene.setActiveShader(this.shader);

        const time = this.scene.time || 0.0;
        const lightEnabled = this.scene.lights && this.scene.lights[0] ? this.scene.lights[0].enabled : false;
        const lightPosition = this.scene.lights && this.scene.lights[0] ? this.scene.lights[0].position : [0.0, 0.0, 0.0, 1.0];

        this.shader.setUniformsValues({
            uTime: time,
            uSpeed: speed,
            uLightEnabled: lightEnabled,
            uLightPosition: lightPosition
        });

        this.model.display();

        // restore default shader
        this.scene.setActiveShader(this.scene.defaultShader);

        this.scene.popMatrix();
        this.scene.setDefaultAppearance();
    }
}
