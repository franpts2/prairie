import { CGFtexture } from "../../lib/CGF.js";

/**
 * Loading of textures and image data to avoid redundant requests
 */
export class AssetManager {
    constructor(scene) {
        this.scene = scene;
        this.textures = {};
        this.pixelData = {};
        this.isReady = false;

        this.texturePaths = {
            sky: "./assets/textures/sky.jpeg",
            cloud: "./assets/textures/clouds.png",
            soil: "./assets/textures/soil.jpg",
            pathSoil: "./assets/textures/pathsoil.png",
            terrainMap: "./assets/textures/terrainmap.png",
            pathMap: "./assets/textures/pathmap.png",
            grass: "./assets/textures/grass/grass.png",
            deadGrass: "./assets/textures/grass/deadgrass.png",
            rock1: "./assets/textures/rocks/rock1.png",
            rock2: "./assets/textures/rocks/rock2.png",
            rock3: "./assets/textures/rocks/rock3.png",
            rock4: "./assets/textures/rocks/rock4.png",
            wood: "./assets/textures/wood.png",
            leaves: "./assets/textures/leaves.png",
            barnDoor: "./assets/textures/barn/barndoor.png",
            barnWindow: "./assets/textures/barn/barnwindow.png",
            hay: "./assets/textures/hay.png",
            horse: "./assets/models/horse/Baked_BaseColor.png",
            waterTex: "./assets/textures/waterTex.jpg",
            waterMap: "./assets/textures/waterMap.jpg"
        };
    }

    /**
     * Loads all textures and extracts pixel data for maps.
     * Returns a promise that resolves when everything is loaded.
     */
    async load() {

        // init all CGFtextures immediately
        // CGFtexture internally starts loading, but we can reuse the same object
        for (const [key, path] of Object.entries(this.texturePaths)) {
            this.textures[key] = new CGFtexture(this.scene, path);
        }

        // load images that we need pixel data from
        const mapsToLoad = [
            { key: 'terrain', path: this.texturePaths.terrainMap },
            { key: 'path', path: this.texturePaths.pathMap }
        ];

        const loadPromises = mapsToLoad.map(map => this.loadPixelData(map.key, map.path));
        await Promise.all(loadPromises);

        this.isReady = true;
        return this;
    }

    /**
     * helper to load an image and extract its pixel data
     */
    loadPixelData(key, path) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, img.width, img.height);

                this.pixelData[key] = {
                    data: imageData.data,
                    width: img.width,
                    height: img.height
                };
                resolve();
            };
            img.src = path;
        });
    }

    getTexture(key) {
        return this.textures[key];
    }

    getPixelData(key) {
        return this.pixelData[key];
    }
}
