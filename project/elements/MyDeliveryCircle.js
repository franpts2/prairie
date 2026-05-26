import { CGFappearance } from "../../lib/CGF.js";
import { MyDonut } from "../shapes/MyDonut.js";

export class MyDeliveryCircle {
  constructor(scene) {
    this.scene = scene;
    
    this.x = 0;
    this.z = -40;

    this.donut = new MyDonut(scene, 64, 9.8, 10.0);

    // Inactive appearance: glowing cyan
    this.appearance = new CGFappearance(scene);
    this.appearance.setAmbient(0.0, 0.8, 0.8, 1.0);
    this.appearance.setDiffuse(0.0, 0.8, 0.8, 1.0);
    this.appearance.setSpecular(0.0, 1.0, 1.0, 1.0);
    this.appearance.setShininess(20.0);
    this.appearance.setEmission(0.0, 0.4, 0.4, 1.0);

    // Active appearance: glowing neon green
    this.activeAppearance = new CGFappearance(scene);
    this.activeAppearance.setAmbient(0.0, 0.8, 0.0, 1.0);
    this.activeAppearance.setDiffuse(0.0, 0.8, 0.0, 1.0);
    this.activeAppearance.setSpecular(0.0, 1.0, 0.0, 1.0);
    this.activeAppearance.setShininess(20.0);
    this.activeAppearance.setEmission(0.0, 0.4, 0.0, 1.0);
  }

  /**
   * Checks if the wagon's bounding sphere intersects the circle
   * @param {MyWagon} wagon - The wagon object in the scene
   * @returns {boolean} - true if intersecting
   */
  isIntersecting(wagon) {
    if (!wagon) return false;
    const dx = this.x - wagon.x;
    const dz = this.z - wagon.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    // intersection happens if the distance is less than the sum of radii (circle: 10, wagon: 5)
    const wagonRadius = wagon.radius || 5.0;
    return distance < (10.0 + wagonRadius);
  }

  display(wagon) {
    this.scene.pushMatrix();
    
    const height = this.scene.ground ? this.scene.ground.getHeight(this.x, this.z) : 0;
    this.scene.translate(this.x, height + 0.05, this.z);
    
    this.scene.rotate(-Math.PI / 2, 1, 0, 0);
    this.scene.scale(1, 1, 0.05);
    
    // green if wagon intersects the area, otherwise cyan
    if (this.isIntersecting(wagon)) {
      this.activeAppearance.apply();
    } else {
      this.appearance.apply();
    }
    
    this.donut.display();
    
    this.scene.popMatrix();
  }
}
