attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform float timeFactor;

varying vec2 vTextureCoord;
varying float vWave;

void main() {
	float waveX = sin(aVertexPosition.x * 4.0 + timeFactor * 0.15);
	float waveZ = cos(aVertexPosition.z * 3.0 + timeFactor * 0.11);
	vWave = 0.5 * (waveX + waveZ);

	vec3 displacedPosition = aVertexPosition + aVertexNormal * (vWave * 0.06);

	vTextureCoord = aTextureCoord;
	gl_Position = uPMatrix * uMVMatrix * vec4(displacedPosition, 1.0);

}

