// --- Underwater Shader Vertex Shader ---

// Varying: This value will be passed from the vertex shader to the fragment shader
varying vec3 vWorldPosition; // The world position of the current vertex

void main() {
    // Calculate the world position of the vertex.
    // The model matrix is used to transform the vertex position from local space to world space.
    // The 'position' variable is the vertex position in object space, and we multiply it by the model matrix.
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;  // Transforming position to world space

    // Calculate the final clip space position of the vertex.
    // This combines the model, view, and projection matrices to place the vertex in clip space.
    // The gl_Position is a special built-in variable that stores the final vertex position in clip space.
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}

/**
 * Shader behavior summary:
 *
 * This vertex shader transforms vertex positions from local space to world space and then into clip space for rendering.
 *
 * 1. **World Position Calculation**: The vertex position is first transformed from object (local) space to world space
 *    using the `modelMatrix`, which applies the model's transformations (translation, rotation, scaling).
 *
 * 2. **Final Vertex Position Calculation**: The final position is calculated by applying the `viewMatrix` (camera transformations)
 *    and the `projectionMatrix` (perspective transformation) to the vertex's local position. This ensures the vertex is properly
 *    positioned and projected in 3D space for rendering on the screen.
 *
 * 3. The world position (`vWorldPosition`) is passed to the fragment shader for use in effects like lighting or color transitions.
 *
 * This is a typical vertex shader used in 3D rendering pipelines, where the transformation of vertex positions is necessary 
 * before sending them to the fragment shader for pixel-level processing.
 */
