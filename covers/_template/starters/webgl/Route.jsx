import { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import './route-webgl.css';

function SpinningBox() {
  const ref = useRef(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += Math.min(delta, 0.05);
  });
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#7ec8a4" />
    </mesh>
  );
}

export default function Route() {
  useEffect(() => {
    document.documentElement.classList.add('route-webgl-starter');
    return () => document.documentElement.classList.remove('route-webgl-starter');
  }, []);

  return (
    <div className="webgl-starter">
      <header>
        <h1>Album title</h1>
        <p>Your route owns this Canvas. Measure in docs/renderer-info.md when the tree grows.</p>
      </header>
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 3, 4]} intensity={1} />
        <SpinningBox />
      </Canvas>
    </div>
  );
}
