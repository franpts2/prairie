attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform sampler2D uSampler2;
uniform float baseHeight;
uniform float heightScale;
uniform float heightTexel;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying float vHeight;

float terrainHeight(vec2 uv) {
  return baseHeight + texture2D(uSampler2, uv).r * heightScale;
}

void main() {
  vec2 uv = clamp(aTextureCoord, 0.0, 1.0);
  float height = terrainHeight(uv);

  float left = terrainHeight(clamp(uv + vec2(-heightTexel, 0.0), 0.0, 1.0));
  float right = terrainHeight(clamp(uv + vec2(heightTexel, 0.0), 0.0, 1.0));
  float down = terrainHeight(clamp(uv + vec2(0.0, -heightTexel), 0.0, 1.0));
  float up = terrainHeight(clamp(uv + vec2(0.0, heightTexel), 0.0, 1.0));

  vec3 displacedPosition = aVertexPosition + aVertexNormal * height;
  vec3 terrainNormal = normalize(vec3(left - right, 2.0, down - up));

  vTextureCoord = aTextureCoord;
  vNormal = normalize((uNMatrix * vec4(terrainNormal, 0.0)).xyz);
  vHeight = texture2D(uSampler2, uv).r;

  gl_Position = uPMatrix * uMVMatrix * vec4(displacedPosition, 1.0);
}
