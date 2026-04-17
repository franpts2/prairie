#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
varying float vWave;

uniform sampler2D uSampler;
uniform sampler2D uSampler2;
uniform float timeFactor;

void main() {
	vec2 flow = vec2(timeFactor * 0.0048, -timeFactor * 0.0034);
	vec2 mapUv = vTextureCoord * 0.85 + flow;

	vec2 d1 = texture2D(uSampler2, mapUv).rg;
	vec2 d2 = texture2D(uSampler2, mapUv + vec2(0.03, -0.02)).rg;
	vec2 distortion = ((d1 + d2) * 0.5) * 2.0 - 1.0;
	vec2 finalUv = vTextureCoord + distortion * 0.016 + vec2(vWave * 0.006, 0.0);

	vec4 baseColor = texture2D(uSampler, finalUv);

	vec3 waterTint = vec3(0.0, 0.25, 0.45);
	vec3 tinted = mix(baseColor.rgb, waterTint, 0.18);
	float highlight = 0.06 * (vWave * 0.5 + 0.5);

	gl_FragColor = vec4(tinted + highlight, baseColor.a);
}
