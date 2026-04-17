attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform sampler2D uSampler2;
uniform float timeFactor;

varying vec2 vTextureCoord;
varying float vWave;

void main() {
	vec2 flow = vec2(timeFactor * 0.01, -timeFactor * 0.006);
	vec2 mapUv = aTextureCoord * 2.0 + flow;
	float height = texture2D(uSampler2, mapUv).r;
	vWave = height * 2.0 - 1.0;

	vec3 displacedPosition = aVertexPosition + aVertexNormal * (vWave * 0.06);

	vTextureCoord = aTextureCoord;
	gl_Position = uPMatrix * uMVMatrix * vec4(displacedPosition, 1.0);

}

