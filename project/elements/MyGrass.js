import { CGFtexture, CGFappearance } from "../../lib/CGF.js";
import { MyGrassPatch } from "./MyGrassPatch.js";
import { MyGrassQuad } from "../shapes/MyGrassQuad.js";
import * as PlacementUtils from "../utils/PlacementUtils.js";

export class MyGrass {
  constructor(scene) {
    this.scene = scene;
    this.livePatches = [];
    this.deadPatches = [];
    this.terrainSize = 400;
    this.baseHeight = 0;
    this.heightScale = 10;
    this.heightMapImage = null;

    this.quad = new MyGrassQuad(scene, 1, 1.2);

    this.liveAppearance = new CGFappearance(scene);
    this.liveTexture = new CGFtexture(scene, "./textures/grass.png");
    this.liveAppearance.setTexture(this.liveTexture);
    this.liveAppearance.setTextureWrap("CLAMP_TO_EDGE", "CLAMP_TO_EDGE");
    this.liveAppearance.setEmission(0.2, 0.2, 0.2, 1);
    this.liveAppearance.setAmbient(0.8, 0.8, 0.8, 1);
    this.liveAppearance.setDiffuse(0.8, 0.8, 0.8, 1);

    this.deadAppearance = new CGFappearance(scene);
    this.deadTexture = new CGFtexture(scene, "./textures/deadgrass.png");
    this.deadAppearance.setTexture(this.deadTexture);
    this.deadAppearance.setTextureWrap("CLAMP_TO_EDGE", "CLAMP_TO_EDGE");
    this.deadAppearance.setEmission(0.2, 0.2, 0.2, 1);
    this.deadAppearance.setAmbient(0.8, 0.8, 0.8, 1);
    this.deadAppearance.setDiffuse(0.8, 0.8, 0.8, 1);

    this.loadHeightMap();
  }

  loadHeightMap() {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      this.heightMapImage = ctx.getImageData(0, 0, img.width, img.height);
      this.initGrass();
    };
    img.src = "./textures/terrainmap.png";
  }

  getTerrainHeight(x, z) {
    if (!this.heightMapImage) return 0;

    const halfSize = this.terrainSize / 2;
    const u = (x + halfSize) / this.terrainSize;
    const v = (z + halfSize) / this.terrainSize;

    const px = Math.floor(u * (this.heightMapImage.width - 1));
    const py = Math.floor(v * (this.heightMapImage.height - 1));

    const idx = (py * this.heightMapImage.width + px) * 4;
    const height = this.heightMapImage.data[idx] / 255;

    return this.baseHeight + height * this.heightScale;
  }

  initGrass() {
    const halfSize = this.terrainSize / 2 - 10;
    const minX = -halfSize;
    const maxX = halfSize;
    const minZ = -halfSize;
    const maxZ = halfSize;

    const patchGroups = PlacementUtils.generateClusteredPositions({
      groupCount: 100,
      minGroupSize: 15,
      maxGroupSize: 40,
      minX, maxX, minZ, maxZ,
      minGroupDistance: 20,
      clusterRadius: { min: 10, max: 25 },
      minItemDistance: 1.5,
    });

    for (const group of patchGroups) {
      const isDeadGroup = Math.random() < 0.35;
      const groupSize = 0.8 + Math.random() * 0.6;

      for (const item of group.items) {
        const height = this.getTerrainHeight(item.x, item.z);
        if (height < -0.5) continue;

        const patch = new MyGrassPatch(this.scene, item.x, item.z, isDeadGroup, groupSize);
        patch.height = height;
        if (isDeadGroup) this.deadPatches.push(patch);
        else this.livePatches.push(patch);
      }
    }

    const scatteredCount = 2500;
    const positions = PlacementUtils.generateScatterPositions({
      count: scatteredCount,
      minX, maxX, minZ, maxZ,
      minDistance: 3.5,
    });

    for (const pos of positions) {
      const isDead = Math.random() < 0.25;
      const size = 0.5 + Math.random() * 0.4;
      const height = this.getTerrainHeight(pos.x, pos.z);

      if (height < -0.5) continue;

      const nearPatch = this.livePatches.some(p => {
        const dx = p.x - pos.x;
        const dz = p.z - pos.z;
        return dx * dx + dz * dz < 64;
      }) || this.deadPatches.some(p => {
        const dx = p.x - pos.x;
        const dz = p.z - pos.z;
        return dx * dx + dz * dz < 64;
      });
      if (nearPatch) continue;

      const patch = new MyGrassPatch(this.scene, pos.x, pos.z, isDead, size);
      patch.height = height;
      if (isDead) this.deadPatches.push(patch);
      else this.livePatches.push(patch);
    }
  }

  display() {
    this.scene.gl.disable(this.scene.gl.CULL_FACE);
    this.scene.gl.enable(this.scene.gl.BLEND);
    this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.ONE_MINUS_SRC_ALPHA);
    this.scene.gl.depthMask(false);

    this.liveAppearance.apply();
    for (const patch of this.livePatches) {
      patch.display(patch.height, this.quad);
    }

    this.deadAppearance.apply();
    for (const patch of this.deadPatches) {
      patch.display(patch.height, this.quad);
    }

    this.scene.gl.depthMask(true);
    this.scene.gl.enable(this.scene.gl.CULL_FACE);
  }
}