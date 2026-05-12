varying vec2 vUv;
varying float vDist;

void main() {
  vUv = uv;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vDist = -mvPosition.z;
  gl_Position = projectionMatrix * mvPosition;
}
