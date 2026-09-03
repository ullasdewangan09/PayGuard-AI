import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface SurrealGateCanvasProps {
  state?: 'idle' | 'approve' | 'ask' | 'block';
  onStateChange?: (state: 'idle' | 'approve' | 'ask' | 'block') => void;
  className?: string;
  interactive?: boolean;
}

export const SurrealGateCanvas: React.FC<SurrealGateCanvasProps> = ({
  state = 'idle',
  className = 'w-full h-full'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  
  // Gate parts
  const coreGroupRef = useRef<THREE.Group | null>(null);
  const portalRingRef = useRef<THREE.Mesh | null>(null);
  const monolithsRef = useRef<THREE.Mesh[]>([]);
  const particlesRef = useRef<THREE.Points | null>(null);
  const membraneRef = useRef<THREE.Mesh | null>(null);
  
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0, y: 0, targetX: 0, targetY: 0
  });

  const getColorForState = (st: string) => {
    switch (st) {
      case 'approve': return new THREE.Color(0x10B981); // Emerald
      case 'ask': return new THREE.Color(0xF59E0B); // Amber
      case 'block': return new THREE.Color(0xEF4444); // Red
      default: return new THREE.Color(0x3B82F6); // Blue
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let hasWebGL = true;
    try {
      const canvas = document.createElement('canvas');
      hasWebGL = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch {
      hasWebGL = false;
    }

    if (!hasWebGL) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene Setup - Light Theme
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // Pure white background
    scene.fog = new THREE.FogExp2(0xffffff, 0.035);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 150);
    camera.position.set(0, 0, 15);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting (Bright, soft shadows)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2);
    mainLight.position.set(10, 20, 15);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xf3f4f6, 1.5);
    fillLight.position.set(-10, 0, -10);
    scene.add(fillLight);

    const coreGroup = new THREE.Group();
    scene.add(coreGroup);
    coreGroupRef.current = coreGroup;

    // 5. Materials (Clean, frosted, metallic)
    const monolithMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf9fafb, // Off-white
      metalness: 0.1,
      roughness: 0.2,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2
    });

    const portalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x3B82F6,
      transparent: true,
      opacity: 0.9,
      roughness: 0.1,
      metalness: 0.5,
      clearcoat: 1.0,
    });

    // 6. The Portal Ring (The Gate) - Solid, smooth
    const ringGeo = new THREE.TorusGeometry(3.5, 0.2, 32, 100);
    const portalRing = new THREE.Mesh(ringGeo, portalMaterial);
    coreGroup.add(portalRing);
    portalRingRef.current = portalRing;

    // 7. The Monoliths (Vault feeling, bright)
    const monolithGeo = new THREE.BoxGeometry(1, 12, 1.5);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const monolith = new THREE.Mesh(monolithGeo, monolithMaterial);
      monolith.position.set(Math.cos(angle) * 6, 0, Math.sin(angle) * 6 - 2);
      monolith.lookAt(0, 0, 0);
      coreGroup.add(monolith);
      monolithsRef.current.push(monolith);
    }

    // 8. The Security Membrane
    const membraneGeo = new THREE.CircleGeometry(3.4, 64);
    const membraneMat = new THREE.MeshPhysicalMaterial({
      color: 0x3B82F6,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.9,
      ior: 1.5
    });
    const membrane = new THREE.Mesh(membraneGeo, membraneMat);
    coreGroup.add(membrane);
    membraneRef.current = membrane;

    // 9. Particles (Subtle floating dust)
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 600;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 40;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0x9ca3af,
      transparent: true,
      opacity: 0.6,
      blending: THREE.NormalBlending
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);
    particlesRef.current = particles;

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Mouse Move Handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Mouse damping
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      if (coreGroupRef.current) {
        // Subtle floating and rotation based on mouse
        coreGroupRef.current.rotation.y = mouseRef.current.x * 0.15;
        coreGroupRef.current.rotation.x = -mouseRef.current.y * 0.15;
        coreGroupRef.current.position.y = Math.sin(time * 0.5) * 0.2;
      }

      if (portalRingRef.current) {
        portalRingRef.current.rotation.z -= delta * 0.1;
      }

      if (particlesRef.current) {
        particlesRef.current.rotation.y = time * 0.02;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      if (rendererRef.current && rendererRef.current.domElement.parentNode) {
        rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      ringGeo.dispose();
      portalMaterial.dispose();
      monolithGeo.dispose();
      monolithMaterial.dispose();
      membraneGeo.dispose();
      membraneMat.dispose();
    };
  }, []);

  // Handle State Changes (Color & Animation)
  useEffect(() => {
    const color = getColorForState(state);
    
    // Update materials based on state
    if (portalRingRef.current) {
      const mat = portalRingRef.current.material as THREE.MeshPhysicalMaterial;
      mat.color.set(color);
    }
    
    if (membraneRef.current) {
      const mat = membraneRef.current.material as THREE.MeshPhysicalMaterial;
      mat.color.set(color);
      
      // If block, make membrane opaque and red to show a solid barrier
      if (state === 'block') {
        mat.opacity = 0.9;
        mat.transmission = 0;
      } else {
        mat.opacity = 0.1;
        mat.transmission = 0.9;
      }
    }
  }, [state]);

  return (
    <div className={className} ref={containerRef} style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0, zIndex: 0 }} />
  );
};
