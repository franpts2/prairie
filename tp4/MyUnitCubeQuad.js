import { CGFobject } from "../lib/CGF.js";
import { MyQuad } from "./MyQuad.js";

/**
 * MyUnitCubeQuad
 * @constructor
 */
export class MyUnitCubeQuad extends CGFobject {
  constructor(scene, top = null, front = null, right = null, back = null, left = null, bottom = null) {
    super(scene);

    //Initialize scene objects
    this.quad = new MyQuad(scene);
    this.top = top;
    this.front = front;
    this.right = right;
    this.back = back;
    this.left = left;
    this.bottom = bottom;
  }

  display() {

    //face da frente (z = 0.5)
    this.scene.pushMatrix();
    if (this.front) {
      this.front.bind();
    }
    this.scene.translate(0, 0, 0.5);
    this.quad.display();
    this.scene.popMatrix();

    //face de trás (z = -0.5)
    this.scene.pushMatrix();
    if (this.back) {
      this.back.bind();
    }
    this.scene.translate(0, 0, -0.5);
    this.scene.rotate(Math.PI, 0, 1, 0);
    this.quad.display();
    this.scene.popMatrix();

    //face de baixo (y = -0.5)
    this.scene.pushMatrix();
    if (this.bottom) {
      this.bottom.bind();
    }
    this.scene.translate(0, -0.5, 0);
    this.scene.rotate(Math.PI / 2, 1.0, 0.0, 0.0);
    this.quad.display();
    this.scene.popMatrix();

    //face da esquerda (x = -0.5)
    this.scene.pushMatrix();
    if (this.left) {
      this.left.bind();
    }
    this.scene.translate(-0.5, 0, 0);
    this.scene.rotate(Math.PI / 2, 0.0, 1.0, 0.0);
    this.quad.display();
    this.scene.popMatrix();

    //face da direita (x = 0.5)
    this.scene.pushMatrix();
    if (this.right) {
      this.right.bind();
    }
    this.scene.translate(0.5, 0, 0);
    this.scene.rotate(-Math.PI / 2, 0.0, 1.0, 0.0);
    this.quad.display();
    this.scene.popMatrix();

    //face de cima (y = 0.5)
    this.scene.pushMatrix();
    if (this.top) {
      this.top.bind();
    }
    this.scene.translate(0, 0.5, 0);
    this.scene.rotate(-Math.PI / 2, 1.0, 0.0, 0.0);
    this.quad.display();
    this.scene.popMatrix();

  }
}