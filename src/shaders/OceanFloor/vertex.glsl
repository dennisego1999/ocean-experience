uniform float uTime;

void main() {
    // Move position based on time
    vec3 pos = position;
    pos.z += sin(pos.x * 2.0 + uTime) * 0.5;
    pos.z += sin(pos.y * 2.0 + uTime * 1.5) * 0.5;

    // Set gl position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}