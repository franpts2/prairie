import { CGFobject } from "../lib/CGF.js";
import { MyDiamond } from "./MyDiamond.js";
import { MyTriangle } from "./MyTriangle.js";
import { MyParallelogram } from "./MyParallelogram.js";
import { MyTriangleSmall } from "./MyTriangleSmall.js";
import { MyTriangleBig } from "./MyTriangleBig.js";

/**
 * MyTangram
 * @constructor
 */
export class MyTangram extends CGFobject {
  constructor(scene) {
    super(scene);
    
    //Initialize scene objects
    this.parallelogram = new MyParallelogram(scene);
    this.diamond = new MyDiamond(scene);
    this.pinkTriangle = new MyTriangle(scene);
    this.orangeTriangle = new MyTriangleBig(scene);
    this.blueTriangle = new MyTriangleBig(scene);
    this.redTriangle = new MyTriangleSmall(scene);
    this.purpleTriangle = new MyTriangleSmall(scene);
  }

  display() {

    var rot = [
      Math.cos(Math.PI/4),
      Math.sin(Math.PI/4),
      0.0,
      0.0,
      
      -Math.sin(Math.PI/4),
      Math.cos(Math.PI/4),
      0.0,
      0.0,
      
      0.0,
      0.0,
      1.0,
      0.0,

      0.0,
      0.0,
      0.0,
      1.0
    ];

    var trans = [
      1.0,
      0.0,
      0.0,
      0.0,
      
      0.0,
      1.0,
      0.0,
      0.0,
      
      0.0,
      0.0,
      1.0,
      0.0,

      0.0,
      2.1,
      0.0,
      1.0
    ];

    // ---- BEGIN Primitive drawing section
    this.scene.pushMatrix();
    this.scene.multMatrix(trans);
    this.scene.multMatrix(rot);    
    this.diamond.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(0.0, 2.8, 0.0);
    this.scene.rotate(Math.PI, 0.0, 1.0, 0.0);
    this.scene.rotate((Math.PI/4 + 0.46365), 0.0, 0.0, 1.0);
    this.parallelogram.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(0.0, 1.4, 0.0);
    this.scene.rotate(Math.PI/4, 0.0, 0.0, 1.0);
    this.pinkTriangle.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(-1.0,-1.0,0.0);
    this.scene.rotate(-Math.PI/2,0.0,0.0,1.0);
    this.orangeTriangle.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(0.0,-4,0.0);
    this.blueTriangle.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(1.0,0.0,0.0);
    this.scene.rotate(Math.PI/2,0.0,0.0,1.0);
    this.redTriangle.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(1.0,0.-2,0.0);
    this.scene.rotate(Math.PI/2,0.0,0.0,1.0);
    this.purpleTriangle.display();
    this.scene.popMatrix();
    // ---- END Primitive drawing section
  }
}