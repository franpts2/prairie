import { CGFobject, CGFappearance } from "../../lib/CGF.js";

export class MyDeliveryCircle extends CGFobject {
  constructor(scene) {
    super(scene);
    this.scene = scene;
    
    this.x = -40;
    this.z = -90;
    this.radius = 10.0;
    this.width = 0.5; // width of the ring boundary
    this.slices = 120; // number of subdivisions around the circle

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

    // geometry buffers adapting to terrain heights
    this.initBuffers();
  }

  initBuffers() {
    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    const alphaAng = (2 * Math.PI) / this.slices;
    const rInner = this.radius - this.width / 2;
    const rOuter = this.radius + this.width / 2;

    for (let i = 0; i <= this.slices; i++) {
      const ang = i * alphaAng;
      const cos = Math.cos(ang);
      const sin = Math.sin(ang);

      // local coordinates in XZ plane
      const xInnerLocal = rInner * cos;
      const zInnerLocal = rInner * sin;
      const xOuterLocal = rOuter * cos;
      const zOuterLocal = rOuter * sin;

      // global coordinates for height querying
      const xInnerGlobal = this.x + xInnerLocal;
      const zInnerGlobal = this.z + zInnerLocal;
      const xOuterGlobal = this.x + xOuterLocal;
      const zOuterGlobal = this.z + zOuterLocal;

      // query ground heights from heightfield terrain
      const yInner = this.scene.ground ? this.scene.ground.getHeight(xInnerGlobal, zInnerGlobal) : 0;
      const yOuter = this.scene.ground ? this.scene.ground.getHeight(xOuterGlobal, zOuterGlobal) : 0;

      // floating offset slightly above the ground mesh to prevent Z-fighting / clipping
      const offset = 0.08;

      // inner vertex
      this.vertices.push(xInnerLocal, yInner + offset, zInnerLocal);
      this.normals.push(0, 1, 0);
      this.texCoords.push(0, 0);

      // outer vertex
      this.vertices.push(xOuterLocal, yOuter + offset, zOuterLocal);
      this.normals.push(0, 1, 0);
      this.texCoords.push(0, 0);
    }

    // build indices for the ring quads connecting consecutive inner/outer vertices
    for (let i = 0; i < this.slices; i++) {
      const currInner = 2 * i;
      const currOuter = 2 * i + 1;
      const nextInner = 2 * (i + 1);
      const nextOuter = 2 * (i + 1) + 1;

      // triangle 1: currInner, nextInner, currOuter
      this.indices.push(currInner, nextInner, currOuter);
      // triangle 2: currOuter, nextInner, nextOuter
      this.indices.push(currOuter, nextInner, nextOuter);
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  }

  isIntersecting(wagon) {
    if (!wagon) return false;
    const dx = this.x - wagon.x;
    const dz = this.z - wagon.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    const wagonRadius = wagon.radius || 5.0;
    return distance < (this.radius + wagonRadius);
  }

  display(wagon) {
    this.scene.pushMatrix();
    
    // translate the mesh to global
    this.scene.translate(this.x, 0, this.z);

    if (this.isIntersecting(wagon)) {
      this.activeAppearance.apply();
    } else {
      this.appearance.apply();
    }

    // render CGFobject buffers
    super.display();

    this.scene.popMatrix();
  }
}
