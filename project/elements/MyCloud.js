import { CGFappearance, CGFtexture } from "../../lib/CGF.js";
import { MySphere } from "../shapes/MySphere.js";

export class MyCloud {
  constructor(scene) {
    this.scene = scene;
    this.sphere = new MySphere(scene, 150, 150);
    this.rotation = 0;
    
    this.appearance = new CGFappearance(scene);
    this.appearance.setAmbient(1.0, 1.0, 1.0, 1.0);
    this.appearance.setDiffuse(1.0, 1.0, 1.0, 1.0);
    
    this.texture = new CGFtexture(scene, "./textures/clouds.png");
    this.appearance.setTexture(this.texture);
    this.appearance.setTextureWrap("CLAMP_TO_EDGE", "CLAMP_TO_EDGE");
  }

  update() {
    this.rotation += 0.0001;
  }

  display() {
    this.scene.pushMatrix();
    this.scene.scale(0.98, 0.98, 0.98);
    this.scene.rotate(this.rotation, 0, 1, 0);
    this.appearance.apply();
    this.sphere.display();
    this.scene.popMatrix();
  }
}
