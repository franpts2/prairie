import { CGFobject, CGFappearance } from '../../../lib/CGF.js';
import { MyUnitCube } from '../../shapes/MyUnitCube.js';
import { MyPrism } from '../../shapes/MyPrism.js';

export class MyBarnWing extends CGFobject {
    constructor(scene, isLeft) {
        super(scene);
        this.isLeft = isLeft;

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
        const sideSign = this.isLeft ? -1 : 1;

        // Wing wall
        this.scene.pushMatrix();
        this.scene.translate(sideSign * 4.5, 2.5, 0);
        this.scene.scale(3, 5.0, 12);
        this.woodAppearance.apply();
        this.walls.display();
        this.scene.popMatrix();

        // Wing roof
        this.scene.pushMatrix();
        this.scene.translate(sideSign * 3, 5.0, 0);
        this.scene.scale(6, 1.5, 12);
        this.woodAppearance.apply();
        this.roof.display();
        this.scene.popMatrix();

        // Wing roof trim (dark wood)
        this.scene.pushMatrix();
        this.scene.translate(sideSign * 4.5, 5.75, 0);
        this.scene.rotate(-sideSign * 0.4636, 0, 0, 1);
        this.scene.scale(3.6, 0.15, 12.4);
        this.darkWoodAppearance.apply();
        this.walls.display();
        this.scene.popMatrix();
    }
}
