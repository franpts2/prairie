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

    this.texture = new CGFtexture(scene, "./textures/soil.jpg");
    this.appearance.setTexture(this.texture);
    this.appearance.setTextureWrap("REPEAT", "REPEAT");

    this.heightMapPath = "./textures/terrainmap.png";
    this.heightMap = new CGFtexture(scene, this.heightMapPath);
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

    this.heightData = null;
    this.mapWidth = 0;
    this.mapHeight = 0;
    this.loadHeightData();
  }

  loadHeightData() {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      this.heightData = imageData.data;
      this.mapWidth = img.width;
      this.mapHeight = img.height;
      if (this.scene.onGroundLoaded) {
        this.scene.onGroundLoaded();
      }
    };
    img.src = this.heightMapPath;
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
