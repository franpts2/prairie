import { CGFobject } from "../../lib/CGF.js";

export class MyGrassMesh extends CGFobject {
  constructor(scene, instances) {
    super(scene);
    this.instances = instances;
    this.initBuffers();
  }

  initBuffers() {
    this.vertices = [];
    this.normals = [];
    this.texCoords = [];
    this.indices = [];

    let vertexOffset = 0;

    const grassWidthScale = 0.1; // Fine-tune this value to adjust the slenderness of the grass blades

    for (const inst of this.instances) {
      const halfW = (inst.size / 2) * grassWidthScale;
      const h = inst.size * 1.2;

      for (let q = 0; q < 2; q++) {
        const angle = inst.angle + (q * Math.PI / 2);
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const p1 = [-halfW, 0, 0];
        const p2 = [ halfW, 0, 0];
        const p3 = [ halfW, h, 0];
        const p4 = [-halfW, h, 0];

        const transform = (p) => {
          const rx = p[0] * cos - p[2] * sin;
          const rz = p[0] * sin + p[2] * cos;
          return [
            rx + inst.x,
            p[1] + inst.y,
            rz + inst.z
          ];
        };

        const tp1 = transform(p1);
        const tp2 = transform(p2);
        const tp3 = transform(p3);
        const tp4 = transform(p4);

        this.vertices.push(...tp1, ...tp2, ...tp3, ...tp4);

        this.normals.push(
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0
        );

        this.texCoords.push(
          0, 1,
          1, 1,
          1, 0,
          0, 0
        );

        this.indices.push(
          vertexOffset + 0, vertexOffset + 1, vertexOffset + 2,
          vertexOffset + 0, vertexOffset + 2, vertexOffset + 3
        );

        vertexOffset += 4;
      }
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  }
}
