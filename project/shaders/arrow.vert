attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform float uTime;
uniform float uBobSpeed;
uniform float uBobStrength;
uniform float uBobPhase;
uniform float uShapeScale;
uniform float uShapeOffset;

varying vec3 vNormal;
varying float vLocalZ;

void main() {
    vNormal = normalize((uNMatrix * vec4(aVertexNormal, 0.0)).xyz);
    vLocalZ = aVertexPosition.z * uShapeScale + uShapeOffset;

    vec3 displacedPosition = aVertexPosition;

    // bobbing effect along local Z axis
    float bobOffset = sin(uTime * uBobSpeed + uBobPhase) * uBobStrength;
    displacedPosition.z += bobOffset;

    gl_Position = uPMatrix * uMVMatrix * vec4(displacedPosition, 1.0);
}
