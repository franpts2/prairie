import { CGFobject, CGFappearance } from '../../lib/CGF.js';
import { MyCylinder } from '../shapes/MyCylinder.js';

export class MyDelimitedArea extends CGFobject {
    constructor(scene, x = 20, z = -2, radius = 6) {
        super(scene);
        this.x = x;
        this.z = z;
        this.y = 0;
        this.radius = radius;
        this.isIntersecting = false;

        this.disk = new MyCylinder(scene, 48, 1, true);

        this.inactiveAppearance = new CGFappearance(scene);
        this.inactiveAppearance.setAmbient(0.4, 0.4, 0.4, 1.0);
        this.inactiveAppearance.setDiffuse(0.8, 0.8, 0.8, 1.0);
        this.inactiveAppearance.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.inactiveAppearance.setShininess(5.0);
        this.inactiveAppearance.setTexture(scene.assetManager.getTexture('circleInactive'));
        this.inactiveAppearance.setTextureWrap('CLAMP_TO_EDGE', 'CLAMP_TO_EDGE');

        this.activeAppearance = new CGFappearance(scene);
        this.activeAppearance.setAmbient(0.6, 0.9, 0.6, 1.0);
        this.activeAppearance.setDiffuse(0.8, 1.0, 0.8, 1.0);
        this.activeAppearance.setSpecular(0.3, 0.3, 0.3, 1.0);
        this.activeAppearance.setShininess(10.0);
        this.activeAppearance.setTexture(scene.assetManager.getTexture('circleActive'));
        this.activeAppearance.setTextureWrap('CLAMP_TO_EDGE', 'CLAMP_TO_EDGE');
    }

    update(wagon) {
        if (!wagon) return;
        const dx = wagon.x - this.x;
        const dz = wagon.z - this.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        this.isIntersecting = dist < (this.radius + 3.5);
    }

    display() {
        if (this.scene.ground && this.y === 0) {
            this.y = this.scene.ground.getHeight(this.x, this.z);
        }

        this.scene.pushMatrix();
        this.scene.translate(this.x, this.y + 0.03, this.z);
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.scene.scale(this.radius, this.radius, 0.05);

        if (this.isIntersecting) {
            this.activeAppearance.apply();
        } else {
            this.inactiveAppearance.apply();
        }
        
        this.disk.display();
        this.scene.popMatrix();
    }
}
