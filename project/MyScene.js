import { CGFscene, CGFcamera, CGFaxis } from "../lib/CGF.js";
import { MySky } from "./elements/MySky.js";
import { MyCloud } from "./elements/MyCloud.js";
import { MySun } from "./elements/MySun.js";
import { MyGround } from "./elements/MyGround.js";
import { MyRocks } from "./elements/MyRocks.js";
import { MyGrass } from "./elements/MyGrass.js";
import { MyWheel } from "./elements/MyWheel.js";
import { AssetManager } from "./utils/AssetManager.js";

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

    //Load assets and initialize elements
    this.assetManager = new AssetManager(this);
    this.assetManager.load().then(() => {
      this.initElements();
    });

    //Objects connected to MyInterface
    this.displayAxis = true;
    this.displayLight0 = true;
    this.scaleFactor = 1;

    this.setUpdatePeriod(1000 / 60);
    this.lastTime = 0;
    this.time = 0;
  }

  update(t) {
    if (this.lastTime === 0) {
      this.lastTime = t;
    }
    const dt = (t - this.lastTime) / 1000;
    this.lastTime = t;
    this.time += dt;
  }

  initElements() {
    this.ground = new MyGround(this);
    this.sky = new MySky(this);
    this.cloud = new MyCloud(this);
    this.sun = new MySun(this);
    this.sun.initLight();

    this.rocks = new MyRocks(this, this.ground);
    this.grass = new MyGrass(this);

    this.wheel = new MyWheel(this);
    
    this.ready = true;
  }

  initLights() {
    // Lights initialized in MySun
  }
  initCameras() {
    this.camera = new CGFcamera(
      0.4,
      0.1,
      5000,
      vec3.fromValues(30, 15, 30),
      vec3.fromValues(0, 0, 0)
    );
  }
  setDefaultAppearance() {
    this.setAmbient(0.4, 0.4, 0.4, 1.0);
    this.setDiffuse(0.6, 0.6, 0.6, 1.0);
    this.setSpecular(0.2, 0.2, 0.2, 1.0);
    this.setShininess(10.0);
  }

  display() {
    if (!this.ready) return;

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

    this.ground.display();

    this.rocks.display();

    this.grass.display();

    this.sky.display();

    this.cloud.update();
    this.cloud.display();

    this.pushMatrix();
    this.translate(0, 5, 0);
    this.wheel.display();
    this.popMatrix();
  }
}
