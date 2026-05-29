#ifdef GL_ES
precision highp float;
#endif

varying vec3 vNormal;

uniform vec4 uColor;
uniform bool uLightEnabled;
uniform vec4 uLightPosition;

void main() {
    // solid base lighting direction
    vec3 lightDir = normalize(vec3(0.4, 0.8, 0.4));
    float diffuse = max(abs(dot(vNormal, lightDir)), 0.0);
    float softLight = 0.42; // global ambient base

    if (uLightEnabled) {
        lightDir = normalize(uLightPosition.xyz);
        diffuse = max(abs(dot(vNormal, lightDir)), 0.0);
        softLight = 0.42 + diffuse * 0.58;
    }

    gl_FragColor = vec4(uColor.rgb * softLight, uColor.a);
}
