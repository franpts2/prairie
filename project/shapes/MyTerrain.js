import { CGFobject } from "../../lib/CGF.js";

export class MyTerrain extends CGFobject {
  constructor(scene, size = 400, divisions = 160) {
    super(scene);
    this.size = size;
    this.divisions = divisions;
    this.initBuffers();
  }

  initBuffers() {
    this.vertices = [];
    this.normals = [];
    this.texCoords = [];
    this.indices = [];

    const halfSize = this.size / 2;
    const step = this.size / this.divisions;

    for (let j = 0; j <= this.divisions; j++) {
      const z = -halfSize + j * step;
      for (let i = 0; i <= this.divisions; i++) {
        const x = -halfSize + i * step;

        this.vertices.push(x, 0, z);
        this.normals.push(0, 1, 0);
        this.texCoords.push(i / this.divisions, j / this.divisions);
      }
    }

    const rowSize = this.divisions + 1;
    for (let j = 0; j < this.divisions; j++) {
      for (let i = 0; i < this.divisions; i++) {
        const topLeft = j * rowSize + i;
        const topRight = topLeft + 1;
        const bottomLeft = topLeft + rowSize;
        const bottomRight = bottomLeft + 1;

        this.indices.push(topLeft, bottomLeft, topRight);
        this.indices.push(topRight, bottomLeft, bottomRight);
      }
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  }
}
