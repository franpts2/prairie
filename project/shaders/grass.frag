#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
varying vec3 vNormal;

uniform sampler2D uSampler;

void main() {
    vec4 color = texture2D(uSampler, vTextureCoord);
    
    // Alpha testing for grass transparency
    if (color.a < 0.3)
        discard;

    // Darken the bottom of the grass blade for better depth
    float heightFactor = 1.0 - vTextureCoord.y;
    vec3 darkenedColor = color.rgb * (0.6 + 0.4 * heightFactor);

    // Simple lighting
    vec3 lightDir = normalize(vec3(0.4, 0.8, 0.4));
    float diffuse = max(dot(vNormal, lightDir), 0.7);
    
    gl_FragColor = vec4(darkenedColor * diffuse, color.a);
}
