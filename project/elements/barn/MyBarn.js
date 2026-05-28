import { CGFobject } from '../../../lib/CGF.js';
import { CollisionSphere } from '../../utils/CollisionSphere.js';

import { MyBarnCentral } from './MyBarnCentral.js';
import { MyBarnWing } from './MyBarnWing.js';
import { MyBarnDoor } from './MyBarnDoor.js';
import { MyBarnWindows } from './MyBarnWindows.js';

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

        this.centralStructure = new MyBarnCentral(scene);
        this.leftWing = new MyBarnWing(scene, true);
        this.rightWing = new MyBarnWing(scene, false);
        this.door = new MyBarnDoor(scene);
        this.windows = new MyBarnWindows(scene);

        this.collider = new CollisionSphere(this.x, this.y, this.z, 13.0);
    }

    display() {
        if (this.scene.ground && this.y === 0) {
            this.y = this.scene.ground.getHeight(this.x, this.z);
            if (this.collider) {
                this.collider.setPosition(this.x, this.y, this.z);
            }
        }

        this.scene.pushMatrix();
        this.scene.translate(this.x, this.y, this.z);
        this.scene.scale(2, 2, 2);

        this.centralStructure.display();
        this.leftWing.display();
        this.rightWing.display();
        this.door.display();
        this.windows.display();

        this.scene.popMatrix();
    }
}
