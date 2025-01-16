uniform float uTime;
uniform float uBigWavesElevation;
uniform vec2 uBigWavesFrequency;
uniform float uBigWavesSpeed;
uniform float uSmallWavesElevation;
uniform float uSmallWavesFrequency;
uniform float uSmallWavesSpeed;
uniform float uSmallIterations;

varying float vElevation;
varying vec3 vWorldPosition;
varying vec2 vUv;

#include ../Includes/ClassicPerlin3dNoise.glsl;

void main()
{
    // Set the UV coordinates to varyings
    vUv = uv;

    // Calculate world position by transforming the model position by the model matrix
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = modelPosition.xyz;

    // Elevation
    float elevation = sin(modelPosition.x * uBigWavesFrequency.x + uTime * uBigWavesSpeed) *
    sin(modelPosition.z * uBigWavesFrequency.y + uTime * uBigWavesSpeed) *
    uBigWavesElevation;

    for(float i = 1.0; i <= uSmallIterations; i++)
    {
        // Add small wave elevation by applying Perlin noise in iterations
        elevation -= abs(cnoise(vec3(modelPosition.xz * uSmallWavesFrequency * i, uTime * uSmallWavesSpeed)) * uSmallWavesElevation / i);
    }

    // Update the y-coordinate of the model position based on calculated elevation
    modelPosition.y += elevation;

    // Apply view matrix to model position to get view space position
    vec4 viewPosition = viewMatrix * modelPosition;

    // Apply projection matrix to view position for clip space coordinates
    vec4 projectedPosition = projectionMatrix * viewPosition;

    // Set final position for vertex shader output
    gl_Position = projectedPosition;

    // Pass the elevation to the fragment shader
    vElevation = elevation;
}