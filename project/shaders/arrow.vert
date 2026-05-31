attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform float uTime;
uniform float uPulseSpeed;
uniform float uPulseStrength;
uniform float uBobSpeed;
uniform float uBobStrength;
uniform float uBobPhase;

varying vec3 vNormal;
varying float vLocalZ;

void main() {
    vNormal = normalize((uNMatrix * vec4(aVertexNormal, 0.0)).xyz);
    vLocalZ = aVertexPosition.z;

    // Breathing effect (pulsing scale on X and Y)
    float pulse = 1.0 + sin(uTime * uPulseSpeed) * uPulseStrength;
    vec3 displacedPosition = aVertexPosition;
    displacedPosition.x *= pulse;
    displacedPosition.y *= pulse;

    // Bobbing effect along local Z axis (which is rotated vertically)
    float bobOffset = sin(uTime * uBobSpeed + uBobPhase) * uBobStrength;
    displacedPosition.z += bobOffset;

    gl_Position = uPMatrix * uMVMatrix * vec4(displacedPosition, 1.0);
}
