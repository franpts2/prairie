import { CGFtexture, CGFappearance } from "../../lib/CGF.js";
import { MyGrassMesh } from "../shapes/MyGrassMesh.js";
import * as PlacementUtils from "../utils/PlacementUtils.js";

export class MyGrass {
  constructor(scene) {
    this.scene = scene;
    this.liveMeshes = [];
    this.deadMeshes = [];
    this.terrainSize = 400;
    this.baseHeight = 0;
    this.heightScale = 10;
    this.heightMapImage = null;
    this.pathMapImage = null;

    this.liveAppearance = new CGFappearance(scene);
    this.liveTexture = new CGFtexture(scene, "./textures/grass.png");
    this.liveAppearance.setTexture(this.liveTexture);
    this.liveAppearance.setTextureWrap("CLAMP_TO_EDGE", "CLAMP_TO_EDGE");
    this.liveAppearance.setEmission(0.0, 0.0, 0.0, 1);
    this.liveAppearance.setAmbient(0.4, 0.4, 0.4, 1);
    this.liveAppearance.setDiffuse(0.8, 0.8, 0.8, 1);

    this.deadAppearance = new CGFappearance(scene);
    this.deadTexture = new CGFtexture(scene, "./textures/deadgrass.png");
    this.deadAppearance.setTexture(this.deadTexture);
    this.deadAppearance.setTextureWrap("CLAMP_TO_EDGE", "CLAMP_TO_EDGE");
    this.deadAppearance.setEmission(0.0, 0.0, 0.0, 1);
    this.deadAppearance.setAmbient(0.4, 0.4, 0.4, 1);
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
      this.loadPathMap();
    };
    img.src = "./textures/terrainmap.png";
  }

  loadPathMap() {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      this.pathMapImage = ctx.getImageData(0, 0, img.width, img.height);
      this.initGrass();
    };
    img.src = "./textures/pathmap.png";
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

  getPathValue(x, z) {
    if (!this.pathMapImage) return 0;

    const halfSize = this.terrainSize / 2;
    const u = (x + halfSize) / this.terrainSize;
    const v = (z + halfSize) / this.terrainSize;

    const px = Math.floor(u * (this.pathMapImage.width - 1));
    const py = Math.floor(v * (this.pathMapImage.height - 1));

    const idx = (py * this.pathMapImage.width + px) * 4;
    const pathValue = this.pathMapImage.data[idx] / 255;

    return pathValue;
  }

  initGrass() {
    const halfSize = this.terrainSize / 2 - 10;
    const minX = -halfSize;
    const maxX = halfSize;
    const minZ = -halfSize;
    const maxZ = halfSize;

    const liveInstances = [];
    const deadInstances = [];

    const deadPatchGroups = PlacementUtils.generateClusteredPositions({
      groupCount: 70,
      minGroupSize: 30,
      maxGroupSize: 80,
      minX, maxX, minZ, maxZ,
      minGroupDistance: 15,
      clusterRadius: { min: 8, max: 22 },
      minItemDistance: 0.8,
    });

    for (const group of deadPatchGroups) {
      const groupSize = (0.7 + Math.random() * 0.4) * 1.2;
      for (const item of group.items) {
        const height = this.getTerrainHeight(item.x, item.z);
        if (height < -0.5) continue;

        const pathValue = this.getPathValue(item.x, item.z);
        if (pathValue > 0.5) continue;

        deadInstances.push({
          x: item.x,
          y: height,
          z: item.z,
          size: groupSize * (0.8 + Math.random() * 0.4),
          angle: Math.random() * Math.PI * 2
        });
      }
    }

    const step = 0.5;
    const jitter = 0.5;
    const liveSizeBase = 0.75;

    for (let x = minX; x <= maxX; x += step) {
      for (let z = minZ; z <= maxZ; z += step) {
        const px = x + (Math.random() * 2 - 1) * jitter;
        const pz = z + (Math.random() * 2 - 1) * jitter;

        const height = this.getTerrainHeight(px, pz);
        if (height < -0.5) continue;

        const pathValue = this.getPathValue(px, pz);
        if (pathValue > 0.5) continue;

        const size = (0.7 + Math.random() * 0.4) * liveSizeBase;
        liveInstances.push({
          x: px,
          y: height,
          z: pz,
          size: size,
          angle: Math.random() * Math.PI * 2
        });
      }
    }

    const CHUNK_SIZE = 8000;

    for (let i = 0; i < liveInstances.length; i += CHUNK_SIZE) {
      this.liveMeshes.push(new MyGrassMesh(this.scene, liveInstances.slice(i, i + CHUNK_SIZE)));
    }

    for (let i = 0; i < deadInstances.length; i += CHUNK_SIZE) {
      this.deadMeshes.push(new MyGrassMesh(this.scene, deadInstances.slice(i, i + CHUNK_SIZE)));
    }

    console.log(`Generated ${liveInstances.length} live and ${deadInstances.length} dead grass blades!`);
  }

  display() {
    this.scene.gl.disable(this.scene.gl.CULL_FACE);
    this.scene.gl.enable(this.scene.gl.BLEND);
    this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.ONE_MINUS_SRC_ALPHA);
    this.scene.gl.depthMask(false);

    this.liveAppearance.apply();
    for (const mesh of this.liveMeshes) {
      mesh.display();
    }

    this.deadAppearance.apply();
    for (const mesh of this.deadMeshes) {
      mesh.display();
    }

    this.scene.gl.depthMask(true);
    this.scene.gl.enable(this.scene.gl.CULL_FACE);
  }
}
