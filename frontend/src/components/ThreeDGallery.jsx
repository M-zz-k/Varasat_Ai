import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// ── 30 Completely Unique AI-Generated Indian Portraits ──────────────────────
const CARDS_DATA = [
  { key: 0,  name: 'Ramesh Kumar',   role: 'Father / Deceased',       img: '/images/portrait_elderly_man.png' },
  { key: 1,  name: 'Priya Sharma',   role: 'Claimant / Wife',          img: '/images/portrait_elderly_woman.png' },
  { key: 2,  name: 'Amit Patel',     role: 'Nominee / Brother',        img: '/images/portrait_middle_man.png' },
  { key: 3,  name: 'Sunita Verma',   role: 'Mother / Beneficiary',     img: '/images/portrait_young_woman.png' },
  { key: 4,  name: 'Rajesh Gupta',   role: 'Co-applicant / Uncle',     img: '/images/portrait_young_man.png' },
  { key: 5,  name: 'Ananya Nair',    role: 'Daughter / Claimant',      img: '/images/portrait_middle_woman.png' },
  { key: 6,  name: 'Vikram Singh',   role: 'Grandfather',              img: '/images/portrait_old_man_2.png' },
  { key: 7,  name: 'Kavita Reddy',   role: 'Sister / Co-heir',         img: '/images/portrait_woman_30s.png' },
  { key: 8,  name: 'Sanjay Mehta',   role: 'Son / Administrator',      img: '/images/portrait_teen_man.png' },
  { key: 9,  name: 'Neha Joshi',     role: 'Wife / Claimant',          img: '/images/portrait_woman_50s.png' },
  { key: 10, name: 'Arjun Sen',      role: 'Son / Nominee',            img: '/images/portrait_man_rural.png' },
  { key: 11, name: 'Aditi Rao',      role: 'Daughter / Legal Heir',    img: '/images/portrait_girl_20s.png' },
  { key: 12, name: 'Vijay Mhatre',   role: 'Father / Deceased',        img: '/images/portrait_13.png' },
  { key: 13, name: 'Meera Deshmukh', role: 'Mother / Nominee',         img: '/images/portrait_14.png' },
  { key: 14, name: 'Rahul Roy',      role: 'Brother / Co-owner',       img: '/images/portrait_15.png' },
  { key: 15, name: 'Divya Iyer',     role: 'Niece / Legal Rep.',       img: '/images/portrait_16.png' },
  { key: 16, name: 'Suresh Menon',   role: 'Grandson / Claimant',      img: '/images/portrait_17.png' },
  { key: 17, name: 'Imran Khan',     role: 'Co-applicant',             img: '/images/portrait_18.png' },
  { key: 18, name: 'Lakshmi Iyer',   role: 'Wife / Beneficiary',       img: '/images/portrait_19.png' },
  { key: 19, name: 'Gopalan Nair',   role: 'Father / Deceased',        img: '/images/portrait_20.png' },
  { key: 20, name: 'Preethi Das',    role: 'Daughter / Claimant',      img: '/images/portrait_21.png' },
  { key: 21, name: 'Rohit Sharma',   role: 'Son / Executor',           img: '/images/portrait_22.png' },
  { key: 22, name: 'Gurpreet Singh', role: 'Grandfather / Nominee',    img: '/images/portrait_23.png' },
  { key: 23, name: 'Sushma Tiwari',  role: 'Aunt / Legal Rep.',        img: '/images/portrait_24.png' },
  { key: 24, name: 'Aditya Kumar',   role: 'Grandson / Claimant',      img: '/images/portrait_25.png' },
  { key: 25, name: 'Kamala Devi',    role: 'Grandmother / Nominee',    img: '/images/portrait_26.png' },
  { key: 26, name: 'Ramakant Joshi', role: 'Uncle / Co-heir',          img: '/images/portrait_27.png' },
  { key: 27, name: 'Dr. Sneha Rao',  role: 'Daughter / Administrator', img: '/images/portrait_28.png' },
  { key: 28, name: 'Adv. Mohan Das', role: 'Legal Executor',           img: '/images/portrait_29.png' },
  { key: 29, name: 'Rohan Biswas',   role: 'Son / Nominee',            img: '/images/portrait_30.png' },
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
          className={`w-24 h-24 rounded-xl bg-slate-900/90 border transition-all duration-500 p-2 flex flex-col items-center justify-between shadow-lg select-none cursor-pointer ${
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

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetY, 0.02);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetX, 0.02);
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
              key={card.key}
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
