import { CGFobject, CGFappearance } from "../lib/CGF.js";
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

    this.initMaterials();
  }

  initMaterials() {
          // Yellow
          this.yellowMaterial = new CGFappearance(this.scene);
          this.yellowMaterial.setAmbient(1.0, 1.0, 0, 1.0);
          this.yellowMaterial.setDiffuse(1.0, 1.0, 0, 1.0);
          this.yellowMaterial.setSpecular(1, 1, 1, 1.0);
          this.yellowMaterial.setShininess(10.0);
  
          // Green
          this.greenMaterial = new CGFappearance(this.scene);
          this.greenMaterial.setAmbient(0, 1.0, 0, 1.0);
          this.greenMaterial.setDiffuse(0, 1.0, 0, 1.0);
          this.greenMaterial.setSpecular(1, 1, 1, 1.0);
          this.greenMaterial.setShininess(10.0);
  
          // Pink
          this.pinkMaterial = new CGFappearance(this.scene);
          this.pinkMaterial.setAmbient(1.0, 0.612, 0.824, 1.0);
          this.pinkMaterial.setDiffuse(1.0, 0.612, 0.824, 1.0);
          this.pinkMaterial.setSpecular(1, 1, 1, 1.0);
          this.pinkMaterial.setShininess(10.0);
  
          // Orange
          this.orangeMaterial = new CGFappearance(this.scene);
          this.orangeMaterial.setAmbient(1.0, 0.611, 0, 1.0);
          this.orangeMaterial.setDiffuse(1.0, 0.611, 0, 1.0);
          this.orangeMaterial.setSpecular(1, 1, 1, 1.0);
          this.orangeMaterial.setShininess(10.0);

          // Red
          this.redMaterial = new CGFappearance(this.scene);
          this.redMaterial.setAmbient(1.0, 0, 0, 1.0);
          this.redMaterial.setDiffuse(1.0, 0, 0, 1.0);
          this.redMaterial.setSpecular(1, 1, 1, 1.0);
          this.redMaterial.setShininess(10.0);

          // Purple
          this.purpleMaterial = new CGFappearance(this.scene);
          this.purpleMaterial.setAmbient(0.663, 0.309, 0.757, 1.0);
          this.purpleMaterial.setDiffuse(0.663, 0.309, 0.757, 1.0);
          this.purpleMaterial.setSpecular(1, 1, 1, 1.0);
          this.purpleMaterial.setShininess(10.0);

          // Blue
          this.blueMaterial = new CGFappearance(this.scene);
          this.blueMaterial.setAmbient(0, 0.611, 1.0, 1.0);
          this.blueMaterial.setDiffuse(0, 0.611, 1.0, 1.0);
          this.blueMaterial.setSpecular(1, 1, 1, 1.0);
          this.blueMaterial.setShininess(10.0);
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
    this.greenMaterial.apply(); 
    this.diamond.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(0.0, 2.8, 0.0);
    this.scene.rotate(Math.PI, 0.0, 1.0, 0.0);
    this.scene.rotate((Math.PI/4 + 0.46365), 0.0, 0.0, 1.0);
    this.yellowMaterial.apply();
    this.parallelogram.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(0.0, 1.4, 0.0);
    this.scene.rotate(Math.PI/4, 0.0, 0.0, 1.0);
    this.pinkMaterial.apply();
    this.pinkTriangle.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(-1.0,-1.0,0.0);
    this.scene.rotate(-Math.PI/2,0.0,0.0,1.0);
    this.orangeMaterial.apply();
    this.orangeTriangle.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(0.0,-4,0.0);
    this.blueMaterial.apply();
    this.blueTriangle.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(1.0,0.0,0.0);
    this.scene.rotate(Math.PI/2,0.0,0.0,1.0);
    this.redMaterial.apply();
    this.redTriangle.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(1.0,-2,0.0);
    this.scene.rotate(Math.PI/2,0.0,0.0,1.0);
    this.purpleMaterial.apply();
    this.purpleTriangle.display();
    this.scene.popMatrix();
    // ---- END Primitive drawing section
  }

  enableNormalViz() {
    this.parallelogram.enableNormalViz();
    this.diamond.enableNormalViz();
    this.pinkTriangle.enableNormalViz();
    this.orangeTriangle.enableNormalViz();
    this.blueTriangle.enableNormalViz();
    this.redTriangle.enableNormalViz();
    this.purpleTriangle.enableNormalViz();
  }

  disableNormalViz() {
    this.parallelogram.disableNormalViz();
    this.diamond.disableNormalViz();
    this.pinkTriangle.disableNormalViz();
    this.orangeTriangle.disableNormalViz();
    this.blueTriangle.disableNormalViz();
    this.redTriangle.disableNormalViz();
    this.purpleTriangle.disableNormalViz();
  }
}