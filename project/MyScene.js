import { CGFscene, CGFcamera, CGFaxis, CGFappearance, CGFtexture, CGFshader } from "../lib/CGF.js";
import { MySky } from "./elements/MySky.js";
import { MyCloud } from "./elements/MyCloud.js";
import { MySun } from "./elements/MySun.js";
import { MyGround } from "./elements/MyGround.js";
import { MyRock } from "./elements/MyRock.js";
import * as PlacementUtils from "./utils/PlacementUtils.js";

/**
 * MyScene
 * @constructor
 */
export class MyScene extends CGFscene {
  constructor() {
    super();
  }
  init(application) {
    super.init(application);

    this.initCameras();
    this.initLights();

    //Background color
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    //this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.enableTextures(true);

    this.setGlobalAmbientLight(0.3, 0.3, 0.3, 1.0);

    //Initialize scene objects
    this.axis = new CGFaxis(this);

    // Element setup
    this.ground = new MyGround(this);
    this.sky = new MySky(this);
    this.cloud = new MyCloud(this);
    this.sun = new MySun(this);
    this.sun.initLight();

    // ROCKS - with multiple textures and vertex perturbation
    this.rockItems = [];
    this.initPlacement();

    //Objects connected to MyInterface
    this.displayAxis = true;
    this.displayLight0 = true;
    this.scaleFactor = 1;
  }
  initLights() {
    // Lights initialized in MySun
  }
  initCameras() {
    this.camera = new CGFcamera(
      0.4,
      0.1,
      500,
      vec3.fromValues(0, 20, 0),
      vec3.fromValues(0, 10, 0)
    );
  }
  setDefaultAppearance() {
    this.setAmbient(0.4, 0.4, 0.4, 1.0);
    this.setDiffuse(0.6, 0.6, 0.6, 1.0);
    this.setSpecular(0.2, 0.2, 0.2, 1.0);
    this.setShininess(10.0);
  }

  initPlacement() {
    const ROCK_RADIUS_PADDING = 1.25;
    const ROCK_GAP = 0.35;

    const getRockSize = () => {
      const sizeRoll = Math.random();

      if (sizeRoll < 0.35) {
        return 0.3 + Math.random() * 0.45; // small stones
      }

      if (sizeRoll < 0.85) {
        return 0.75 + Math.random() * 0.75; // regular rocks
      }

      return 1.5 + Math.random() * 0.9; // larger boulders
    };

    const rocksOverlap = (a, b) => {
      const dx = a.x - b.x;
      const dz = a.z - b.z;
      const minDistance = (a.size + b.size) * ROCK_RADIUS_PADDING + ROCK_GAP;

      return dx * dx + dz * dz < minDistance * minDistance;
    };

    const groups = PlacementUtils.generateClusteredPositions({
      groupCount: 10,
      minGroupSize: 1,
      maxGroupSize: 10,
      minX: -120,
      maxX: 120,
      minZ: -120,
      maxZ: 120,
      minGroupDistance: 50,
      clusterRadius: 20,
      minItemDistance: 5,
    });

    const rockCandidates = groups.flatMap((group, groupIndex) =>
      group.items.map((item, itemIndex) => {
        const seed = groupIndex * 100 + itemIndex; // Consistent seed for texture selection
        return {
          x: item.x,
          z: item.z,
          size: getRockSize(),
          rotation: Math.random() * Math.PI * 2,
          groupIndex,
          rock: new MyRock(this, 1, seed), // Create rock with seed for consistent appearance
        };
      })
    );

    this.rockItems = [];
    rockCandidates
      .sort((a, b) => b.size - a.size)
      .forEach((candidate) => {
        if (this.rockItems.every((rock) => !rocksOverlap(candidate, rock))) {
          this.rockItems.push(candidate);
        }
      });
  }

  displayRockPlacements() {
    for (const rock of this.rockItems) {
      this.pushMatrix();
      this.translate(rock.x, rock.size, rock.z);
      this.rotate(rock.rotation, 0, 1, 0);
      this.scale(rock.size, rock.size, rock.size);
      rock.rock.display();
      this.popMatrix();
    }
  }

  display() {
    // ---- BEGIN Background, camera and axis setup
    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();
    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();

    // Draw axis
    // x: red , y: green, z: blue
    if (this.displayAxis) this.axis.display();

    if (this.displayLight0) this.lights[0].enable();
    else this.lights[0].disable();
    this.lights[0].update();

    this.setDefaultAppearance();

    var sca = [
      this.scaleFactor,
      0.0,
      0.0,
      0.0,
      0.0,
      this.scaleFactor,
      0.0,
      0.0,
      0.0,
      0.0,
      this.scaleFactor,
      0.0,
      0.0,
      0.0,
      0.0,
      1.0,
    ];

    this.multMatrix(sca);

    this.ground.display();

    this.displayRockPlacements();

    this.sky.display();

    this.cloud.update();
    this.cloud.display();
  }
}
