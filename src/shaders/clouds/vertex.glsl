#define PI 3.141592653589793
uniform float uTime;
uniform vec2 uFlightCoord;

varying float vCloudStrength;

float inverseLerp(float value, float minValue, float maxValue) {
    return (value - minValue) / (maxValue - minValue);
}

float remap(float value, float inMin, float inMax, float outMin, float outMax) {
    float t = inverseLerp(value, inMin, inMax);
    return mix(outMin, outMax, t);
}

//	Classic Perlin 2D Noise 
//	by Stefan Gustavson
//
vec4 permute(vec4 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
}

vec2 fade(vec2 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float cnoise(vec2 P) {
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
    vec4 ix = Pi.xzxz;
    vec4 iy = Pi.yyww;
    vec4 fx = Pf.xzxz;
    vec4 fy = Pf.yyww;
    vec4 i = permute(permute(ix) + iy);
    vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
    vec4 gy = abs(gx) - 0.5;
    vec4 tx = floor(gx + 0.5);
    gx = gx - tx;
    vec2 g00 = vec2(gx.x, gy.x);
    vec2 g10 = vec2(gx.y, gy.y);
    vec2 g01 = vec2(gx.z, gy.z);
    vec2 g11 = vec2(gx.w, gy.w);
    vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
    g00 *= norm.x;
    g01 *= norm.y;
    g10 *= norm.z;
    g11 *= norm.w;
    float n00 = dot(g00, vec2(fx.x, fy.x));
    float n10 = dot(g10, vec2(fx.y, fy.y));
    float n01 = dot(g01, vec2(fx.z, fy.z));
    float n11 = dot(g11, vec2(fx.w, fy.w));
    vec2 fade_xy = fade(Pf.xy);
    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
}

vec2 pointOnSphereToUV(vec3 p) {
    p = normalize(p);

    float longitude = atan(p.x, p.z);
    float latitude = asin(p.y);

    float u = (longitude / PI + 1.0) / 2.0;
    float v = latitude / PI + 0.5;

    return vec2(u, v);
}

void main() {
    vec2 uv2 = pointOnSphereToUV(position);
    float dist = distance(uFlightCoord, uv2);
    float isNear = step(0.005, dist);

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    float strength = step(0.06, cnoise(uv * 60.0 + uTime * 0.001) / 11.0);
    vCloudStrength = strength;

    gl_Position = projectedPosition;

    gl_PointSize = 50.0 * mix(remap(dist, 0.0, 0.005, 0.0, 1.0), 1.0, isNear);
    gl_PointSize *= strength;
    gl_PointSize *= (1.0 / - viewPosition.z);
}