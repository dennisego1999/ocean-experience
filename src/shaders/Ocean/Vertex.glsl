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
    vUv = uv;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = modelPosition.xyz;

    // Elevation
    float elevation = sin(modelPosition.x * uBigWavesFrequency.x + uTime * uBigWavesSpeed) *
    sin(modelPosition.z * uBigWavesFrequency.y + uTime * uBigWavesSpeed) *
    uBigWavesElevation;

    for(float i = 1.0; i <= uSmallIterations; i++)
    {
        elevation -= abs(cnoise(vec3(modelPosition.xz * uSmallWavesFrequency * i, uTime * uSmallWavesSpeed)) * uSmallWavesElevation / i);
    }

    modelPosition.y += elevation;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    // Varyings
    vElevation = elevation;
}