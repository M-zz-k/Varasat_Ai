import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// ── Curated Indian Portraits from Unsplash ──────────────────────────────────
const CARDS_DATA = [
  { id: 1, name: 'Ramesh Kumar', role: 'Father / Deceased', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 2, name: 'Priya Sharma', role: 'Claimant / Wife', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 3, name: 'Amit Patel', role: 'Nominee / Brother', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 4, name: 'Sunita Verma', role: 'Mother / Beneficiary', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 5, name: 'Rajesh Gupta', role: 'Co-applicant / Uncle', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 6, name: 'Ananya Nair', role: 'Daughter / Claimant', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 7, name: 'Vikram Singh', role: 'Grandfather', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 8, name: 'Kavita Reddy', role: 'Sister / Co-heir', img: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 9, name: 'Sanjay Mehta', role: 'Son / Administrator', img: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 10, name: 'Neha Joshi', role: 'Wife / Claimant', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 11, name: 'Arjun Sen', role: 'Son / Nominee', img: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 12, name: 'Aditi Rao', role: 'Daughter / Legal Heir', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 13, name: 'Vijay Mhatre', role: 'Father / Deceased', img: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 14, name: 'Meera Deshmukh', role: 'Mother / Nominee', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 15, name: 'Rahul Roy', role: 'Brother / Co-owner', img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 16, name: 'Divya Iyer', role: 'Niece / Legal Representative', img: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 17, name: 'Suresh Menon', role: 'Grandson / Claimant', img: 'https://images.unsplash.com/photo-1489980508314-941910ded1f4?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 18, name: 'Swati Pillai', role: 'Daughter-in-law', img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 19, name: 'Deepak Saxena', role: 'Cousin / Executor', img: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 20, name: 'Ritu Kapoor', role: 'Aunt / Nominee', img: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 21, name: 'Manish Pandey', role: 'Son / Legal Heir', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 22, name: 'Sonia Gandhi', role: 'Wife / Beneficiary', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 23, name: 'Karan Johar', role: 'Brother / Executor', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 24, name: 'Alia Bhatt', role: 'Daughter / Claimant', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 25, name: 'Ranbir Singh', role: 'Husband / Nominee', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 26, name: 'Deepika P.', role: 'Wife / Nominee', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 27, name: 'Saif Ali', role: 'Father / Deceased', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 28, name: 'Kareena K.', role: 'Sister / Co-heir', img: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 29, name: 'Hrithik R.', role: 'Son / Administrator', img: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 30, name: 'Katrina K.', role: 'Wife / Claimant', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80' },
];

// ── Floating Sphere Card Component ──────────────────────────────────────────
function FloatingCard({ position, name, role, imageUrl, index }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);

  // Positional noise seed for individual float/drift effect
  const seed = useMemo(() => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    z: Math.random() * 100,
    speed: 0.3 + Math.random() * 0.4,
    amp: 0.12 + Math.random() * 0.12,
  }), []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() * seed.speed;
    
    // Smooth independent floating drift (wave animation)
    const dx = Math.sin(t + seed.x) * seed.amp;
    const dy = Math.cos(t + seed.y) * seed.amp;
    const dz = Math.sin(t * 1.3 + seed.z) * seed.amp;

    ref.current.position.x = position[0] + dx;
    ref.current.position.y = position[1] + dy;
    ref.current.position.z = position[2] + dz;
  });

  return (
    <group ref={ref}>
      <Html
        transform
        distanceFactor={6.2}
        sprite
        occlude={false}
      >
        <div
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          className={`w-24 h-24 rounded-xl bg-slate-900/90 border transition-all duration-350 p-2 flex flex-col items-center justify-between shadow-lg select-none cursor-pointer ${
            hovered
              ? 'border-amber-400 scale-115 shadow-[0_0_15px_rgba(245,158,11,0.6)] bg-slate-950 z-50'
              : 'border-slate-800/80 hover:border-slate-700/80'
          }`}
        >
          <img
            src={imageUrl}
            alt={name}
            className="w-11 h-11 rounded-full object-cover border border-slate-700/50"
            loading="lazy"
          />
          <div className="text-center w-full mt-1 overflow-hidden">
            <div className="text-[9px] font-extrabold text-slate-100 truncate">{name}</div>
            <div className="text-[7px] text-amber-500 font-bold truncate uppercase tracking-wider mt-0.5">{role}</div>
          </div>
        </div>
      </Html>
    </group>
  );
}

// ── Sphere Controller (Slow spin + Mouse interactive tilt) ──────────────────
function SphereController({ children }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;

    // Slow ambient rotation
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.04;

    // Responsive tilt on cursor coordinates
    const targetX = state.pointer.x * 0.28;
    const targetY = -state.pointer.y * 0.28;

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetY, 0.08);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetX, 0.08);
  });

  return <group ref={groupRef}>{children}</group>;
}

// ── Main Canvas Component ───────────────────────────────────────────────────
export default function ThreeDGallery() {
  const radius = 5.2;

  // Compute Fibonacci spiral coordinates to distribute cards evenly on a sphere
  const spherePositions = useMemo(() => {
    const positions = [];
    const count = CARDS_DATA.length;
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2; // y ranges from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y); // local circle radius
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      positions.push([x * radius, y * radius, z * radius]);
    }
    return positions;
  }, [radius]);

  return (
    <div className="w-full h-full relative overflow-visible pointer-events-auto">
      {/* Subtle background glow beneath the 3D gallery */}
      <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent blur-3xl pointer-events-none" />
      
      <Canvas
        camera={{ position: [0, 0, 9], fov: 60 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <SphereController>
          {CARDS_DATA.map((card, index) => (
            <FloatingCard
              key={card.id}
              index={index}
              position={spherePositions[index]}
              name={card.name}
              role={card.role}
              imageUrl={card.img}
            />
          ))}
        </SphereController>
      </Canvas>
    </div>
  );
}
