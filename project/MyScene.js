import { CGFscene, CGFcamera, CGFaxis, CGFappearance } from "../lib/CGF.js";
import { MySky } from "./elements/MySky.js";
import { MyCloud } from "./elements/MyCloud.js";
import { MySun } from "./elements/MySun.js";
import { MyGround } from "./elements/MyGround.js";
import { MyRocks } from "./elements/rocks/MyRocks.js";
import { MyTrees } from "./elements/trees/MyTrees.js";
import { MyGrass } from "./elements/MyGrass.js";
import { MyWagon } from "./elements/wagon/MyWagon.js";
import { MyBarn } from "./elements/barn/MyBarn.js";
import { MyHayBales } from "./elements/haybales/MyHayBales.js";
import { BaleManager } from "./elements/haybales/MyBaleManager.js";
import { AssetManager } from "./utils/AssetManager.js";
import { MyFlowers } from "./elements/flowers/MyFlowers.js";
import { GameController } from "./utils/GameController.js";
import { MyDeliveryCircle } from "./elements/MyDeliveryCircle.js";

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

    // Game Logic
    this.gameController = new GameController(this);

    //Objects connected to MyInterface
    this.displayAxis = true;
    this.displayLight0 = true;
    this.scaleFactor = 1;

    this.setUpdatePeriod(1000 / 60);
    this.lastTime = 0;
    this.time = 0;

    // Temporary FPS Overlay setup
    this.fpsDiv = document.createElement("div");
    this.fpsDiv.style.position = "absolute";
    this.fpsDiv.style.top = "16px";
    this.fpsDiv.style.left = "16px";
    this.fpsDiv.style.color = "#ff3333";
    this.fpsDiv.style.backgroundColor = "rgba(15, 15, 15, 0.85)";
    this.fpsDiv.style.padding = "8px 14px";
    this.fpsDiv.style.fontFamily = "'Courier New', Courier, monospace";
    this.fpsDiv.style.fontSize = "15px";
    this.fpsDiv.style.fontWeight = "bold";
    this.fpsDiv.style.borderRadius = "6px";
    this.fpsDiv.style.zIndex = "9999";
    this.fpsDiv.style.border = "1px solid #ff3333";
    this.fpsDiv.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.5), 0 0 8px rgba(255, 51, 51, 0.2)";
    this.fpsDiv.style.backdropFilter = "blur(4px)";
    this.fpsDiv.style.transition = "all 0.3s ease";
    this.fpsDiv.innerHTML = "FPS: --";
    document.body.appendChild(this.fpsDiv);

    this.fpsFrames = 0;
    this.fpsLastCheck = 0;
  }

  update(t) {
    if (this.lastTime === 0) {
      this.lastTime = t;
    }
    const dt = (t - this.lastTime) / 1000;
    this.lastTime = t;
    this.time += dt;

    // Track FPS
    this.fpsFrames++;
    if (this.fpsLastCheck === 0) {
      this.fpsLastCheck = t;
    }
    if (t - this.fpsLastCheck >= 1000) {
      const fps = Math.round((this.fpsFrames * 1000) / (t - this.fpsLastCheck));
      if (this.fpsDiv) {
        this.fpsDiv.innerHTML = `FPS: ${fps}`;
        
        // Color transition depending on game performance
        if (fps >= 45) {
          this.fpsDiv.style.color = "#2ec4b6"; // Neon Teal
          this.fpsDiv.style.borderColor = "#2ec4b6";
          this.fpsDiv.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.5), 0 0 8px rgba(46, 196, 182, 0.2)";
        } else if (fps >= 25) {
          this.fpsDiv.style.color = "#ff9f1c"; // Vibrant Orange
          this.fpsDiv.style.borderColor = "#ff9f1c";
          this.fpsDiv.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.5), 0 0 8px rgba(255, 159, 28, 0.2)";
        } else {
          this.fpsDiv.style.color = "#e63946"; // Vibrant Red
          this.fpsDiv.style.borderColor = "#e63946";
          this.fpsDiv.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.5), 0 0 8px rgba(230, 57, 70, 0.2)";
        }
      }
      this.fpsFrames = 0;
      this.fpsLastCheck = t;
    }

    if (this.ready) {
      this.checkKeys(dt);
      this.wagon.update(dt);
      if (this.hayBales) this.hayBales.update(dt);
      if (this.flowers) this.flowers.update(this.time);
      this.gameController.update(dt);
    }
  }

  checkKeys(dt) {
    if (this.gui && typeof this.gui.isKeyPressed === 'function') {
      if (this.gui.isKeyPressed("KeyW")) {
        this.wagon.accelerate(dt);
      } else if (this.gui.isKeyPressed("KeyS")) {
        this.wagon.brake(dt);
      } else {
        this.wagon.decelerate(dt);
      }

      if (this.gui.isKeyPressed("KeyA")) {
        this.wagon.steer(1, dt);
      } else if (this.gui.isKeyPressed("KeyD")) {
        this.wagon.steer(-1, dt);
      } else {
        this.wagon.steer(0, dt);
      }
    } else {
      this.wagon.decelerate(dt);
      this.wagon.steer(0, dt);
    }
  }

  getColliders() {
    const colliders = [];

    if (this.rocks && this.rocks.rockItems) {
      for (const rock of this.rocks.rockItems) {
        if (rock.collider) {
          colliders.push({ type: 'rock', item: rock, collider: rock.collider });
        }
      }
    }

    if (this.trees && this.trees.treeItems) {
      for (const tree of this.trees.treeItems) {
        if (tree.collider) {
          colliders.push({ type: 'tree', item: tree, collider: tree.collider });
        }
      }
    }

    if (this.barn && this.barn.collider) {
      colliders.push({ type: 'barn', item: this.barn, collider: this.barn.collider });
    }

    return colliders;
  }

  initElements() {
    this.ground = new MyGround(this);
    this.sky = new MySky(this);
    this.cloud = new MyCloud(this);
    this.sun = new MySun(this);
    this.sun.initLight();

    this.rocks = new MyRocks(this, this.ground);
    this.trees = new MyTrees(this, this.ground);
    this.grass = new MyGrass(this);

    this.baleManager = new BaleManager(this);
    this.hayBales = new MyHayBales(this, this.baleManager);

    this.wagon = new MyWagon(this);

    this.flowers = new MyFlowers(this, this.ground);
    
    this.barn = new MyBarn(this, -20, -100);


    this.deliveryCircle = new MyDeliveryCircle(this);

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

    this.trees.display();

    this.grass.display();

    if (this.gameController && this.gameController.haybaleplatform) {
      this.gameController.haybaleplatform.display();
    }

    this.hayBales.display();

    this.sky.display();

    this.cloud.update();
    this.cloud.display();

    this.deliveryCircle.display(this.wagon);

    this.pushMatrix();
    this.wagon.display();
    this.popMatrix();

    if (this.flowers) this.flowers.display();

    this.pushMatrix();
    this.barn.display();
    this.popMatrix();
  }
}
