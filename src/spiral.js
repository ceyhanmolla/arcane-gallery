import * as THREE from 'three'
import vertexShader from './shaders/vertex.glsl?raw'
import fragmentShader from './shaders/fragment.glsl?raw'

const CONFIG = {
  count: 15,
  radius: 6.0,
  spacing: 5.5,
  turns: 2.0,
  tileWidth: 6.0,
  tileHeight: 4.0,
  curvature: 0.25,
  segmentsW: 24,
  segmentsH: 2,
  vignetteStrength: 2.0,
}

const IMAGES = [
  'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4734259a-bad7-422f-981e-ce01e79184f2_1600w.jpg',
  'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/e534354d-c5f2-4399-a1d9-2f50338e8c47_1600w.jpg',
  'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/bfef5098-c30f-4cd9-b4ac-04b2673ab943_1600w.jpg',
  'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/fa51902b-c2a4-4c33-a96e-a8f1ef67edc6_3840w.jpg',
  'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/d14dc069-558a-4c51-8aad-5cc237f9b61d_3840w.jpg',
  'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/75134536-4198-40bf-9944-315511fe8c0b_3840w.jpg',
  'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/a4780cd9-2a3d-4bdc-9e5f-85a097b3a8bf_3840w.webp',
  'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/c31dd008-598b-4fc9-b5c7-9c3e1d296d38_3840w.jpg',
  'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/724142aa-44a6-48d3-9cf3-761e00d05b78_1600w.jpg',
  'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/005600e5-f6ab-4e59-bc86-eaeb02797dfa_1600w.jpg',
  'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/5ee0a38a-b5d3-4531-8793-98beed4af162_1600w.jpg',
  'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/7f78131e-65e9-49b2-aa1f-ccc33e28df9f_1600w.webp',
  'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/fb6415fd-bf4d-4ccf-8e9d-7ab445e99207_1600w.jpg',
  'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/0d868fef-f560-45ca-ab35-5dad4fc29059_3840w.webp',
  'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/3186f9ea-5f5a-49f7-8fcf-568ad52f515e_3840w.webp',
]

function createTileGeo(w, h, curve, segW, segH) {
  const pos = []
  const uvs = []
  const idx = []

  for (let j = 0; j <= segH; j++) {
    for (let i = 0; i <= segW; i++) {
      const u = i / segW
      const v = j / segH
      const x = (u - 0.5) * w
      const y = (v - 0.5) * h
      const z = -curve * Math.sin((u - 0.5) * Math.PI)
      pos.push(x, y, z)
      uvs.push(u, v)
    }
  }

  for (let j = 0; j < segH; j++) {
    for (let i = 0; i < segW; i++) {
      const a = j * (segW + 1) + i
      const b = a + 1
      const c = (j + 1) * (segW + 1) + i
      const d = c + 1
      idx.push(a, b, c, b, d, c)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(idx)
  geo.computeVertexNormals()
  return geo
}

export default function createSpiral(canvas) {
  const tileGeo = createTileGeo(
    CONFIG.tileWidth, CONFIG.tileHeight,
    CONFIG.curvature, CONFIG.segmentsW, CONFIG.segmentsH
  )

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: false,
    antialias: true,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0x0a0a0a)

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 60)
  camera.position.set(0, 0, 12)
  camera.lookAt(0, 0, 0)

  const group = new THREE.Group()
  scene.add(group)

  const loader = new THREE.TextureLoader()
  const tiles = []

  const totalHeight = CONFIG.turns * CONFIG.spacing

  const geoAspect = CONFIG.tileWidth / CONFIG.tileHeight

  IMAGES.forEach((url, i) => {
    const tex = loader.load(url)

    tex.addEventListener('load', () => {
      const imgAspect = tex.image.width / tex.image.height
      if (imgAspect > geoAspect) {
        tex.repeat.x = geoAspect / imgAspect
        tex.offset.x = (1 - tex.repeat.x) / 2
      } else {
        tex.repeat.y = imgAspect / geoAspect
        tex.offset.y = (1 - tex.repeat.y) / 2
      }
    })

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: tex },
        uVignette: { value: CONFIG.vignetteStrength },
        uOpacity: { value: 0 },
        uColor: { value: new THREE.Color(0xffffff) },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: true,
      side: THREE.DoubleSide,
    })

    const mesh = new THREE.Mesh(tileGeo, mat)
    const t = i / CONFIG.count
    const angle = t * Math.PI * 2 * CONFIG.turns
    const y = (t - 0.5) * totalHeight

    mesh.position.set(
      CONFIG.radius * Math.sin(angle),
      y,
      CONFIG.radius * Math.cos(angle)
    )
    mesh.rotation.y = angle

    mesh.userData = { targetOpacity: 1 }
    group.add(mesh)
    tiles.push(mesh)
  })

  const ambient = new THREE.AmbientLight(0xffffff, 1)
  scene.add(ambient)

  let mouseX = 0
  let mouseY = 0
  let currentRot = 0
  let scrollVelocity = 0
  let revealed = false

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2
  })

  window.addEventListener('resize', () => {
    const w = window.innerWidth
    const h = window.innerHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  })

  function revealTiles() {
    revealed = true
    tiles.forEach((m) => { m.userData.targetOpacity = 1 })
  }

  let lastT = 0

  function loop(t) {
    const dt = lastT ? Math.min((t - lastT) / 16.67, 3) : 1
    lastT = t

    currentRot += scrollVelocity * 0.0008 * dt
    currentRot += 0.003 * dt

    group.rotation.y = currentRot
    group.rotation.x += (mouseY * 0.003 - group.rotation.x) * 0.03 * dt
    group.rotation.z += (-mouseX * 0.003 - group.rotation.z) * 0.03 * dt

    const reveal = revealed
    for (let i = 0; i < tiles.length; i++) {
      const m = tiles[i]
      const target = m.userData.targetOpacity
      const speed = reveal ? 0.08 : 0.02
      const u = m.material.uniforms.uOpacity
      u.value += (target - u.value) * speed * dt
    }

    renderer.render(scene, camera)
    requestAnimationFrame(loop)
  }

  requestAnimationFrame(loop)
  setTimeout(revealTiles, 100)

  return {
    setScrollVelocity(v) { scrollVelocity = v },
    resize() {
      const w = window.innerWidth; const h = window.innerHeight
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h)
    },
    getTiles() { return tiles },
  }
}
