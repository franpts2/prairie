import { CGFobject, CGFappearance } from '../../lib/CGF.js';
import { MyUnitCube } from '../shapes/MyUnitCube.js';

export class MyBarn extends CGFobject {
    constructor(scene, x = 20, z = -20) {
        super(scene);
        this.x = x;
        this.z = z;
        this.y = 0;
        
        this.width = 10;
        this.height = 8;
        this.length = 12;

        this.walls = new MyUnitCube(scene, 4, 3, 5);

        this.woodAppearance = new CGFappearance(scene);
        this.woodAppearance.setAmbient(0.4, 0.3, 0.2, 1.0);
        this.woodAppearance.setDiffuse(0.7, 0.5, 0.3, 1.0);
        this.woodAppearance.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.woodAppearance.setShininess(5.0);
        this.woodAppearance.setTexture(scene.assetManager.getTexture('wood'));
        this.woodAppearance.setTextureWrap('REPEAT', 'REPEAT');
    }

    display() {
        if (this.scene.ground && this.y === 0) {
            this.y = this.scene.ground.getHeight(this.x, this.z);
        }

        this.scene.pushMatrix();
        this.scene.translate(this.x, this.y + this.height / 2, this.z);
        this.scene.scale(this.width, this.height, this.length);

        this.woodAppearance.apply();
        this.walls.display();
        this.scene.popMatrix();
    }
}
