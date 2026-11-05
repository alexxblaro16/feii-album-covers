// Instructor fixture — WebGL-owned endpoint (original palette, no album art).

import { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import './fixture-webgl.css';

function Prism() {
  const ref = useRef(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.6;
    ref.current.rotation.x += delta * 0.25;
  });
  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[0.9, 0]} />
      <meshStandardMaterial color="#7ec8a4" roughness={0.35} metalness={0.15} />
    </mesh>
  );
}

export default function Route() {
  useEffect(() => {
    document.documentElement.classList.add('route-_fixture-webgl');
    return () => document.documentElement.classList.remove('route-_fixture-webgl');
  }, []);

  return (
    <div className="fixture-webgl">
      <header className="fixture-webgl__head">
        <h1>Fixture — WebGL prism</h1>
        <p>Each route owns its Canvas. This one is a minimal R3F scene.</p>
      </header>
      <Canvas camera={{ position: [0, 0, 3.2], fov: 45 }} dpr={[1, 1.5]}>
        <color attach="background" args={['#0f1419']} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[2, 3, 4]} intensity={1.2} />
        <Prism />
      </Canvas>
    </div>
  );
}
