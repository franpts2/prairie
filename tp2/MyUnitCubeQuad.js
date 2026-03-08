import { CGFobject } from "../lib/CGF.js";
import { MyQuad } from "./MyQuad.js";

/**
 * MyUnitCubeQuad
 * @constructor
 */
export class MyUnitCubeQuad extends CGFobject {
  constructor(scene) {
    super(scene);
    
    //Initialize scene objects
    this.quad = new MyQuad(scene);
  }

  display() {

    //face da frente
    this.scene.pushMatrix();
    this.scene.translate(0, 0, 12.0);
    this.scene.scale(12, 12, 12);
    this.scene.translate(0.5, -0.5, 0);
    this.quad.display();
    this.scene.popMatrix();

    //face de trás
    this.scene.pushMatrix();
    this.scene.scale(12, 12, 12);
    this.scene.translate(0.5, -0.5, 0);
    this.quad.display();
    this.scene.popMatrix();

    //face de baixo
    this.scene.pushMatrix();
    this.scene.translate(0, -12, 0);
    this.scene.scale(12, 12, 12);
    this.scene.translate(0.5, 0, 0.5);
    this.scene.rotate(Math.PI/2, 1.0, 0.0, 0.0);
    this.quad.display();
    this.scene.popMatrix();

    //face da esquerda
    this.scene.pushMatrix();
    this.scene.scale(12, 12, 12);
    this.scene.translate(0, -0.5, 0.5);
    this.scene.rotate(Math.PI/2, 0.0, 0.0, 1.0);
    this.scene.rotate(Math.PI/2, 1.0, 0.0, 0.0);
    this.quad.display();
    this.scene.popMatrix();

    //face da direita
    this.scene.pushMatrix();
    this.scene.translate(12, 0, 0);
    this.scene.scale(12, 12, 12);
    this.scene.translate(0, -0.5, 0.5);
    this.scene.rotate(Math.PI/2, 0.0, 0.0, 1.0);
    this.scene.rotate(Math.PI/2, 1.0, 0.0, 0.0);
    this.quad.display();
    this.scene.popMatrix();

    //face de cima
    this.scene.pushMatrix();
    this.scene.scale(12, 12, 12);
    this.scene.translate(0.5, 0, 0.5);
    this.scene.rotate(Math.PI/2, 1.0, 0.0, 0.0);
    this.quad.display();
    this.scene.popMatrix();

  }
}