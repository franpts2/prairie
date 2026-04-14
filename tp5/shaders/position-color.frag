#ifdef GL_ES
precision highp float;
#endif

varying vec4 vPosition;

void main() {
  // vPosition is in clip space (-w to w). convert to Normalized Device Coords by dividing by w.
  // NDC range from -1 to 1. We scale and bias to get a 0 to 1 range.
  float normalizedY = (vPosition.y / vPosition.w) * 0.5 + 0.5;

  if (normalizedY > 0.5) {
    gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0); // Yellow
  } else {
    gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0); // Blue
  }
}
