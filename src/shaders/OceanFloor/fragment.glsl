uniform vec3 uColor;

void main() {
    // Set frag color
    gl_FragColor = vec4(uColor, 1.0);
}