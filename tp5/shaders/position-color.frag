precision highp float;

varying vec4 vPosition; // receives interpoled pos from Vertex Shader

void main() {
    // vPosition cords go from -w to +w
    // normalize to [-1,1] (divide by w)
    // then map to [0,1]
    float normalized_y = (vPosition.y / vPosition.w + 1.0) / 2.0;

    // if y in top half, yellow color
    if (normalized_y > 0.5) {
        gl_FragColor = vec4(1.0,1.0,0.0,1.0); // yellow
    }
    else {
        gl_FragColor = vec4(0.0,0.0,1.0,1.0); // blue
    }
}