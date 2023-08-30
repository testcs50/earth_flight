precision highp float;
#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966

uniform sampler2D displacementMap;
uniform sampler2D earthBWMap;
uniform sampler2D lakesMap;

varying vec3 vPosition;
varying float vDispValue;
varying vec2 vUv;

void boxVerticeToSphere(inout vec3 p) {
    // make the vertices of a box equidistant in a sphere
    float x2 = p.x * p.x;
    float y2 = p.y * p.y;
    float z2 = p.z * p.z;
    float div1 = 2.0;
    float div2 = 3.0;
    float x = p.x * sqrt(1.0 - (y2 + z2) / div1 + (y2 * z2) / div2);
    float y = p.y * sqrt(1.0 - (z2 + x2) / div1 + (x2 * z2) / div2);
    float z = p.z * sqrt(1.0 - (x2 + y2) / div1 + (y2 * x2) / div2);
    p = vec3(x, y, z);
}

// void boxToSphere(inout vec3 p) {
//     // make sphere from the cube
//     p = p / sqrt(pow(p.x, 2.0) + pow(p.y, 2.0) + pow(p.z, 2.0));
// }

vec2 pointOnSphereToUV(vec3 p) {
    p = normalize(p);

    float longitude = atan(p.x, p.z);
    float latitude = asin(p.y);

    float u = (longitude / PI + 1.0) / 2.0;
    float v = latitude / PI + 0.5;

    return vec2(u, v);
}

void main()
{
    vec3 pos = position;
    boxVerticeToSphere(pos);
    vec2 uv = pointOnSphereToUV(pos);

    float isGround = texture2D(earthBWMap, uv).r;
    float isLake = texture2D(lakesMap, uv).r;
    
    float dispValue = 0.0;
    float texQua = 0.0;
    float texStep = 0.0005;
    float blendSize = 3.0;
    for (float i = 0.0 - blendSize; i <= blendSize; i += 1.0) {
        for (float j = 0.0 - blendSize; j <= blendSize; j += 1.0) {
            dispValue += texture2D(displacementMap, vec2(uv.x + j * texStep, uv.y + i * texStep)).r;
            texQua += 1.0;
        }
    }
    dispValue /= texQua;
    vec3 normal = normalize(pos);
    pos += normal * max(0.05, dispValue * 0.1);

    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    vPosition = modelPosition.xyz;
    vUv = uv;
    vDispValue = mix(min(0.4999, dispValue), max(0.5001, dispValue), isGround - isLake);

    gl_Position = projectedPosition;
}