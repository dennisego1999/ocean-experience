// --- Ocean Shader Vertex Shader ---

// Uniforms: These are values passed from the application or materials for wave behavior and animation
uniform float uTime;                  // Current time, used for animation of waves over time
uniform float uBigWavesElevation;     // The elevation (height) of the big waves
uniform vec2 uBigWavesFrequency;      // The frequency (spatial periodicity) of the big waves in x and z directions
uniform float uBigWavesSpeed;         // Speed of the big waves movement over time
uniform float uSmallWavesElevation;   // The elevation (height) of the small waves
uniform float uSmallWavesFrequency;   // The frequency (spatial periodicity) of the small waves
uniform float uSmallWavesSpeed;       // Speed of the small waves movement over time
uniform float uSmallIterations;       // Number of iterations for Perlin noise to generate small waves

// Varyings: These values are passed to the fragment shader for further calculations
varying float vElevation;             // The final elevation (height) at the current vertex
varying float vMaxWaveHeight;         // The maximum wave height at the current vertex
varying vec3 vWorldPosition;          // The world position of the vertex (in 3D space)
varying vec2 vUv;                     // The UV coordinates of the current vertex for texture mapping

// Include external GLSL code for Perlin noise function
#include ../Includes/ClassicPerlin3dNoise.glsl;

void main()
{
    // Pass UV coordinates to the fragment shader for texturing
    vUv = uv;

    // Calculate the world position of the vertex by transforming the local position by the model matrix
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = modelPosition.xyz; // Store the world position for later use (e.g., lighting or effects)

    // Elevation due to big waves (sinusoidal waves in both x and z directions)
    float elevation = sin(modelPosition.x * uBigWavesFrequency.x + uTime * uBigWavesSpeed) *
    sin(modelPosition.z * uBigWavesFrequency.y + uTime * uBigWavesSpeed) *
    uBigWavesElevation; // Sine function applied for big wave motion

    // Add small waves using Perlin noise in multiple iterations for more complex wave patterns
    for(float i = 1.0; i <= uSmallIterations; i++)
    {
        // Apply Perlin noise to generate small wave heights in xz plane, scaled by frequency and speed
        // The noise value is adjusted by small wave elevation and iteration number to add more variation
        elevation -= abs(cnoise(vec3(modelPosition.xz * uSmallWavesFrequency * i, uTime * uSmallWavesSpeed)) *
        uSmallWavesElevation / i);
    }

    // Update the y-coordinate of the model position with the calculated elevation to simulate wave motion
    modelPosition.y += elevation;

    // Track the maximum wave height dynamically (absolute value of the elevation)
    vMaxWaveHeight = abs(elevation);

    // Apply the view matrix to the model position to convert it from model space to view space
    vec4 viewPosition = viewMatrix * modelPosition;

    // Apply the projection matrix to convert from view space to clip space
    vec4 projectedPosition = projectionMatrix * viewPosition;

    // Set the final position for the vertex, determining where it will be displayed on the screen
    gl_Position = projectedPosition;

    // Pass the final elevation value to the fragment shader for color calculations (e.g., foam, fog)
    vElevation = elevation;
}

/**
 * Shader behavior summary:
 *
 * This vertex shader simulates the movement of ocean waves by calculating both large and small waves
 * and modifying the position of each vertex accordingly. The elevation of each vertex is dynamically 
 * adjusted based on sinusoidal wave functions (for big waves) and Perlin noise (for small waves).
 *
 * 1. The shader starts by calculating the world position of each vertex using the model matrix.
 *
 * 2. Big waves are simulated using sinusoidal functions that depend on both the world position (in x and z axes)
 *    and time (`uTime`). These waves create large, periodic up-and-down motions across the ocean.
 *
 * 3. Small waves are generated using Perlin noise in the xz plane, and this effect is applied in several iterations
 *    to add complexity to the small wave motion. The Perlin noise is influenced by the time, frequency, and 
 *    speed of the small waves, and each iteration reduces the wave height for smoother results.
 *
 * 4. The final elevation for each vertex is calculated by adding the effects of both the big and small waves.
 *    This elevation is then applied to the y-coordinate of the vertex to simulate the motion of the ocean surface.
 *
 * 5. The maximum wave height for each vertex is tracked to be passed to the fragment shader, where it can be 
 *    used to apply effects such as foam at wave crests.
 *
 * 6. The position of the vertex is transformed into view space and then into clip space using the appropriate 
 *    transformation matrices (`viewMatrix` and `projectionMatrix`).
 *
 * 7. Finally, the vertex position is set (`gl_Position`) and the elevation is passed to the fragment shader 
 *    for further color calculations, such as foam and fog effects.
 */