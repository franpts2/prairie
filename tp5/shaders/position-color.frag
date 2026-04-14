#ifdef GL_ES
precision highp float;
#endif

varying vec4 vPosition;

void main() {
  // vPosition is in clip space (-w to w). convert to Normalized Device Coords by dividing by w.
  // NDC range from -1 to 1. We scale and bias to get a 0 to 1 range.
  float normalizedY = (vPosition.y / vPosition.w) * 0.5 + 0.5;

  if (normalizedY > 0.5) {
    gl_FragColor = vec4(0.898, 0.898, 0.0, 1.0); // #E5E500
  } else {
    gl_FragColor = vec4(0.541, 0.541, 0.898, 1.0); // #8A8AE5
  }
}
