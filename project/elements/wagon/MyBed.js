import { CGFobject } from '../../../lib/CGF.js';
import { MyUnitCube } from '../../shapes/MyUnitCube.js';

export class MyBed extends CGFobject {
    constructor(scene, woodAppearance, metalAppearance) {
        super(scene);
        
        // --- Tiled Cube Instances ---
        this.baseCube = new MyUnitCube(scene, 3.4, 0.2, 7);         // base: 3.4 x 0.2 x 7
        this.plankFB = new MyUnitCube(scene, 3.4, 0.45, 0.1);       // horizontal plank: 3.4 x 0.45 x 0.1
        this.plankLR = new MyUnitCube(scene, 0.1, 0.45, 7);         // horizontal plank side: 0.1 x 0.45 x 7
        this.verticalBeam = new MyUnitCube(scene, 0.12, 2.0, 0.12); // vertical beams: 0.12 x 2.0 x 0.12
        this.attachment = new MyUnitCube(scene, 1, 1, 1);           // small hooks: 0.05 x 0.15 x 0.05

        this.woodAppearance = woodAppearance;
        this.metalAppearance = metalAppearance;
    }

    display() {
        if (this.woodAppearance) this.woodAppearance.apply();

        // --- Base ---
        this.scene.pushMatrix();
        this.scene.scale(3.4, 0.2, 7);
        this.baseCube.display();
        this.scene.popMatrix();

        // --- Walls ---
        const numPlanks = 4;
        const plankHeight = 0.5;
        for (let i = 0; i < numPlanks; i++) {
            const y = 0.35 + i * plankHeight;
            
            // Back Wall planks
            this.scene.pushMatrix();
            this.scene.translate(0, y, 3.45);
            this.scene.scale(3.4, 0.45, 0.1);
            this.plankFB.display();
            this.scene.popMatrix();

            // Front Wall planks
            this.scene.pushMatrix();
            this.scene.translate(0, y, -3.45);
            this.scene.scale(3.4, 0.45, 0.1);
            this.plankFB.display();
            this.scene.popMatrix();

            // Left Wall planks
            this.scene.pushMatrix();
            this.scene.translate(-1.65, y, 0);
            this.scene.scale(0.1, 0.45, 7);
            this.plankLR.display();
            this.scene.popMatrix();

            // Right Wall planks
            this.scene.pushMatrix();
            this.scene.translate(1.65, y, 0);
            this.scene.scale(0.1, 0.45, 7);
            this.plankLR.display();
            this.scene.popMatrix();
        }

        // --- Vertical Reinforcing Beams ---
        const beamPositionsZ = [-3.45, -1.7, 0, 1.7, 3.45];
        for (let z of beamPositionsZ) {
            // Left beams
            this.scene.pushMatrix();
            this.scene.translate(-1.72, 1.1, z);
            this.scene.scale(0.12, 1.95, 0.12);
            this.verticalBeam.display();
            this.scene.popMatrix();

            // Right beams
            this.scene.pushMatrix();
            this.scene.translate(1.72, 1.1, z);
            this.scene.scale(0.12, 1.95, 0.12);
            this.verticalBeam.display();
            this.scene.popMatrix();
        }

        // --- Cover Attachments (Hooks) ---
        if (this.metalAppearance) this.metalAppearance.apply();
        const numArches = 4;
        const archSpacing = 3.5 / (numArches - 1);
        for (let i = 0; i < numArches; i++) {
            const z = -i * archSpacing;
            // Left hooks
            this.scene.pushMatrix();
            this.scene.translate(-1.76, 2.05, z); // positioned at the top edge
            this.scene.scale(0.04, 0.3, 0.08);    // mjade taller to bridge the gap
            this.attachment.display();
            this.scene.popMatrix();

            // Right hooks
            this.scene.pushMatrix();
            this.scene.translate(1.76, 2.05, z);
            this.scene.scale(0.04, 0.3, 0.08);
            this.attachment.display();
            this.scene.popMatrix();
        }

        this.scene.setDefaultAppearance();
    }
}
