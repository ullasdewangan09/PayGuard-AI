import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface PayGuardCoreCanvasProps {
  state?: 'idle' | 'approve' | 'ask' | 'block';
  onStateChange?: (state: 'idle' | 'approve' | 'ask' | 'block') => void;
  className?: string;
  interactive?: boolean;
}

export const PayGuardCoreCanvas: React.FC<PayGuardCoreCanvasProps> = ({
  state = 'idle',
  className = 'w-full h-full'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const coreMeshGroupRef = useRef<THREE.Group | null>(null);
  const innerChamberRef = useRef<THREE.Mesh | null>(null);
  const transactionCoreRef = useRef<THREE.Mesh | null>(null);
  const ringsRef = useRef<THREE.Mesh[]>([]);
  const particlesRef = useRef<THREE.Points | null>(null);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0
  });

  // State color mapping
  const getColorForState = (st: string) => {
    switch (st) {
      case 'approve':
        return new THREE.Color(0x00e599); // Emerald
      case 'ask':
        return new THREE.Color(0xffb800); // Amber
      case 'block':
        return new THREE.Color(0xff3355); // Crimson
      default:
        return new THREE.Color(0x00f0ff); // Electric Cyan
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL support
    let hasWebGL = true;
    try {
      const canvas = document.createElement('canvas');
      hasWebGL = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch {
      hasWebGL = false;
    }

    if (!hasWebGL) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 600;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const coreLight = new THREE.PointLight(0x00f0ff, 3, 10);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
    rimLight.position.set(5, 5, 4);
    scene.add(rimLight);

    const bottomGlow = new THREE.PointLight(0x2e72d2, 1.5, 8);
    bottomGlow.position.set(0, -3, 2);
    scene.add(bottomGlow);

    // Master Group
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);
    coreMeshGroupRef.current = coreGroup;

    // 1. Central Transaction Core (Icosahedron / Crystal)
    const coreGeo = new THREE.IcosahedronGeometry(0.85, 1);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.8,
      wireframe: true,
      transparent: true,
      opacity: 0.95
    });
    const transactionCore = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(transactionCore);
    transactionCoreRef.current = transactionCore;

    // 2. Inner Authorization Chamber (Semi-transparent faceted cage)
    const chamberGeo = new THREE.OctahedronGeometry(1.4, 2);
    const chamberMat = new THREE.MeshStandardMaterial({
      color: 0x12151e,
      roughness: 0.3,
      metalness: 0.9,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const innerChamber = new THREE.Mesh(chamberGeo, chamberMat);
    coreGroup.add(innerChamber);
    innerChamberRef.current = innerChamber;

    // 3. Concentric Security Rings (Multiple orthogonal orbital boundaries)
    const rings: THREE.Mesh[] = [];
    const ringConfigs = [
      { radius: 1.9, tube: 0.02, rotX: 0.4, rotY: 0.2, speed: 0.008 },
      { radius: 2.3, tube: 0.015, rotX: -0.6, rotY: 0.5, speed: -0.006 },
      { radius: 2.7, tube: 0.025, rotX: 0.8, rotY: -0.3, speed: 0.004 },
      { radius: 3.1, tube: 0.012, rotX: -0.2, rotY: 0.9, speed: -0.003 }
    ];

    ringConfigs.forEach((cfg) => {
      const ringGeo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 100);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.3,
        roughness: 0.2,
        metalness: 0.9,
        wireframe: true
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = cfg.rotX;
      ringMesh.rotation.y = cfg.rotY;
      coreGroup.add(ringMesh);
      rings.push(ringMesh);
    });
    ringsRef.current = rings;

    // 4. Particle Field & Data Streams
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const baseColor = new THREE.Color(0x00f0ff);
    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.0 + Math.random() * 2.4;

      const px = r * Math.sin(phi) * Math.cos(theta);
      const py = r * Math.sin(phi) * Math.sin(theta);
      const pz = r * Math.cos(phi);

      positions[i * 3] = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = pz;

      originalPositions[i * 3] = px;
      originalPositions[i * 3 + 1] = py;
      originalPositions[i * 3 + 2] = pz;

      particleColors[i * 3] = baseColor.r;
      particleColors[i * 3 + 1] = baseColor.g;
      particleColors[i * 3 + 2] = baseColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    coreGroup.add(particles);
    particlesRef.current = particles;

    // Mouse movement listener
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = nx * 0.8;
      mouseRef.current.targetY = ny * 0.8;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Resize listener
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Lerp mouse
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      if (coreMeshGroupRef.current) {
        coreMeshGroupRef.current.rotation.y = elapsedTime * 0.15 + mouseRef.current.x * 0.5;
        coreMeshGroupRef.current.rotation.x = Math.sin(elapsedTime * 0.1) * 0.1 + mouseRef.current.y * 0.4;
      }

      if (transactionCoreRef.current) {
        transactionCoreRef.current.rotation.x = elapsedTime * 0.4;
        transactionCoreRef.current.rotation.y = elapsedTime * 0.6;
        const scalePulse = 1 + Math.sin(elapsedTime * 2) * 0.03;
        transactionCoreRef.current.scale.set(scalePulse, scalePulse, scalePulse);
      }

      if (innerChamberRef.current) {
        innerChamberRef.current.rotation.y = -elapsedTime * 0.25;
        innerChamberRef.current.rotation.z = Math.cos(elapsedTime * 0.3) * 0.15;
      }

      // Rotate individual security rings
      ringsRef.current.forEach((ring, idx) => {
        const speed = ringConfigs[idx].speed;
        ring.rotation.z += speed;
        ring.rotation.x += speed * 0.5;
      });

      // Animate particles
      if (particlesRef.current) {
        const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const posArray = posAttr.array as Float32Array;

        for (let i = 0; i < particleCount; i++) {
          const idx = i * 3;
          const ox = originalPositions[idx];
          const oy = originalPositions[idx + 1];
          const oz = originalPositions[idx + 2];

          // Dynamic flow based on state
          const wave = Math.sin(elapsedTime * 1.5 + i * 0.1) * 0.15;
          posArray[idx] = ox + wave * (ox / 3);
          posArray[idx + 1] = oy + Math.cos(elapsedTime * 1.2 + i * 0.1) * 0.1;
          posArray[idx + 2] = oz + wave * (oz / 3);
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update visual state dynamically
  useEffect(() => {
    const targetColor = getColorForState(state);

    if (transactionCoreRef.current) {
      const mat = transactionCoreRef.current.material as THREE.MeshPhysicalMaterial;
      mat.color = targetColor;
      mat.emissive = targetColor;
      mat.emissiveIntensity = state === 'block' ? 0.9 : state === 'approve' ? 0.8 : 0.6;
    }

    ringsRef.current.forEach((ring) => {
      const mat = ring.material as THREE.MeshStandardMaterial;
      mat.color = targetColor;
      mat.emissive = targetColor;
      mat.emissiveIntensity = state === 'block' ? 0.6 : state === 'approve' ? 0.5 : 0.3;
    });

    if (particlesRef.current) {
      const colorAttr = particlesRef.current.geometry.attributes.color as THREE.BufferAttribute;
      const colorArray = colorAttr.array as Float32Array;
      for (let i = 0; i < colorArray.length / 3; i++) {
        colorArray[i * 3] = targetColor.r;
        colorArray[i * 3 + 1] = targetColor.g;
        colorArray[i * 3 + 2] = targetColor.b;
      }
      colorAttr.needsUpdate = true;
    }
  }, [state]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none pointer-events-auto ${className}`}
      data-cursor-variant="inspect"
      data-cursor-badge="CORE_VIEW"
    />
  );
};
