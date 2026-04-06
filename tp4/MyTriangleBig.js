import {CGFobject} from '../lib/CGF.js';
/**
 * MyTriangleBig
 * @constructor
 * @param {MyScene} scene - Reference to MyScene object
 * @param {Array} coords - Array of texture coordinates (optional)
 */
export class MyTriangleBig extends CGFobject {
    constructor(scene, coords) {
		super(scene);
		this.initBuffers();
		if (coords != undefined)
			this.updateTexCoords(coords);
	}
    
    initBuffers() {
        this.vertices = [
            -2, 0, 0,	//0
            2, 0, 0,	//1
            0, 2, 0,	//2
        ];

        //Counter-clockwise reference of vertices
        this.indices = [
            0, 1, 2,
            2, 1, 0
        ];

        this.normals = [
            0, 0, 1, //0
            0, 0, 1, //1
            0, 0, 1, //2
        ];

        // Default is the blue
        this.texCoords = [
			0, 0,
			1, 0,
			0.5, 0.5
		]

        //The defined indices (and corresponding vertices)
        //will be read in groups of three to draw triangles
        this.primitiveType = this.scene.gl.TRIANGLES;

        this.initGLBuffers();
    }

    /**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the quad
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(coords) {
		this.texCoords = [...coords];
		this.updateTexCoordsGLBuffers();
	}
}

