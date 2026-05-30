import { CGFinterface, dat } from '../lib/CGF.js';

/**
* MyInterface
* @constructor
*/
export class MyInterface extends CGFinterface {
    constructor() {
        super();
    }

    init(application) {
        // call CGFinterface init
        super.init(application);

        // init GUI. For more information on the methods, check:
        // https://github.com/dataarts/dat.gui/blob/master/API.md
        this.gui = new dat.GUI();

        //Checkbox element in GUI
        this.gui.add(this.scene, 'displayAxis').name('Display Axis');
        this.gui.add(this.scene, 'displayLight0').name('Sun Light');

        //Slider element in GUI
        this.gui.add(this.scene, 'scaleFactor', 0.1, 5).name('Scale Factor');

        // Game Stats Folder
        const gameFolder = this.gui.addFolder("Game Stats");
        const c1 = gameFolder.add(this.scene.gameController, 'hp', 0, 200).name('Health Points').listen();
        const c2 = gameFolder.add(this.scene.gameController, 'lastDamage', 0, 15).name('Instant. Damage').listen();
        const c3 = gameFolder.add(this.scene.gameController, 'lastHeal', 0, 100).name('Instant. Health Restore').listen();
        const c4 = gameFolder.add(this.scene.gameController, 'balesDelivered').name('Bales Delivered').listen();
        const c5 = gameFolder.add(this.scene.gameController, 'score').name('Score (Time)').listen();

        // make statistics read-only using CSS pointer-events
        [c1, c2, c3, c4, c5].forEach(c => {
            c.domElement.style.pointerEvents = 'none';
        });

        gameFolder.open();

        // init keyboard keys
        this.initKeys();

        return true;
    }

    initKeys() {
        this.scene.gui = this;
        this.processKeyboard = function () { };
        this.activeKeys = {};
    }

    processKeyDown(event) {
        this.activeKeys[event.code] = true;
    }

    processKeyUp(event) {
        this.activeKeys[event.code] = false;
    }

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
}