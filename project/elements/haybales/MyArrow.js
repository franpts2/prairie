import { CGFappearance, CGFshader } from "../../../lib/CGF.js";
import { MyCylinder } from "../../shapes/MyCylinder.js";
import { MyCone } from "../../shapes/MyCone.js";


export class MyArrow {
    constructor(scene) {
        this.scene = scene;

        this.cylinder = new MyCylinder(scene, 12, 4, true);
        this.cone = new MyCone(scene, 12, 4);

        // bright cyan
        this.appearance = new CGFappearance(scene);
        this.appearance.setAmbient(0.0, 1.0, 1.0, 1.0);
        this.appearance.setDiffuse(0.0, 1.0, 1.0, 1.0);
        this.appearance.setSpecular(0.5, 1.0, 1.0, 1.0);
        this.appearance.setShininess(80.0);

        // instantiate custom arrow shader
        this.shader = new CGFshader(scene.gl, "shaders/arrow.vert", "shaders/arrow.frag");
    }

    /**
     * Activates the shader and sets the common uniforms for the batch of arrows
     */
    startShader() {
        this.appearance.apply();
        this.scene.setActiveShader(this.shader);

        const time = this.scene.time || 0.0;
        const lightEnabled = this.scene.lights && this.scene.lights[0] ? this.scene.lights[0].enabled : false;
        const lightPosition = this.scene.lights && this.scene.lights[0] ? this.scene.lights[0].position : [0.0, 0.0, 0.0, 1.0];

        this.shader.setUniformsValues({
            uTime: time,
            uPulseSpeed: 3.5,
            uPulseStrength: 0.08,
            uGlowSpeed: 5.0,
            uBobSpeed: 4.5,
            uBobStrength: 0.15,
            uBaseColor: [0.0, 1.0, 1.0, 1.0], // bright cyan
            uGlowColor: [1.0, 1.0, 1.0, 1.0], // white glow stripe
            uLightEnabled: lightEnabled,
            uLightPosition: lightPosition
        });
    }

    /**
     * Deactivates the custom shader and restores the default shader
     */
    stopShader() {
        this.scene.setActiveShader(this.scene.defaultShader);
    }

    /**
     * Renders a single arrow instance at the target position.
     * Assumes the shader has already been started via startShader().
     * @param {Object} target - Object with coordinates x, y, z
     */
    display(target) {
        const hoverHeight = 4.0;
        const phase = target.x * 0.15 + target.z * 0.15;

        // set the phase offset for the bobbing simulation
        this.shader.setUniformsValues({ uBobPhase: phase });

        this.scene.pushMatrix();
        
        // translate to the target position (hover height is constant, bobbing is done in vertex shader)
        this.scene.translate(target.x, target.y + hoverHeight, target.z);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);

        // draw cylinder
        this.scene.pushMatrix();
        this.scene.scale(0.16, 0.16, 1.0);
        this.cylinder.display();
        this.scene.popMatrix();

        // draw cone
        this.scene.pushMatrix();
        this.scene.translate(0, 0, 1.0);
        this.scene.scale(0.48, 0.48, 0.8);
        this.cone.display();
        this.scene.popMatrix();

        this.scene.popMatrix();
    }
}
