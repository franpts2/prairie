#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying float vHeight;

uniform sampler2D uSampler;
uniform float grassRepeat;

uniform bool uLightEnabled;
uniform vec4 uLightPosition;

void main() {
  vec3 normal = normalize(vNormal);
  
  vec3 lightDir = normalize(vec3(0.45, 0.89, 0.16));
  float diffuse = max(dot(normal, lightDir), 0.0);
  float softLight = 0.42; // global ambient base

  if (uLightEnabled) {
    lightDir = normalize(uLightPosition.xyz);
    diffuse = max(dot(normal, lightDir), 0.0);
    softLight = 0.42 + diffuse * 0.58;
  }

  vec4 grass = texture2D(uSampler, vTextureCoord * grassRepeat);
  vec3 lowGrass = vec3(0.34, 0.43, 0.18);
  vec3 highGrass = vec3(0.62, 0.58, 0.34);
  vec3 prairieTint = mix(lowGrass, highGrass, smoothstep(0.2, 1.0, vHeight));
  vec3 color = mix(grass.rgb, prairieTint, 0.34) * softLight;

  gl_FragColor = vec4(color, grass.a);
}
