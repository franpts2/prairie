import { CGFscene, CGFcamera, CGFaxis, CGFappearance, CGFtexture, CGFshader } from "../lib/CGF.js";
import { MySphere } from "./shapes/MySphere.js";
import { MyPlane } from "./shapes/MyPlane.js";
import { MySky } from "./elements/MySky.js";
import { MyCloud } from "./elements/MyCloud.js";
import { MySun } from "./elements/MySun.js";

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
    this.plane = new MyPlane(this, 10, 0, 1, 0, 1);

    // Element setup
    this.sky = new MySky(this);
    this.cloud = new MyCloud(this);
    this.sun = new MySun(this);
    this.sun.initLight();

    // plane setup
    this.planeAppearance = new CGFappearance(this);
    this.planeAppearance.setAmbient(1.0, 1.0, 1.0, 1.0);
    this.planeAppearance.setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.planeAppearance.setSpecular(0.0, 0.0, 0.0, 1.0);
    this.planeAppearance.setShininess(10.0);
    this.planeTexture = new CGFtexture(this, "./images/grass.jpg");
    this.planeAppearance.setTexture(this.planeTexture);
    this.planeAppearance.setTextureWrap("CLAMP_TO_EDGE", "CLAMP_TO_EDGE");

    //Objects connected to MyInterface
    this.displayAxis = true;
    this.displayLight0 = true;
    this.scaleFactor = 1;
  }
  initLights() {
    // Lights initialized in MySun
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

    this.pushMatrix();
    this.scale(400, 400, 400);
    this.rotate(- Math.PI / 2, 1, 0, 0);
    this.planeAppearance.apply();
    this.plane.display();
    this.popMatrix();

    this.sky.display();

    this.cloud.update();
    this.cloud.display();
  }
}
