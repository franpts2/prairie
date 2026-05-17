import { CGFobject } from "../../lib/CGF.js";

export class MyGrassQuad extends CGFobject {
  constructor(scene, width = 1, height = 1) {
    super(scene);
    this.width = width;
    this.height = height;
    this.initBuffers();
  }

  initBuffers() {
    const halfW = this.width / 2;
    const halfH = this.height / 2;

    this.vertices = [
      -halfW, 0, 0,
      halfW, 0, 0,
      halfW, this.height, 0,
      -halfW, this.height, 0
    ];

    this.normals = [
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1
    ];

    this.texCoords = [
      0, 1,
      1, 1,
      1, 0,
      0, 0
    ];

    this.indices = [
      0, 1, 2,
      0, 2, 3
    ];

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  }
}