import { CGFobject } from '../../../lib/CGF.js';
import { TiledCube } from '../../utils/TiledCube.js';

export class MyBed extends CGFobject {
    constructor(scene, woodAppearance, metalAppearance) {
        super(scene);
        
        // --- Tiled Cubes ---
        this.baseCube = new TiledCube(scene, 3.4, 0.2, 7);           // base: 3.4 x 0.2 x 7
        this.plankFB = new TiledCube(scene, 3.4, 0.45, 0.1);         // horizontal plank: 3.4 x 0.45 x 0.1
        this.plankLR = new TiledCube(scene, 0.1, 0.45, 7);           // horizontal plank side: 0.1 x 0.45 x 7
        this.verticalBeam = new TiledCube(scene, 0.12, 1.95, 0.12);  // vertical beams: 0.12 x 1.95 x 0.12
        this.attachment = new TiledCube(scene, 0.04, 0.3, 0.08);     // small hooks: 0.04 x 0.3 x 0.08

        this.woodAppearance = woodAppearance;
        this.metalAppearance = metalAppearance;
    }

    display() {
        if (this.woodAppearance) this.woodAppearance.apply();

        // --- Base ---
        this.baseCube.display(0, 0, 0);

        // --- Walls ---
        const numPlanks = 4;
        const plankHeight = 0.5;
        for (let i = 0; i < numPlanks; i++) {
            const y = 0.35 + i * plankHeight;
            
            // Back Wall planks
            this.plankFB.display(0, y, 3.45);

            // Front Wall planks
            this.plankFB.display(0, y, -3.45);

            // Left Wall planks
            this.plankLR.display(-1.65, y, 0);

            // Right Wall planks
            this.plankLR.display(1.65, y, 0);
        }

        // --- Vertical Reinforcing Beams ---
        const beamPositionsZ = [-3.45, -1.7, 0, 1.7, 3.45];
        for (let z of beamPositionsZ) {
            // Left beams
            this.verticalBeam.display(-1.72, 1.1, z);

            // Right beams
            this.verticalBeam.display(1.72, 1.1, z);
        }

        // --- Cover Attachments (Hooks) ---
        if (this.metalAppearance) this.metalAppearance.apply();
        const numArches = 4;
        const archSpacing = 3.5 / (numArches - 1);
        for (let i = 0; i < numArches; i++) {
            const z = -i * archSpacing;
            // Left hooks
            this.attachment.display(-1.76, 2.05, z);

            // Right hooks
            this.attachment.display(1.76, 2.05, z);
        }

        this.scene.setDefaultAppearance();
    }
}
