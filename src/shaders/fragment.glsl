uniform sampler2D uTexture;
uniform float uVignette;
uniform float uOpacity;
uniform vec3 uColor;

varying vec2 vUv;
varying float vDist;

void main() {
  vec4 tex = texture2D(uTexture, vUv);

  vec2 uvCentered = vUv - 0.5;
  float vignette = 1.0 - dot(uvCentered, uvCentered) * uVignette;
  vignette = clamp(vignette, 0.0, 1.0);
  vignette = smoothstep(0.0, 1.0, vignette);

  float depthFade = smoothstep(20.0, 4.0, vDist);

  float alpha = tex.a * uOpacity * vignette;
  vec3 color = mix(tex.rgb * 0.3, tex.rgb * 1.1, depthFade);

  gl_FragColor = vec4(color, alpha);
}
