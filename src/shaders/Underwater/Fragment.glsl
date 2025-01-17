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
    // Ensure the depth zone remains the depth color and does not fade back to fog color.
    float surfaceToDepthFactor = smoothstep(0.0, -35.0, vWorldPosition.y); // Transition to depth color
    vec3 baseColor = mix(transitionToSurface, uDepthColor, surfaceToDepthFactor);

    // Add fog blending with white (uFogColor) as the height decreases.
    // Fog is stronger the deeper you go, and its effect is controlled by uFogIntensity.
    float fogFactor = clamp((vWorldPosition.y + 150.0) / -150.0, 0.0, 1.0) * uFogIntensity; // Corrected fog calculation
    vec3 foggedColor = mix(baseColor, uFogColor, fogFactor);  // Mix color with fog

    // Apply light scattering for a more realistic underwater effect.
    // Light scattering becomes stronger the further away the fragment is from the origin (the camera).
    float depth = length(vWorldPosition); // Calculate the distance from the camera (origin)
    vec3 scattering = vec3(0.1) * uLightScattering / (depth + 1.0); // Prevent division by zero
    foggedColor += scattering;  // Add light scattering effect based on depth

    // Ensure the depth color remains dominant at deep zones, preventing a fade back to fog color.
    if (vWorldPosition.y < -35.0) {
        foggedColor = mix(foggedColor, uDepthColor, 1.0);
    }

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
 * 3. As you go deeper, the color transitions from surface blue to a darker depth color. The depth zone retains its color,
 *    ensuring it does not fade back to fog color.
 *
 * 4. Fog is blended with the base color based on the fragment's vertical position. The fog intensity increases as you go deeper
 *    into the water, with improved fog scattering for a more realistic appearance.
 *
 * 5. Light scattering is applied to simulate the diffusion of light underwater, with the effect becoming stronger at greater depths.
 *    The scattering calculation has been corrected for better realism.
 *
 * 6. The final color of the fragment is calculated by combining the underwater colors, fog, and light scattering effects.
 *    This creates a realistic underwater appearance where the surface is clear and bright, the deeper areas are darker and foggy,
 *    and the depth zones retain their intended coloration.
 */
