#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
varying float vWave;

uniform sampler2D uSampler;
uniform sampler2D uSampler2;
uniform float timeFactor;

void main() {
	vec2 flow = vec2(timeFactor * 0.01, -timeFactor * 0.006);
	vec2 mapUv = vTextureCoord * 2.0 + flow;

	vec2 distortion = texture2D(uSampler2, mapUv).rg * 2.0 - 1.0;
	vec2 finalUv = vTextureCoord + distortion * 0.03 + vec2(vWave * 0.01, 0.0);

	vec4 baseColor = texture2D(uSampler, finalUv);

	vec3 waterTint = vec3(0.0, 0.25, 0.45);
	vec3 tinted = mix(baseColor.rgb, waterTint, 0.2);
	float highlight = 0.08 * (vWave * 0.5 + 0.5);

    vec4 filter = texture2D(uSampler2, vTextureCoord + timeFactor * 0.01);
    if (filter.b > 0.5) {
        gl_FragColor = vec4(0.52, 0.18, 0.11, 1.0);
    } else {
        gl_FragColor = vec4(tinted + highlight, baseColor.a);
    }
}
