import { CGFappearance, CGFshader, CGFtexture } from "../../lib/CGF.js";
import { MyTerrain } from "../shapes/MyTerrain.js";

export class MyGround {
  constructor(scene) {
    this.scene = scene;
    this.terrain = new MyTerrain(scene);
    this.heightScale = 10.0;
    this.baseHeight = 0.0;
    this.grassRepeat = 28.0;

    this.appearance = new CGFappearance(scene);
    this.appearance.setAmbient(0.42, 0.42, 0.36, 1.0);
    this.appearance.setDiffuse(0.88, 0.86, 0.72, 1.0);
    this.appearance.setSpecular(0.0, 0.0, 0.0, 1.0);
    this.appearance.setShininess(10.0);

    this.texture = new CGFtexture(scene, "./images/grass.jpg");
    this.appearance.setTexture(this.texture);
    this.appearance.setTextureWrap("REPEAT", "REPEAT");

    this.heightMap = new CGFtexture(scene, "./textures/terrainmap.png");
    this.shader = new CGFshader(
      scene.gl,
      "./shaders/terrain.vert",
      "./shaders/terrain.frag"
    );
    this.shader.setUniformsValues({
      uSampler2: 1,
      baseHeight: this.baseHeight,
      heightScale: this.heightScale,
      heightTexel: 1.0 / 257.0,
      grassRepeat: this.grassRepeat,
    });
  }

  display() {
    this.scene.pushMatrix();
    this.appearance.apply();
    this.scene.setActiveShader(this.shader);
    this.heightMap.bind(1);
    this.terrain.display();
    this.scene.setActiveShader(this.scene.defaultShader);
    this.scene.popMatrix();
  }
}
