import { CGFobject, CGFappearance } from '../../lib/CGF.js';
import { MyUnitCube } from '../shapes/MyUnitCube.js';
import { MyPrism } from '../shapes/MyPrism.js';
import { MyPlane } from '../shapes/MyPlane.js';
import { CollisionSphere } from '../utils/CollisionSphere.js';

export class MyBarn extends CGFobject {
    constructor(scene, x = 20, z = -20) {
        super(scene);
        this.x = x;
        this.z = z;
        
        if (scene.ground) {
            this.y = scene.ground.getHeight(this.x, this.z);
        } else {
            this.y = 0;
        }

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

        this.collider = new CollisionSphere(this.x, this.y, this.z, 15.0);
    }

    display() {
        if (this.scene.ground && this.y === 0) {
            this.y = this.scene.ground.getHeight(this.x, this.z);
            if (this.collider) {
                this.collider.setPosition(this.x, this.y, this.z);
            }
        }

        const zFightOffset = 0.015;

        this.scene.pushMatrix();
        this.scene.translate(this.x, this.y, this.z);
        this.scene.scale(2, 2, 2);

        this.scene.pushMatrix();
        this.scene.translate(0, 4.25, 0);
        this.scene.scale(6, 8.5, 12);
        this.woodAppearance.apply();
        this.walls.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0, 8.5, 0);
        this.scene.scale(6.6, 3.0, 12.4);
        this.darkWoodAppearance.apply();
        this.roof.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(-4.5, 2.5, 0);
        this.scene.scale(3, 5.0, 12);
        this.woodAppearance.apply();
        this.walls.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(-3, 5.0, 0);
        this.scene.scale(6, 1.5, 12);
        this.woodAppearance.apply();
        this.roof.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(-4.5, 5.75, 0);
        this.scene.rotate(0.4636, 0, 0, 1);
        this.scene.scale(3.6, 0.15, 12.4);
        this.darkWoodAppearance.apply();
        this.walls.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(4.5, 2.5, 0);
        this.scene.scale(3, 5.0, 12);
        this.woodAppearance.apply();
        this.walls.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(3, 5.0, 0);
        this.scene.scale(6, 1.5, 12);
        this.woodAppearance.apply();
        this.roof.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(4.5, 5.75, 0);
        this.scene.rotate(-0.4636, 0, 0, 1);
        this.scene.scale(3.6, 0.15, 12.4);
        this.darkWoodAppearance.apply();
        this.walls.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0, 2.25, 6.0 + zFightOffset);
        this.scene.scale(4, 4.5, 1);
        this.doorAppearance.apply();
        this.quad.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0, 9.5, 6.0 + zFightOffset);
        this.scene.scale(1.4, 1.4, 1);
        this.windowAppearance.apply();
        this.quad.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0, 6.5, 6.0 + zFightOffset);
        this.scene.scale(1.8, 1.8, 1);
        this.windowAppearance.apply();
        this.quad.display();
        this.scene.popMatrix();

        const frontWingXs = [-4.5, 4.5];
        for (const wX of frontWingXs) {
            this.scene.pushMatrix();
            this.scene.translate(wX, 2.5, 6.0 + zFightOffset);
            this.scene.scale(1.6, 1.6, 1);
            this.windowAppearance.apply();
            this.quad.display();
            this.scene.popMatrix();
        }

        const sideWindowZs = [-3, 3];
        for (const wZ of sideWindowZs) {
            this.scene.pushMatrix();
            this.scene.translate(-6.0 - zFightOffset, 2.5, wZ);
            this.scene.rotate(-Math.PI / 2, 0, 1, 0);
            this.scene.scale(2, 2, 1);
            this.windowAppearance.apply();
            this.quad.display();
            this.scene.popMatrix();
        }

        for (const wZ of sideWindowZs) {
            this.scene.pushMatrix();
            this.scene.translate(6.0 + zFightOffset, 2.5, wZ);
            this.scene.rotate(Math.PI / 2, 0, 1, 0);
            this.scene.scale(2, 2, 1);
            this.windowAppearance.apply();
            this.quad.display();
            this.scene.popMatrix();
        }

        this.scene.pushMatrix();
        this.scene.translate(0, 9.5, -6.0 - zFightOffset);
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.scene.scale(1.4, 1.4, 1);
        this.windowAppearance.apply();
        this.quad.display();
        this.scene.popMatrix();

        const backWingXs = [-4.5, 4.5];
        for (const wX of backWingXs) {
            this.scene.pushMatrix();
            this.scene.translate(wX, 2.5, -6.0 - zFightOffset);
            this.scene.rotate(Math.PI, 0, 1, 0);
            this.scene.scale(1.6, 1.6, 1);
            this.windowAppearance.apply();
            this.quad.display();
            this.scene.popMatrix();
        }

        for (const wZ of sideWindowZs) {
            this.scene.pushMatrix();
            this.scene.translate(-3.0 - zFightOffset, 7.5, wZ);
            this.scene.rotate(-Math.PI / 2, 0, 1, 0);
            this.scene.scale(1.2, 1.2, 1);
            this.windowAppearance.apply();
            this.quad.display();
            this.scene.popMatrix();
        }

        for (const wZ of sideWindowZs) {
            this.scene.pushMatrix();
            this.scene.translate(3.0 + zFightOffset, 7.5, wZ);
            this.scene.rotate(Math.PI / 2, 0, 1, 0);
            this.scene.scale(1.2, 1.2, 1);
            this.windowAppearance.apply();
            this.quad.display();
            this.scene.popMatrix();
        }

        this.scene.popMatrix();
    }
}
