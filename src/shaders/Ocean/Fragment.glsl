uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;
uniform vec3 uFogColor;
uniform float uFogIntensity;

varying float vElevation;
varying vec3 vWorldPosition;
varying vec2 vUv;

void main()
{
    float edgeDistance = min(vUv.x, 1.0 - vUv.x);
    edgeDistance = min(edgeDistance, min(vUv.y, 1.0 - vUv.y));

    float fogFactor = 1.0 - clamp(edgeDistance, 0.0, 1.0);

    vec3 oceanColor = mix(uDepthColor, uSurfaceColor, (vElevation + uColorOffset) * uColorMultiplier);
    vec3 finalColor = mix(oceanColor, uFogColor, smoothstep(0.7, 1.0, fogFactor) * uFogIntensity);

    gl_FragColor = vec4(finalColor, 1.0);

    #include <colorspace_fragment>
}
