// --- Underwater Shader Fragment Shader ---

// Uniforms: These are provided from the application or materials for color settings and effects.
uniform vec3 uSurfaceColor;      // Bright blue color at the surface (near the waterline)
uniform vec3 uDepthColor;        // Dark color at depth (deep underwater)
uniform vec3 uFogColor;          // White fog color at the top (surface level)
uniform float uFogIntensity;     // Intensity of the fog effect (controls the strength of the fog)
uniform float uLightScattering;  // Light scattering effect (simulates the diffusion of light underwater)

// Varying: These values are passed from the vertex shader to the fragment shader
varying vec3 vWorldPosition;     // World position of the current fragment (used for depth calculation)

void main()
{
    // Discard fragments above the surface (top of the box) to make them fully transparent.
    // This ensures that any fragment above the water surface is invisible.
    if (vWorldPosition.y >= 0.0) {
        discard; // Fragment is discarded (invisible)
    }

    // Calculate the color transition from fog (white) to surface color (bright blue) near the surface.
    // smoothstep creates a soft transition based on the fragment's vertical position (y).
    float whiteToSurfaceFactor = smoothstep(0.0, -1.0, vWorldPosition.y);  // Transition from fog to surface color
    vec3 transitionToSurface = mix(uFogColor, uSurfaceColor, whiteToSurfaceFactor);

    // Transition from surface color to deep color as you go deeper underwater.
    // smoothstep ensures a smooth and gradual change as the fragment moves below the surface.
    float surfaceToDepthFactor = smoothstep(0.0, -35.0, vWorldPosition.y); // Transition to depth color
    vec3 baseColor = mix(transitionToSurface, uDepthColor, surfaceToDepthFactor);

    // Add fog blending with white (uFogColor) as the height decreases.
    // Fog is stronger the deeper you go, and its effect is controlled by uFogIntensity.
    float fogFactor = smoothstep(0.0, -150.0, vWorldPosition.y) * uFogIntensity; // Calculate fog based on depth
    vec3 foggedColor = mix(baseColor, uFogColor, fogFactor);  // Mix color with fog

    // Apply light scattering for a more realistic underwater effect.
    // Light scattering becomes stronger the further away the fragment is from the origin (the camera).
    float depth = length(vWorldPosition); // Calculate the distance from the camera (origin)
    foggedColor += vec3(0.1) * uLightScattering / depth;  // Add light scattering effect based on depth

    // Set the final fragment color, ensuring full opacity unless the fragment is discarded.
    gl_FragColor = vec4(foggedColor, 1.0); // Output the final color with full opacity (alpha = 1.0)
}

/**
 * Shader behavior summary:
 *
 * This fragment shader simulates an underwater environment with color transitions, fog, and light scattering.
 *
 * 1. The shader discards any fragments above the water surface to make them fully transparent, creating an invisible top.
 *
 * 2. The color transition begins by fading from white fog to the surface color (bright blue) near the surface.
 *    The transition becomes smoother as the fragment goes deeper underwater.
 *
 * 3. As you go deeper, the color transitions from surface blue to a darker depth color. This simulates the changing color of the water as you dive.
 *
 * 4. Fog is blended with the base color based on the fragment's vertical position. The fog intensity increases as you go deeper into the water.
 *
 * 5. Light scattering is applied to simulate the diffusion of light underwater, with the effect becoming stronger at greater depths.
 *
 * 6. The final color of the fragment is calculated by combining the underwater colors, fog, and light scattering effects.
 *    This creates a realistic underwater appearance where the surface is clear and bright, and the deeper areas are darker and foggy.
 */
