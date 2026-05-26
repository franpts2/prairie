import { CGFappearance } from "../../lib/CGF.js";
import { MyDonut } from "../shapes/MyDonut.js";

export class MyDeliveryCircle {
  constructor(scene) {
    this.scene = scene;
    
    this.x = 0;
    this.z = -40;

    this.donut = new MyDonut(scene, 64, 9.8, 10.0);

    // cyan glowing appearance
    this.appearance = new CGFappearance(scene);
    this.appearance.setAmbient(0.0, 0.8, 0.8, 1.0);
    this.appearance.setDiffuse(0.0, 0.8, 0.8, 1.0);
    this.appearance.setSpecular(0.0, 1.0, 1.0, 1.0);
    this.appearance.setShininess(20.0);
    this.appearance.setEmission(0.0, 0.4, 0.4, 1.0);
  }

  display() {
    this.scene.pushMatrix();
    
    const height = this.scene.ground ? this.scene.ground.getHeight(this.x, this.z) : 0;
    this.scene.translate(this.x, height + 0.05, this.z);
    
    this.scene.rotate(-Math.PI / 2, 1, 0, 0);
    this.scene.scale(1, 1, 0.05);
    
    this.appearance.apply();
    this.donut.display();
    
    this.scene.popMatrix();
  }
}
