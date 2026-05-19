attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform float uTime;
uniform float uWindSpeed;
uniform float uWindStrength;

varying vec2 vTextureCoord;
varying vec3 vNormal;

void main() {
    vTextureCoord = aTextureCoord;
    vNormal = normalize((uNMatrix * vec4(aVertexNormal, 0.0)).xyz);

    // wind simulation
    float swayFactor = 1.0 - aTextureCoord.y;
    
    // combine two sine waves for more natural movement
    float offset = sin(uTime * uWindSpeed + aVertexPosition.x * 0.5 + aVertexPosition.z * 0.5) * uWindStrength;
    offset += sin(uTime * uWindSpeed * 1.5 + aVertexPosition.x * 0.2 + aVertexPosition.z * 0.8) * uWindStrength * 0.4;

    vec3 displacedPosition = aVertexPosition;
    displacedPosition.x += offset * swayFactor;
    displacedPosition.z += offset * 0.6 * swayFactor;

    gl_Position = uPMatrix * uMVMatrix * vec4(displacedPosition, 1.0);
}
