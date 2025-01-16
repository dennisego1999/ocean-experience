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
    // Calculate the distance from the edge of the plane using UV coordinates
    float edgeDistance = min(vUv.x, 1.0 - vUv.x);
    edgeDistance = min(edgeDistance, min(vUv.y, 1.0 - vUv.y));

    // Inverse the edgeDistance to create a fog effect that starts at 0 in the center and increases towards 1 at the edges
    float fogFactor = 1.0 - clamp(edgeDistance, 0.0, 1.0);

    // Calculate the ocean color by mixing depth and surface color based on elevation and color settings
    vec3 oceanColor = mix(uDepthColor, uSurfaceColor, (vElevation + uColorOffset) * uColorMultiplier);

    // Mix the ocean color with the fog color based on the fogFactor, using smoothstep for a gradual transition
    vec3 finalColor = mix(oceanColor, uFogColor, smoothstep(0.7, 1.0, fogFactor) * uFogIntensity);

    // Set the final color for the fragment
    gl_FragColor = vec4(finalColor, 1.0);

    #include <colorspace_fragment>
}
