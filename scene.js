/* ============================================================
   LibraryOS — Three.js Hero Scene  |  scene.js
   RFID Node Network that reacts to scroll
   ============================================================ */

(function () {
  if (!window.THREE) return; // graceful skip if CDN fails

  const canvas   = document.getElementById('hero-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 100);
  camera.position.set(0, 0, 18);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const pl1 = new THREE.PointLight(0xE43D12, 3.5, 30);
  pl1.position.set(6, 5, 5);
  scene.add(pl1);
  const pl2 = new THREE.PointLight(0xEFB11D, 2, 25);
  pl2.position.set(-5, -4, 3);
  scene.add(pl2);

  // Build node cloud
  const group    = new THREE.Group();
  const COUNT    = 30;
  const positions = [];

  for (let i = 0; i < COUNT; i++) {
    const r     = 5.5 + Math.random() * 5;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const x     = r * Math.sin(phi) * Math.cos(theta);
    const y     = r * Math.sin(phi) * Math.sin(theta);
    const z     = r * Math.cos(phi);
    positions.push(new THREE.Vector3(x, y, z));

    const isLarge = i < 5;
    const geo  = new THREE.SphereGeometry(isLarge ? 0.27 : 0.13, 8, 8);
    const color = i < 5 ? 0xE43D12 : i < 14 ? 0xEFB11D : 0xD6536D;
    const mat  = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.3,
      roughness: 0.3,
      metalness: 0.6,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    group.add(mesh);
  }

  // Connecting lines
  const lineMat = new THREE.LineBasicMaterial({ color: 0xE43D12, transparent: true, opacity: 0.15 });
  for (let i = 0; i < COUNT; i++) {
    for (let j = i + 1; j < COUNT; j++) {
      if (positions[i].distanceTo(positions[j]) < 5.2) {
        const geo = new THREE.BufferGeometry().setFromPoints([positions[i], positions[j]]);
        group.add(new THREE.Line(geo, lineMat));
      }
    }
  }

  // Central icosahedron
  const coreGeo = new THREE.IcosahedronGeometry(1.5, 1);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xE43D12, emissive: 0xE43D12, emissiveIntensity: 0.55,
    wireframe: true, transparent: true, opacity: 0.55,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  scene.add(core);
  scene.add(group);

  // Resize handler
  function resize() {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // Scroll progress
  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; });

  // Animation loop
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.004;
    const sp = Math.min(scrollY / (window.innerHeight * 0.75), 1);
    group.rotation.y = t + sp * Math.PI * 0.55;
    group.rotation.x = Math.sin(t * 0.38) * 0.22 + sp * 0.28;
    core.rotation.y  = t * 1.25;
    core.rotation.x  = t * 0.65;
    core.scale.setScalar(1 + Math.sin(t * 1.9) * 0.07);
    camera.position.z = 18 - sp * 4;
    camera.position.y = sp * 1.8;
    renderer.render(scene, camera);
  }

  // Respect reduced-motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    renderer.render(scene, camera);
  } else {
    animate();
  }
})();
