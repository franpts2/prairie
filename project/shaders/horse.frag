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
    
    // directional lighting base
    vec3 lightDir = normalize(vec3(0.4, 0.8, 0.4));
    float diffuse = max(abs(dot(vNormal, lightDir)), 0.0);
    float softLight = 0.4 + diffuse * 0.6;

    if (uLightEnabled) {
        lightDir = normalize(uLightPosition.xyz);
        diffuse = max(abs(dot(vNormal, lightDir)), 0.0);
        softLight = 0.42 + diffuse * 0.58;
    }
    
    gl_FragColor = vec4(color.rgb * softLight, color.a);
}
