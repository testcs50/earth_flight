vec3 uDepthColor = vec3(0.1, 0.4, 0.8);
vec3 uSurfaceColor = vec3(0.7, 0.7, 0.9);
float uColorOffset = 0.08;
float uColorMultiplier = 5.0;

varying float vElevation;

void main()
{
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);
    
    gl_FragColor = vec4(color, 0.85);
}