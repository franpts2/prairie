import { CGFappearance, CGFtexture } from "../../lib/CGF.js";
import { MyPlane } from "../shapes/MyPlane.js";

export class MyGround {
  constructor(scene) {
    this.scene = scene;
    this.plane = new MyPlane(scene, 10, 0, 1, 0, 1);

    this.appearance = new CGFappearance(scene);
    this.appearance.setAmbient(1.0, 1.0, 1.0, 1.0);
    this.appearance.setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.appearance.setSpecular(0.0, 0.0, 0.0, 1.0);
    this.appearance.setShininess(10.0);

    this.texture = new CGFtexture(scene, "./images/grass.jpg");
    this.appearance.setTexture(this.texture);
    this.appearance.setTextureWrap("CLAMP_TO_EDGE", "CLAMP_TO_EDGE");
  }

  display() {
    this.scene.pushMatrix();
    this.scene.scale(400, 400, 400);
    this.scene.rotate(-Math.PI / 2, 1, 0, 0);
    this.appearance.apply();
    this.plane.display();
    this.scene.popMatrix();
  }
}
