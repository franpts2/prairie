import { CGFscene, CGFcamera, CGFaxis, CGFappearance, CGFtexture, CGFshader } from "../lib/CGF.js";
import { MySphere } from "./MySphere.js";

/**
 * MyScene
 * @constructor
 */
export class MyScene extends CGFscene {
  constructor() {
    super();
  }
  init(application) {
    super.init(application);

    this.initCameras();
    this.initLights();

    //Background color
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.enableTextures(true);

    this.setGlobalAmbientLight(0.3, 0.3, 0.3, 1.0);

    //Initialize scene objects
    this.axis = new CGFaxis(this);
    this.sphere = new MySphere(this, 150, 150, 200);

    this.sphereAppearance = new CGFappearance(this);
    this.sphereAppearance.setAmbient(1.0, 1.0, 1.0, 1.0);
    this.sphereAppearance.setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.sphereAppearance.setSpecular(0.0, 0.0, 0.0, 1.0);
    this.sphereAppearance.setShininess(10.0);
    this.sphereTexture = new CGFtexture(this, "./images/sky.jpeg");
    this.sphereAppearance.setTexture(this.sphereTexture);
    this.sphereAppearance.setTextureWrap("CLAMP_TO_EDGE", "CLAMP_TO_EDGE");

    // Cloud setup
    this.cloudSphere = new MySphere(this, 150, 150);
    this.cloudAppearance = new CGFappearance(this);
    this.cloudAppearance.setAmbient(1.0, 1.0, 1.0, 1.0);
    this.cloudAppearance.setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.cloudTexture = new CGFtexture(this, "./images/clouds.png");
    this.cloudAppearance.setTexture(this.cloudTexture);
    this.cloudAppearance.setTextureWrap("CLAMP_TO_EDGE", "CLAMP_TO_EDGE");
    this.cloudRotation = 0;

    //Objects connected to MyInterface
    this.displayAxis = true;
    this.displayLight0 = true;
    this.scaleFactor = 1;
  }
  initLights() {
    this.lights[0].setPosition(0.45, -0.89, 0, 0);
    this.lights[0].setAmbient(0.3, 0.3, 0.3, 1.0);
    this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.lights[0].setSpecular(1.0, 1.0, 1.0, 1.0);
    this.lights[0].enable();
    this.lights[0].update();
  }
  initCameras() {
    this.camera = new CGFcamera(
      0.4,
      0.1,
      500,
      vec3.fromValues(0, 20, 0),
      vec3.fromValues(0, 10, 0)
    );
  }
  setDefaultAppearance() {
    this.setAmbient(0.4, 0.4, 0.4, 1.0);
    this.setDiffuse(0.6, 0.6, 0.6, 1.0);
    this.setSpecular(0.2, 0.2, 0.2, 1.0);
    this.setShininess(10.0);
  }
  display() {
    // ---- BEGIN Background, camera and axis setup
    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();
    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();

    // Draw axis
    // x: red , y: green, z: blue
    if (this.displayAxis) this.axis.display();

    if (this.displayLight0) this.lights[0].enable();
    else this.lights[0].disable();
    this.lights[0].update();

    this.setDefaultAppearance();

    var sca = [
      this.scaleFactor,
      0.0,
      0.0,
      0.0,
      0.0,
      this.scaleFactor,
      0.0,
      0.0,
      0.0,
      0.0,
      this.scaleFactor,
      0.0,
      0.0,
      0.0,
      0.0,
      1.0,
    ];

    this.multMatrix(sca);

    this.sphereAppearance.apply();
    this.sphere.display();

    this.pushMatrix();
    this.scale(0.98, 0.98, 0.98); // inside sky sphere
    this.rotate(this.cloudRotation, 0, 1, 0);
    this.gl.disable(this.gl.CULL_FACE); // show inside of sphere
    this.cloudAppearance.apply();
    this.cloudSphere.display();
    this.gl.enable(this.gl.CULL_FACE);
    this.popMatrix();

    // animate clouds
    this.cloudRotation += 0.0001;
  }
}
