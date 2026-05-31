#ifdef GL_ES
precision highp float;
#endif

varying vec3 vNormal;
varying float vLocalZ;

uniform vec4 uBaseColor;
uniform vec4 uGlowColor;
uniform float uTime;
uniform float uGlowSpeed;

uniform bool uLightEnabled;
uniform vec4 uLightPosition;

void main() {
    // lighting setup
    vec3 lightDir = normalize(vec3(0.4, 0.8, 0.4));
    float diffuse = max(abs(dot(vNormal, lightDir)), 0.0);
    float softLight = 0.4 + diffuse * 0.6;

    if (uLightEnabled) {
        lightDir = normalize(uLightPosition.xyz);
        diffuse = max(abs(dot(vNormal, lightDir)), 0.0);
        softLight = 0.4 + diffuse * 0.6;
    }

    // height gradient along the local Z axis (0.0 at base to 1.0 at tip)
    float heightT = clamp(vLocalZ, 0.0, 1.0);

    // animating glow stripe moving up/down the arrow
    float stripe = sin(vLocalZ * 5.0 - uTime * uGlowSpeed) * 0.5 + 0.5;
    stripe = pow(stripe, 4.0); // sharpen the glow stripe

    // mix base color and glow color based on the stripe and height gradient
    vec3 color = mix(uBaseColor.rgb, uGlowColor.rgb, stripe * 0.6 + heightT * 0.4);

    // render with emissive ambient lighting + standard diffuse lighting
    gl_FragColor = vec4(color * (softLight + 0.35), uBaseColor.a);
}
