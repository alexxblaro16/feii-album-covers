import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import './route-hybrid.css';

function PlaceholderMesh() {
  return (
    <mesh>
      <sphereGeometry args={[0.8, 32, 32]} />
      <meshStandardMaterial color="#f4d06f" wireframe />
    </mesh>
  );
}

export default function Route() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add('route-hybrid-starter');
    return () => document.documentElement.classList.remove('route-hybrid-starter');
  }, []);

  return (
    <div className="hybrid-starter">
      <aside className="hybrid-starter__panel">
        <h1>Album title</h1>
        <p>DOM panel + Canvas — split layout is valid if you own both halves.</p>
        <button type="button" onClick={() => setOpen((v) => !v)}>
          {open ? 'Hide' : 'Show'} canvas panel
        </button>
      </aside>
      {open ? (
        <Canvas className="hybrid-starter__canvas" camera={{ position: [0, 0, 2.5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <PlaceholderMesh />
        </Canvas>
      ) : (
        <p className="hybrid-starter__off">Canvas unmounted — dispose textures if you add any.</p>
      )}
    </div>
  );
}
