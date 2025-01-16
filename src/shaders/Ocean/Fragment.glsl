// --- Ocean Shader Fragment Shader ---

// Uniforms: These are provided from the application or materials for color settings and other effects.
uniform vec3 uDepthColor;        // Color of the ocean at depth (bottom of the ocean)
uniform vec3 uSurfaceColor;      // Color of the ocean surface (near the shore)
uniform float uColorOffset;      // Offset to adjust color based on wave elevation
uniform float uColorMultiplier;  // Multiplier to scale the color mixing between depth and surface
uniform vec3 uFogColor;          // Color of the fog
uniform float uFogIntensity;     // Intensity of the fog effect
uniform vec3 uFoamColor;         // Color of the foam at wave crests
uniform float uFoamIntensity;    // Intensity of foam effect at wave crests

// Varying: These are values passed from the vertex shader to the fragment shader
varying float vElevation;        // Wave height at the current fragment (calculated in the vertex shader)
varying float vMaxWaveHeight;    // Maximum wave height (calculated in the vertex shader)
varying vec2 vUv;                // UV coordinates for the current fragment (used for texturing)

void main()
{
    // Calculate the minimum distance to any edge of the texture (left, right, top, or bottom)
    float minHorizontalDistance = min(vUv.x, 1.0 - vUv.x); // Distance to left or right edge
    float minVerticalDistance = min(vUv.y, 1.0 - vUv.y);   // Distance to top or bottom edge

    // Find the smallest distance to any edge of the texture to apply fog effect
    float edgeDistance = min(minHorizontalDistance, minVerticalDistance); // The closest distance to the edge

    // Inverse the edgeDistance to create a fog effect that is stronger towards the edges
    // Fog is more intense at the edges of the screen (smaller values of edgeDistance)
    float fogFactor = 1.0 - clamp(edgeDistance, 0.0, 1.0);

    // Calculate the ocean color based on the wave elevation
    // Mix the depth and surface colors based on wave height and the configured color offset and multiplier
    vec3 oceanColor = mix(uDepthColor, uSurfaceColor, (vElevation + uColorOffset) * uColorMultiplier);

    // Apply foam color at the wave crests (the highest points of the waves)
    // Smoothstep creates a soft transition around the max wave height, allowing foam to appear only at the crests
    float foamFactor = smoothstep(vMaxWaveHeight - 0.05, vMaxWaveHeight, vElevation); // 0.05 is the threshold for foam
    vec3 foamColor = mix(oceanColor, uFoamColor, foamFactor * uFoamIntensity); // Mix ocean color with foam color based on foamFactor

    // Apply fog effect to the ocean based on the distance from the edges of the screen (fogFactor)
    // Use smoothstep to ensure a smooth transition from ocean color to fog color
    vec3 finalColor = mix(foamColor, uFogColor, smoothstep(0.7, 1.0, fogFactor) * uFogIntensity);

    // Set the final fragment color (what will be displayed on the screen)
    gl_FragColor = vec4(finalColor, 1.0); // Set the final color (RGB) with full opacity (alpha = 1.0)

    // Includes any additional color space transformations (if applicable)
    #include <colorspace_fragment>
}

/**
 * Shader behavior summary:
 *
 * This fragment shader simulates an ocean surface with waves, foam, and fog effects.
 *
 * 1. The shader uses the provided UV coordinates (`vUv`) to determine the distance from the edges of the texture.
 *    This distance is used to create a fog effect that gets stronger as the edge of the texture is approached.
 *
 * 2. The wave height (`vElevation`) influences the blending between ocean colors (depth and surface colors).
 *    The color of the ocean is dynamically mixed based on the elevation of the wave at each fragment.
 *
 * 3. Foam is added at the wave crests (high points of the wave) based on the maximum wave height (`vMaxWaveHeight`).
 *    Foam is gradually blended using a `smoothstep` function to ensure a smooth transition.
 *
 * 4. A fog effect is applied to the ocean color, with the fog becoming stronger near the edges of the screen.
 *    The fog is a blend between the foam and fog colors, and its intensity is controlled by the `uFogIntensity` uniform.
 *
 * 5. The final color of each fragment is computed and output as the pixel color (`gl_FragColor`).
 *    This combines the ocean color, foam, and fog effects to create the appearance of waves with foam and a foggy atmosphere.
 */