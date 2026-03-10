import {CGFobject} from '../lib/CGF.js';
/**
 * MyUnitCube
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyUnitCube extends CGFobject {
	constructor(scene) {
		super(scene);
        this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [
			0.5, 0, 0.5,	//0 
			0.5, 0, -0.5,	//1 
			-0.5, 0, -0.5,	//2
            -0.5, 0, 0.5,   //3
            0.5, 1, 0.5,	//4
			0.5, 1, -0.5,	//5
			-0.5, 1, -0.5,	//6
            -0.5, 1, 0.5,   //7
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 5,
            0, 5, 4,
            5, 1, 0,
            4, 5, 0, // face x>0

            3, 2, 6,
            3, 6, 7,
            6, 2, 3,
            7, 6, 3, // face x<0

            3, 0, 4,
            3, 4, 7,
            4, 0, 3,
            7, 4, 3, // face y>0

            2, 1, 5,
            2, 5, 6,
            5, 1, 2,
            6, 5, 2, // face y<0

            0, 1, 2,
            0, 2, 3,
            2, 1, 0,
            3, 2, 0, // face z>0

            4, 5, 6,
            4, 6, 7,
            6, 5, 4,
            7, 6, 4, // face z<0
		];

        this.normals = [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
        ];
        

		//The defined indices (and corresponding vertices)
		//will be read in groups of three to draw triangles
		this.primitiveType = this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	}
}

