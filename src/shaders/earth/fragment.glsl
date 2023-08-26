uniform sampler2D textureMap;
uniform sampler2D lightMap;
uniform sampler2D waterNormalA;
uniform sampler2D waterNormalB;
uniform sampler2D waterNormalC;
uniform float uTime;

varying vec3 vPosition;
varying float vDispValue;
varying vec2 vUv;

float inverseLerp(float value, float minValue, float maxValue) {
    return (value - minValue) / (maxValue - minValue);
}

float remap(float value, float inMin, float inMax, float outMin, float outMax) {
    float t = inverseLerp(value, inMin, inMax);
    return mix(outMin, outMax, t);
}

vec3 linearTosRGB(vec3 value ) {
    vec3 lt = vec3(lessThanEqual(value.rgb, vec3(0.0031308)));
    
    vec3 v1 = value * 12.92;
    vec3 v2 = pow(value.xyz, vec3(0.41666)) * 1.055 - vec3(0.055);

	return mix(v2, v1, lt);
}

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main()
{
    float isUnderSeaLevel = step(0.5, vDispValue);
	vec3 fdx = dFdx(vPosition);
	vec3 fdy = dFdy(vPosition);
	vec3 normal = normalize(cross(fdx, fdy));
    
    vec3 waveA = texture2D(waterNormalA, fract((vUv + uTime * 0.001) * 100.0)).rgb;
    vec3 waveB = texture2D(waterNormalB, fract((vUv + uTime * 0.0001) * 200.0)).rgb;
    vec3 waveC = texture2D(waterNormalC, fract(vec2(vUv.x - uTime * 0.0002, vUv.y + uTime * 0.0005) * 400.0)).rgb;

    normal = normalize(mix(normal - ((waveA - waveB) - (waveC - waveB)), normal, isUnderSeaLevel));

    vec3 color = texture2D(textureMap, vUv).rgb;
    color = rgb2hsv(color);
    color.y = min(1.0, color.y + color.y * 0.7);
    color.z = min(1.0, color.z + 0.1);
    color = hsv2rgb(color);
    vec3 seaColor = vec3(0.0, 0.1, 0.9);
    float seaLevel = smoothstep(0.41, 0.5, vDispValue);
    seaColor = mix(seaColor, vec3(0.1, 0.65, 1.0), seaLevel);
    color = mix(seaColor, color, isUnderSeaLevel);

    vec3 lighting = vec3(0.0);
    // Ambient light
    vec3 ambient = vec3(0.01);

    // Hemi light
    vec3 sunColor = vec3(0.5, 0.5, 0.5);
    vec3 moonColor = vec3(0.1, 0.12, 0.15);
    float hemiMix = remap(normal.z, -1.0, 1.0, 0.0, 1.0);
    vec3 hemi = mix(moonColor, sunColor, hemiMix);

    // Directional light
    vec3 lightDir = normalize(vec3(1.0, 0.2, 1.0)) + 0.5;
    vec3 lightColor = vec3(1.0, 1.0, 0.9);
    float dp = max(0.0, dot(lightDir, normal));
    vec3 diffuse = dp * lightColor;

    // Phong specular
    vec3 viewDir = normalize(cameraPosition - vPosition);
    vec3 r = normalize(reflect(-lightDir, normal));
    float phongValue = max(0.0, dot(viewDir, r));
    phongValue = pow(phongValue, 32.0);
    phongValue = mix(phongValue, 0.0, isUnderSeaLevel);
    vec3 specular = vec3(phongValue);

    // Fresnel
    float fresnel = dot(viewDir, normal);
    specular *= fresnel;

    // Light map (cities at night)
    vec3 lightMapColor = texture2D(lightMap, vUv).rgb * vec3(1.0, 1.0, 0.5);
    vec3 cityLight = mix(vec3(0.0), lightMapColor, clamp(1.0 - (diffuse.r + 0.6), 0.0, 1.0));

    lighting = ambient + diffuse * 0.7;
    vec3 finalColor = color * lighting + cityLight + specular;
    finalColor = linearTosRGB(finalColor);
    // finalColor = pow(finalColor, vec3(1.0 / 2.2));

    gl_FragColor = vec4( finalColor, 1.0 );
}