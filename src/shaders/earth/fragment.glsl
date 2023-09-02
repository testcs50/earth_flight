uniform sampler2D textureMap;
uniform sampler2D lightMap;
uniform sampler2D waterNormalA;
uniform sampler2D waterNormalB;
uniform sampler2D waterNormalC;
uniform sampler2D landDistanceMap;
uniform sampler2D countriesColorsMap;
uniform float uTime;
uniform vec2 uFlightCoord;

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

//	Classic Perlin 3D Noise 
//	by Stefan Gustavson
//
vec4 permute(vec4 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
}
vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}
vec3 fade(vec3 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float cnoise(vec3 P) {
    vec3 Pi0 = floor(P); // Integer part for indexing
    vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
    Pi0 = mod(Pi0, 289.0);
    Pi1 = mod(Pi1, 289.0);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 / 7.0;
    vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 / 7.0;
    vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
    vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
    vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
    vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
    vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
    vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
    vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
    vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);

    return 2.2 * n_xyz;
}

void main()
{
    // vec2 flightCoords = vec2(0.64, 0.82);
    float isUnderSeaLevel = step(0.5, vDispValue);
    vec3 color = texture2D(textureMap, vUv).rgb;

    // calcualate normals
	vec3 fdx = dFdx(vPosition);
	vec3 fdy = dFdy(vPosition);
	vec3 normal = normalize(cross(fdx, fdy));
    
    // add normalmaps for sea
    vec3 waveA = texture2D(waterNormalA, fract((vUv + uTime * 0.001) * 100.0)).rgb;
    vec3 waveB = texture2D(waterNormalB, fract((vUv + uTime * 0.0001) * 200.0)).rgb;
    vec3 waveC = texture2D(waterNormalC, fract(vec2(vUv.x - uTime * 0.0002, vUv.y + uTime * 0.0005) * 400.0)).rgb;
    normal = normalize(mix(normal - ((waveA - waveB) - (waveC - waveB)), normal, isUnderSeaLevel));

    // Make a current country brighter (in fact we are doing other countries darker)
    vec3 coordCountry = texture2D(countriesColorsMap, uFlightCoord).rgb;
    vec3 currentCountry = texture2D(countriesColorsMap, vUv).rgb;
    float coordDistance = step(0.0000001, distance(coordCountry, currentCountry));
    float colorMultiplier = mix(1.0, 0.2, coordDistance);
    color *= colorMultiplier;

    // Make colors more saturated
    color = rgb2hsv(color);
    color.y = min(1.0, color.y + color.y * 0.7);
    color.z = min(1.0, mix(color.z, color.z + 0.1, coordDistance));
    color = hsv2rgb(color);
    vec3 seaColor = vec3(0.0, 0.1, 0.9);
    float seaLevel = smoothstep(0.38, 0.5, vDispValue);
    seaColor = mix(seaColor, vec3(0.1, 0.5, 1.0), seaLevel);

    // Waves from shores
    vec3 ld = texture2D(landDistanceMap, vUv).rgb;
    float strength = cnoise(ld * 100.0 - uTime * 0.3);
    strength *= cnoise(vec3(vUv * 100.0, uTime * 0.1)) * 2.0;
    strength = clamp(strength, 0.0, 1.0);
    seaColor = mix(seaColor, seaColor + vec3(strength), smoothstep(0.98, 1.0, 1.0 - ld));
    // seaColor = vec3(strength);

    color = mix(seaColor, color, isUnderSeaLevel);

    // Lights
    vec3 lighting = vec3(0.0);
    // Ambient light
    vec3 ambient = vec3(0.03);

    // Hemi light
    vec3 sunColor = vec3(0.5, 0.5, 0.5);
    vec3 moonColor = vec3(0.1, 0.12, 0.15);
    float hemiMix = remap(normal.z, -1.0, 1.0, 0.0, 1.0);
    vec3 hemi = mix(moonColor, sunColor, hemiMix);

    // Directional light
    vec3 lightDir = normalize(vec3(sin(uTime * 0.05), 0.2, cos(uTime * 0.05))) * 3.5;
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
    gl_FragColor = vec4(finalColor, 1.0);
}