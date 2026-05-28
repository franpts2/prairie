import { CGFobject, CGFappearance } from '../../../lib/CGF.js';
import { MyUnitCube } from '../../shapes/MyUnitCube.js';
import { MyPrism } from '../../shapes/MyPrism.js';

export class MyBarnCentral extends CGFobject {
    constructor(scene) {
        super(scene);
        
        this.walls = new MyUnitCube(scene, 4, 3, 5);
        this.roof = new MyPrism(scene, 4, 2, 5);

        this.woodAppearance = new CGFappearance(scene);
        this.woodAppearance.setAmbient(0.5, 0.15, 0.15, 1.0);
        this.woodAppearance.setDiffuse(0.7, 0.2, 0.2, 1.0);
        this.woodAppearance.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.woodAppearance.setShininess(5.0);
        this.woodAppearance.setTexture(scene.assetManager.getTexture('wood'));
        this.woodAppearance.setTextureWrap('REPEAT', 'REPEAT');

        this.darkWoodAppearance = new CGFappearance(scene);
        this.darkWoodAppearance.setAmbient(0.15, 0.08, 0.04, 1.0);
        this.darkWoodAppearance.setDiffuse(0.25, 0.15, 0.08, 1.0);
        this.darkWoodAppearance.setSpecular(0.05, 0.05, 0.05, 1.0);
        this.darkWoodAppearance.setShininess(2.0);
        this.darkWoodAppearance.setTexture(scene.assetManager.getTexture('wood'));
        this.darkWoodAppearance.setTextureWrap('REPEAT', 'REPEAT');
    }

    display() {
        // Main Central Walls
        this.scene.pushMatrix();
        this.scene.translate(0, 4.25, 0);
        this.scene.scale(6, 8.5, 12);
        this.woodAppearance.apply();
        this.walls.display();
        this.scene.popMatrix();

        // Main Central Roof
        this.scene.pushMatrix();
        this.scene.translate(0, 8.5, 0);
        this.scene.scale(6.6, 3.0, 12.4);
        this.darkWoodAppearance.apply();
        this.roof.display();
        this.scene.popMatrix();
    }
}
