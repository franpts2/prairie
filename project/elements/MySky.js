import { CGFappearance, CGFtexture } from "../../lib/CGF.js";
import { MySphere } from "../shapes/MySphere.js";

export class MySky {
  constructor(scene) {
    this.scene = scene;
    this.sphere = new MySphere(scene, 150, 150, 200);
    
    this.appearance = new CGFappearance(scene);
    this.appearance.setAmbient(1.0, 1.0, 1.0, 1.0);
    this.appearance.setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.appearance.setSpecular(0.0, 0.0, 0.0, 1.0);
    this.appearance.setShininess(10.0);
    
    this.texture = scene.assetManager.getTexture('sky');
    this.appearance.setTexture(this.texture);
    this.appearance.setTextureWrap("CLAMP_TO_EDGE", "CLAMP_TO_EDGE");
  }

  display() {
    this.appearance.apply();
    this.sphere.display();
  }
}
