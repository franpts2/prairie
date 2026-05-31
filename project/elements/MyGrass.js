import { CGFtexture, CGFappearance, CGFshader } from "../../lib/CGF.js";
import { MyGrassMesh } from "../shapes/MyGrassMesh.js";
import * as PlacementUtils from "../utils/PlacementUtils.js";
import { SpatialGrid } from "../utils/SpatialGrid.js";

export class MyGrass {
  constructor(scene) {
    this.scene = scene;
    this.ground = scene.ground;
    this.liveMeshes = [];
    this.deadMeshes = [];
    this.terrainSize = 400;
    this.baseHeight = 0;
    this.heightScale = 10;

    this.liveAppearance = new CGFappearance(scene);
    this.liveTexture = scene.assetManager.getTexture('grass');
    this.liveAppearance.setTexture(this.liveTexture);
    this.liveAppearance.setTextureWrap("CLAMP_TO_EDGE", "CLAMP_TO_EDGE");
    this.liveAppearance.setEmission(0.0, 0.0, 0.0, 1);
    this.liveAppearance.setAmbient(0.4, 0.4, 0.4, 1);
    this.liveAppearance.setDiffuse(0.8, 0.8, 0.8, 1);

    this.deadAppearance = new CGFappearance(scene);
    this.deadTexture = scene.assetManager.getTexture('deadGrass');
    this.deadAppearance.setTexture(this.deadTexture);
    this.deadAppearance.setTextureWrap("CLAMP_TO_EDGE", "CLAMP_TO_EDGE");
    this.deadAppearance.setEmission(0.0, 0.0, 0.0, 1);
    this.deadAppearance.setAmbient(0.4, 0.4, 0.4, 1);
    this.deadAppearance.setDiffuse(0.8, 0.8, 0.8, 1);

    this.grassShader = new CGFshader(scene.gl, "shaders/grass/grass.vert", "shaders/grass/grass.frag");
    
    this.scene.setActiveShader(this.grassShader);
    this.grassShader.setUniformsValues({
      uWindSpeed: 1.0,
      uWindStrength: 0.3
    });
    this.scene.setActiveShader(this.scene.defaultShader);

    this.initGrass();
  }

  getTerrainHeight(x, z) {
    return this.ground ? this.ground.getHeight(x, z) : 0;
  }

  getPathValue(x, z) {
    return this.ground ? this.ground.getPathValue(x, z) : 0;
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
      minGroupSize: 80,
      maxGroupSize: 200,
      minX, maxX, minZ, maxZ,
      minGroupDistance: 15,
      clusterRadius: { min: 8, max: 22 },
      minItemDistance: 0.2,
    });

    this.deadPatchGroups = deadPatchGroups;

    for (const group of deadPatchGroups) {
      const groupSize = (0.7 + Math.random() * 0.4) * 0.75;
      for (const item of group.items) {
        if (item.x * item.x + item.z * item.z > 200 * 200) continue;

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

    // Use SpatialGrid for efficient overlap check
    const spatialGrid = new SpatialGrid(2);
    
    // Add dead grass to avoidance zones
    for (const dead of deadInstances) {
      spatialGrid.addObstacle(dead.x, dead.z, 0.8);
    }

    // Add rocks to avoidance zones
    if (this.scene.rocks && this.scene.rocks.rockItems) {
      for (const rock of this.scene.rocks.rockItems) {
        spatialGrid.addObstacle(rock.x, rock.z, rock.size * 1.2);
      }
    }

    if (this.scene.trees && this.scene.trees.treeItems) {
      for (const tree of this.scene.trees.treeItems) {
        spatialGrid.addObstacle(tree.x, tree.z, tree.trunkRadius * 2.2);
      }
    }

    const step = 0.5;
    const jitter = 0.5;
    const liveSizeBase = 0.75;

    for (let x = minX; x <= maxX; x += step) {
      for (let z = minZ; z <= maxZ; z += step) {
        const px = x + (Math.random() * 2 - 1) * jitter;
        const pz = z + (Math.random() * 2 - 1) * jitter;

        if (px * px + pz * pz > 200 * 200) continue;

        const height = this.getTerrainHeight(px, pz);
        if (height < -0.5) continue;

        const pathValue = this.getPathValue(px, pz);
        if (pathValue > 0.5) continue;

        // Check if position is blocked by dead grass or rocks
        if (spatialGrid.isBlocked(px, pz)) continue;

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

    this.scene.setActiveShader(this.grassShader);
    this.grassShader.setUniformsValues({
      uTime: this.scene.time,
      uLightEnabled: this.scene.lights[0].enabled,
      uLightPosition: this.scene.lights[0].position
    });

    this.liveAppearance.apply();
    for (const mesh of this.liveMeshes) {
      mesh.display();
    }

    this.deadAppearance.apply();
    for (const mesh of this.deadMeshes) {
      mesh.display();
    }

    this.scene.setActiveShader(this.scene.defaultShader);

    this.scene.gl.depthMask(true);
    this.scene.gl.enable(this.scene.gl.CULL_FACE);
  }
}
