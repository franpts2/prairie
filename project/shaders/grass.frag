#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
varying vec3 vNormal;

uniform sampler2D uSampler;

uniform bool uLightEnabled;
uniform vec4 uLightPosition;

void main() {
    vec4 color = texture2D(uSampler, vTextureCoord);
    
    // Alpha testing for grass transparency
    if (color.a < 0.3)
        discard;

    // Darken the bottom of the grass blade for better depth
    float heightFactor = 1.0 - vTextureCoord.y;
    vec3 darkenedColor = color.rgb * (0.6 + 0.4 * heightFactor);

    vec3 lightDir = normalize(vec3(0.4, 0.8, 0.4));
    float diffuse = max(abs(dot(vNormal, lightDir)), 0.0);
    float softLight = 0.42; // global ambient base

    if (uLightEnabled) {
        lightDir = normalize(uLightPosition.xyz);
        diffuse = max(abs(dot(vNormal, lightDir)), 0.0);
        softLight = 0.42 + diffuse * 0.58;
    }
    
    gl_FragColor = vec4(darkenedColor * softLight, color.a);
}
