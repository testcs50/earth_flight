uniform float uTime;

varying float vCloudStrength;
varying vec3 vNormal;

void main() {
    vec3 color = vec3(1.0);

    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = step(0.5, strength);
    strength = 1.0 - strength;

    // Lights
    vec3 lighting = vec3(0.0);
    // Ambient light
    vec3 ambient = vec3(0.1);

    // Directional light
    vec3 lightDir = normalize(vec3(sin(uTime * 0.05), 0.2, cos(uTime * 0.05))) * 1.5;
    vec3 lightColor = vec3(1.0, 1.0, 0.9);
    float dp = max(0.0, dot(lightDir, vNormal));
    vec3 diffuse = dp * lightColor;

    lighting = ambient + diffuse * 0.7;

    color *= lighting;

    gl_FragColor = vec4(color, strength * vCloudStrength);
}