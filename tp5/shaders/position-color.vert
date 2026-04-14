precision highp float;

varying vec4 vPosition;

void main() {
    // final vertice pos
    gl_Position = projectionMatrix * modelViewMatrix * vec4(aVertexPosition, 1.0);

    vPosition = gl_Position; //saves pos to be used in Fragment Shader
}