import { CGFappearance, CGFtexture } from "../../lib/CGF.js";
import { MyGrassQuad } from "../shapes/MyGrassQuad.js";

export class MyGrassPatch {
  constructor(scene, x, z, isDead = false, size = 1) {
    this.scene = scene;
    this.x = x;
    this.z = z;
    this.isDead = isDead;
    this.size = size;
  }

  display(height = 0, quad) {
    const camPos = this.scene.camera.position;
    const angle = camPos ? Math.atan2(camPos[0] - this.x, camPos[2] - this.z) : 0;

    this.scene.pushMatrix();
    this.scene.translate(this.x, height, this.z);
    this.scene.rotate(angle, 0, 1, 0);
    this.scene.scale(this.size, this.size, this.size);

    quad.display();

    this.scene.popMatrix();
  }
}
