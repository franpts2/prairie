#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
varying float vWave;

uniform sampler2D uSampler;     // waterTex (unit 0)
uniform sampler2D uSampler2;    // waterMap (unit 1)
uniform sampler2D uSampler3;    // pathMap (unit 2)
uniform float timeFactor;

void main() {
	// Only draw water inside the circular boundaries of the terrain
	if (distance(vTextureCoord, vec2(0.5, 0.5)) > 0.5) {
		discard;
	}

	// Sample the path map to find the riverbed
	float pathValue = texture2D(uSampler3, vTextureCoord).r;

	// Only draw water where the stroke is around 0.5
	if (pathValue < 0.40 || pathValue > 0.60) {
		discard;
	}

	// Avoid rendering water on the transition edges of the road (where path goes to 1.0)
	// Sample 4 offsets around the current coordinate (6 texels offset in a 500x500 map)
	float stepSize = 0.012;
	float p1 = texture2D(uSampler3, vTextureCoord + vec2(stepSize, 0.0)).r;
	float p2 = texture2D(uSampler3, vTextureCoord + vec2(-stepSize, 0.0)).r;
	float p3 = texture2D(uSampler3, vTextureCoord + vec2(0.0, stepSize)).r;
	float p4 = texture2D(uSampler3, vTextureCoord + vec2(0.0, -stepSize)).r;

	float maxNeighbor = max(max(p1, p2), max(p3, p4));
	if (maxNeighbor > 0.70) {
		discard;
	}

	// Dynamic water rendering with flow and distortion
	vec2 flow = vec2(timeFactor * 0.0048, -timeFactor * 0.0034);
	vec2 mapUv = vTextureCoord * 0.85 + flow;

	vec2 d1 = texture2D(uSampler2, mapUv).rg;
	vec2 d2 = texture2D(uSampler2, mapUv + vec2(0.03, -0.02)).rg;
	vec2 distortion = ((d1 + d2) * 0.5) * 2.0 - 1.0;
	float waterRepeat = 4.0;
	vec2 finalUv = (vTextureCoord * waterRepeat) + distortion * 0.016 + vec2(vWave * 0.006, 0.0);

	vec4 baseColor = texture2D(uSampler, finalUv);

	vec3 waterTint = vec3(0.0, 0.25, 0.45);
	vec3 tinted = mix(baseColor.rgb, waterTint, 0.18);
	float highlight = 0.06 * (vWave * 0.5 + 0.5);

	gl_FragColor = vec4(tinted + highlight, baseColor.a);
}
