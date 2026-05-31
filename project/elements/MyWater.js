import { CGFappearance, CGFshader } from "../../lib/CGF.js";
import { MyTerrain } from "../shapes/MyTerrain.js";

/**
 * Represents the water rendering element, aligned with MyTerrain
 */
export class MyWater {
  constructor(scene, initialHeight = 1.0) {
    this.scene = scene;
    this.waterHeight = initialHeight;
    this.visible = true;

    // use MyTerrain geometry so alignment, dimensions, and texture coordinates match
    this.mesh = new MyTerrain(scene);

    this.appearance = new CGFappearance(scene);
    this.appearance.setAmbient(0.3, 0.4, 0.5, 1.0);
    this.appearance.setDiffuse(0.6, 0.7, 0.8, 1.0);
    this.appearance.setSpecular(0.8, 0.8, 0.8, 1.0);
    this.appearance.setShininess(120.0);

    // loaded textures from AssetManager
    this.waterTex = scene.assetManager.getTexture('waterTex');
    this.waterMap = scene.assetManager.getTexture('waterMap');
    this.pathMap = scene.assetManager.getTexture('pathMap');
    this.terrainMap = scene.assetManager.getTexture('terrainMap');

    this.appearance.setTexture(this.waterTex);
    this.appearance.setTextureWrap("REPEAT", "REPEAT");

    this.shader = new CGFshader(
      scene.gl,
      "./shaders/water.vert",
      "./shaders/water.frag"
    );

    // set uniform mappings
    this.scene.setActiveShader(this.shader);
    this.shader.setUniformsValues({
      uSampler2: 1,       // bind waterMap to texture unit 1
      uSampler3: 2,       // bind pathMap to texture unit 2
      uSamplerHeight: 3,  // bind terrainMap to texture unit 3
      baseHeight: 0.0,
      heightScale: 10.0,
      waterHeight: this.scene.waterHeight,
      timeFactor: 0.0
    });
    this.scene.setActiveShader(this.scene.defaultShader);
  }

  update(t) {
    // increment and loop timeFactor
    this.scene.setActiveShader(this.shader);
    this.shader.setUniformsValues({ 
      timeFactor: (t / 100) % 100,
      waterHeight: this.scene.waterHeight
    });
    this.scene.setActiveShader(this.scene.defaultShader);
  }

  display() {
    if (!this.scene.renderWater) return;

    this.scene.pushMatrix();

    this.appearance.apply();
    this.scene.setActiveShader(this.shader);

    // bind texture objects to units 1, 2 and 3 respectively
    this.waterMap.bind(1);
    this.pathMap.bind(2);
    this.terrainMap.bind(3);

    this.mesh.display();

    this.scene.setActiveShader(this.scene.defaultShader);
    this.scene.popMatrix();
  }
}
