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

    //face da frente
    this.scene.pushMatrix();
    if (this.front) {
      this.scene.setActiveTexture(this.front);
    }
    this.scene.translate(0, 0, 12.0);
    this.scene.scale(12, 12, 12);
    this.scene.translate(0.5, -0.5, 0);
    this.quad.display();
    this.scene.popMatrix();

    //face de trás
    this.scene.pushMatrix();
    if (this.back) {
      this.scene.setActiveTexture(this.back);
    }
    this.scene.scale(12, 12, 12);
    this.scene.translate(0.5, -0.5, 0);
    this.quad.display();
    this.scene.popMatrix();

    //face de baixo
    this.scene.pushMatrix();
    if (this.bottom) {
      this.scene.setActiveTexture(this.bottom);
    }
    this.scene.translate(0, -12, 0);
    this.scene.scale(12, 12, 12);
    this.scene.translate(0.5, 0, 0.5);
    this.scene.rotate(Math.PI / 2, 1.0, 0.0, 0.0);
    this.quad.display();
    this.scene.popMatrix();

    //face da esquerda
    this.scene.pushMatrix();
    if (this.left) {
      this.scene.setActiveTexture(this.left);
    }
    this.scene.scale(12, 12, 12);
    this.scene.translate(0, -0.5, 0.5);
    this.scene.rotate(Math.PI / 2, 0.0, 0.0, 1.0);
    this.scene.rotate(Math.PI / 2, 1.0, 0.0, 0.0);
    this.quad.display();
    this.scene.popMatrix();

    //face da direita
    this.scene.pushMatrix();
    if (this.right) {
      this.scene.setActiveTexture(this.right);
    }
    this.scene.translate(12, 0, 0);
    this.scene.scale(12, 12, 12);
    this.scene.translate(0, -0.5, 0.5);
    this.scene.rotate(Math.PI / 2, 0.0, 0.0, 1.0);
    this.scene.rotate(Math.PI / 2, 1.0, 0.0, 0.0);
    this.quad.display();
    this.scene.popMatrix();

    //face de cima
    this.scene.pushMatrix();
    if (this.top) {
      this.scene.setActiveTexture(this.top);
    }
    this.scene.scale(12, 12, 12);
    this.scene.translate(0.5, 0, 0.5);
    this.scene.rotate(Math.PI / 2, 1.0, 0.0, 0.0);
    this.quad.display();
    this.scene.popMatrix();

  }
}