uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;
uniform vec3 uFogColor;
uniform float uFogIntensity;
uniform vec3 uFoamColor;
uniform float uFoamIntensity;

varying float vElevation;
varying float vMaxWaveHeight;
varying vec2 vUv;

void main()
{
    // Calculate the distance from the edge of the plane using UV coordinates
    float edgeDistance = min(vUv.x, 1.0 - vUv.x);
    edgeDistance = min(edgeDistance, min(vUv.y, 1.0 - vUv.y));

    // Inverse the edgeDistance to create a fog effect that starts at 0 in the center and increases towards 1 at the edges
    float fogFactor = 1.0 - clamp(edgeDistance, 0.0, 1.0);

    // Calculate the ocean color by mixing depth and surface color based on elevation and color settings
    vec3 oceanColor = mix(uDepthColor, uSurfaceColor, (vElevation + uColorOffset) * uColorMultiplier);

    // Foam factor at wave crests
    float foamFactor = smoothstep(vMaxWaveHeight - 0.05, vMaxWaveHeight, vElevation);
    vec3 foamColor = mix(oceanColor, uFoamColor, foamFactor * uFoamIntensity);

    // Mix the ocean color with the fog color based on the fogFactor, using smoothstep for a gradual transition
    vec3 finalColor = mix(foamColor, uFogColor, smoothstep(0.7, 1.0, fogFactor) * uFogIntensity);

    // Set the final color for the fragment
    gl_FragColor = vec4(finalColor, 1.0);

    #include <colorspace_fragment>
}
