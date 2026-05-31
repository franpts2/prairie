attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform sampler2D uSampler2;
uniform sampler2D uSamplerHeight;
uniform float timeFactor;
uniform float baseHeight;
uniform float heightScale;
uniform float waterHeight;

varying vec2 vTextureCoord;
varying float vWave;

void main() {
	vec2 flow = vec2(timeFactor * 0.0038, -timeFactor * 0.0026);
	vec2 mapUv = aTextureCoord * 0.75 + flow;
	vec2 texel = vec2(0.008, 0.008);

	float h0 = texture2D(uSampler2, mapUv).r;
	float h1 = texture2D(uSampler2, mapUv + vec2(texel.x, 0.0)).r;
	float h2 = texture2D(uSampler2, mapUv - vec2(texel.x, 0.0)).r;
	float h3 = texture2D(uSampler2, mapUv + vec2(0.0, texel.y)).r;
	float h4 = texture2D(uSampler2, mapUv - vec2(0.0, texel.y)).r;
	float h5 = texture2D(uSampler2, mapUv + texel).r;
	float h6 = texture2D(uSampler2, mapUv - texel).r;
	float h7 = texture2D(uSampler2, mapUv + vec2(texel.x, -texel.y)).r;
	float h8 = texture2D(uSampler2, mapUv + vec2(-texel.x, texel.y)).r;

	float height = (h0 * 4.0 + h1 + h2 + h3 + h4 + h5 + h6 + h7 + h8) / 12.0;
	height = smoothstep(0.15, 0.85, height);
	vWave = (height * 2.0 - 1.0) * 0.45;

	float terrainH = baseHeight + texture2D(uSamplerHeight, aTextureCoord).r * heightScale;
	float totalDisplacement = terrainH + waterHeight + (vWave * 0.028);
	vec3 displacedPosition = aVertexPosition + aVertexNormal * totalDisplacement;

	vTextureCoord = aTextureCoord;
	gl_Position = uPMatrix * uMVMatrix * vec4(displacedPosition, 1.0);

}

