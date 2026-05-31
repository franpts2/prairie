import { CGFappearance, CGFshader, CGFtexture } from "../../lib/CGF.js";
import { MyTerrain } from "../shapes/MyTerrain.js";

export class MyGround {
  constructor(scene) {
    this.scene = scene;
    this.terrain = new MyTerrain(scene);
    this.heightScale = 10.0;
    this.baseHeight = 0.0;
    this.grassRepeat = 28.0;
    this.pathRepeat = 40.0;

    this.appearance = new CGFappearance(scene);
    this.appearance.setAmbient(0.42, 0.42, 0.36, 1.0);
    this.appearance.setDiffuse(0.88, 0.86, 0.72, 1.0);
    this.appearance.setSpecular(0.0, 0.0, 0.0, 1.0);
    this.appearance.setShininess(10.0);

    this.texture = scene.assetManager.getTexture('soil');
    this.appearance.setTexture(this.texture);
    this.appearance.setTextureWrap("REPEAT", "REPEAT");

    this.pathsoilTexture = scene.assetManager.getTexture('pathSoil');
    this.heightMap = scene.assetManager.getTexture('terrainMap');
    this.pathMap = scene.assetManager.getTexture('pathMap');
    
    this.shader = new CGFshader(
      scene.gl,
      "./shaders/terrain/terrain.vert",
      "./shaders/terrain/terrain.frag"
    );
    
    this.scene.setActiveShader(this.shader);
    this.shader.setUniformsValues({
      uSampler2: 1,
      uSampler3: 3,
      uSamplerPath: 2,
      baseHeight: this.baseHeight,
      heightScale: this.heightScale,
      heightTexel: 1.0 / 257.0,
      grassRepeat: this.grassRepeat,
      pathRepeat: this.pathRepeat,
    });
    this.scene.setActiveShader(this.scene.defaultShader);

    const terrainData = scene.assetManager.getPixelData('terrain');
    this.heightData = terrainData.data;
    this.mapWidth = terrainData.width;
    this.mapHeight = terrainData.height;
  }

  getHeight(x, z) {
    if (!this.heightData) return 0;

    const halfSize = this.terrain.size / 2;
    const u = (x + halfSize) / this.terrain.size;
    const v = (z + halfSize) / this.terrain.size;

    if (u < 0 || u > 1 || v < 0 || v > 1) return 0;

    const xPos = u * (this.mapWidth - 1);
    const yPos = v * (this.mapHeight - 1);

    const x0 = Math.floor(xPos);
    const x1 = Math.min(x0 + 1, this.mapWidth - 1);
    const y0 = Math.floor(yPos);
    const y1 = Math.min(y0 + 1, this.mapHeight - 1);

    const dx = xPos - x0;
    const dy = yPos - y0;

    const getPixel = (tx, ty) => {
      const index = (ty * this.mapWidth + tx) * 4;
      return this.heightData[index] / 255.0;
    };

    const p00 = getPixel(x0, y0);
    const p10 = getPixel(x1, y0);
    const p01 = getPixel(x0, y1);
    const p11 = getPixel(x1, y1);

    const r =
      p00 * (1 - dx) * (1 - dy) +
      p10 * dx * (1 - dy) +
      p01 * (1 - dx) * dy +
      p11 * dx * dy;

    return this.baseHeight + r * this.heightScale;
  }

  getPathValue(x, z) {
    if (!this.pathData) {
      const pathData = this.scene.assetManager.getPixelData('path');
      if (!pathData) return 0;
      this.pathData = pathData.data;
      this.pathWidth = pathData.width;
      this.pathHeight = pathData.height;
    }

    const halfSize = this.terrain.size / 2;
    const u = (x + halfSize) / this.terrain.size;
    const v = (z + halfSize) / this.terrain.size;

    if (u < 0 || u > 1 || v < 0 || v > 1) return 0;

    const px = Math.floor(u * (this.pathWidth - 1));
    const py = Math.floor(v * (this.pathHeight - 1));
    const idx = (py * this.pathWidth + px) * 4;
    return this.pathData[idx] / 255.0;
  }

  isPointInWater(x, z) {
    if (!this.pathData) {
      const pathData = this.scene.assetManager.getPixelData('path');
      if (!pathData) return false;
      this.pathData = pathData.data;
      this.pathWidth = pathData.width;
      this.pathHeight = pathData.height;
    }

    const halfSize = this.terrain.size / 2;
    const u = (x + halfSize) / this.terrain.size;
    const v = (z + halfSize) / this.terrain.size;

    if (u < 0 || u > 1 || v < 0 || v > 1) return false;

    // Check if within circular boundary of the terrain
    const du = u - 0.5;
    const dv = v - 0.5;
    if (du * du + dv * dv > 0.25) return false;

    const getPixelVal = (uu, vv) => {
      const px = Math.floor(Math.max(0, Math.min(1, uu)) * (this.pathWidth - 1));
      const py = Math.floor(Math.max(0, Math.min(1, vv)) * (this.pathHeight - 1));
      const idx = (py * this.pathWidth + px) * 4;
      return this.pathData[idx] / 255.0;
    };

    const pathValue = getPixelVal(u, v);
    if (pathValue < 0.40 || pathValue > 0.60) return false;

    const stepSize = 0.012;
    const p1 = getPixelVal(u + stepSize, v);
    const p2 = getPixelVal(u - stepSize, v);
    const p3 = getPixelVal(u, v + stepSize);
    const p4 = getPixelVal(u, v - stepSize);

    const maxNeighbor = Math.max(p1, p2, p3, p4);
    if (maxNeighbor > 0.70) return false;

    return true;
  }

  display() {
    this.scene.pushMatrix();
    this.appearance.apply();
    this.scene.setActiveShader(this.shader);
    
    this.shader.setUniformsValues({
      uLightEnabled: this.scene.lights[0].enabled,
      uLightPosition: this.scene.lights[0].position
    });

    this.heightMap.bind(1);
    this.pathMap.bind(3);
    this.pathsoilTexture.bind(2);
    this.terrain.display();
    this.scene.setActiveShader(this.scene.defaultShader);
    this.scene.popMatrix();
  }
}
