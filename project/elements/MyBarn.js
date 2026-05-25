import { CGFobject, CGFappearance } from '../../lib/CGF.js';
import { MyUnitCube } from '../shapes/MyUnitCube.js';
import { MyPrism } from '../shapes/MyPrism.js';
import { MyPlane } from '../shapes/MyPlane.js';

export class MyBarn extends CGFobject {
    constructor(scene, x = 20, z = -20) {
        super(scene);
        this.x = x;
        this.z = z;
        this.y = 0;
        
        this.width = 10;
        this.height = 8;
        this.length = 12;
        this.roofHeight = 4;

        this.walls = new MyUnitCube(scene, 4, 3, 5);
        this.roof = new MyPrism(scene, 4, 2, 5);
        this.quad = new MyPlane(scene);

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

        this.doorAppearance = new CGFappearance(scene);
        this.doorAppearance.setAmbient(0.4, 0.4, 0.4, 1.0);
        this.doorAppearance.setDiffuse(0.8, 0.8, 0.8, 1.0);
        this.doorAppearance.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.doorAppearance.setShininess(5.0);
        this.doorAppearance.setTexture(scene.assetManager.getTexture('barnDoor'));
        this.doorAppearance.setTextureWrap('CLAMP_TO_EDGE', 'CLAMP_TO_EDGE');

        this.windowAppearance = new CGFappearance(scene);
        this.windowAppearance.setAmbient(0.5, 0.5, 0.5, 1.0);
        this.windowAppearance.setDiffuse(0.9, 0.9, 0.9, 1.0);
        this.windowAppearance.setSpecular(0.6, 0.6, 0.6, 1.0);
        this.windowAppearance.setShininess(30.0);
        this.windowAppearance.setTexture(scene.assetManager.getTexture('barnWindow'));
        this.windowAppearance.setTextureWrap('CLAMP_TO_EDGE', 'CLAMP_TO_EDGE');
    }

    display() {
        if (this.scene.ground && this.y === 0) {
            this.y = this.scene.ground.getHeight(this.x, this.z);
        }

        const zFightOffset = 0.015;

        this.scene.pushMatrix();
        this.scene.translate(this.x, this.y + this.height / 2, this.z);
        this.scene.scale(this.width, this.height, this.length);
        this.woodAppearance.apply();
        this.walls.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(this.x, this.y + this.height, this.z);
        this.scene.scale(this.width + 0.6, this.roofHeight, this.length + 0.4);
        this.darkWoodAppearance.apply();
        this.roof.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(this.x, this.y + 2.25, this.z + this.length / 2 + zFightOffset);
        this.scene.scale(4, 4.5, 1);
        this.doorAppearance.apply();
        this.quad.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(this.x, this.y + this.height + 1.8, this.z + this.length / 2 + zFightOffset);
        this.scene.scale(1.8, 1.8, 1);
        this.windowAppearance.apply();
        this.quad.display();
        this.scene.popMatrix();

        const leftWindowZs = [this.z - 3, this.z + 3];
        for (const wZ of leftWindowZs) {
            this.scene.pushMatrix();
            this.scene.translate(this.x + this.width / 2 + zFightOffset, this.y + 4.5, wZ);
            this.scene.rotate(Math.PI / 2, 0, 1, 0);
            this.scene.scale(2, 2, 1);
            this.windowAppearance.apply();
            this.quad.display();
            this.scene.popMatrix();
        }

        const rightWindowZs = [this.z - 3, this.z + 3];
        for (const wZ of rightWindowZs) {
            this.scene.pushMatrix();
            this.scene.translate(this.x - this.width / 2 - zFightOffset, this.y + 4.5, wZ);
            this.scene.rotate(-Math.PI / 2, 0, 1, 0);
            this.scene.scale(2, 2, 1);
            this.windowAppearance.apply();
            this.quad.display();
            this.scene.popMatrix();
        }
    }
}
