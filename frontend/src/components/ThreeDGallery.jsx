import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// ── Curated Indian Portraits from Generated Resources ─────────────────────────
const imgMaleOld = '/images/indian_elderly_man_1781537126837.png';
const imgFemaleOld = '/images/indian_elderly_woman_1781537142103.png';
const imgMaleFarmer = '/images/indian_farmer_1_1781537096711.png';
const imgFemaleAdult = '/images/indian_farmer_2_1781537111005.png';
const imgMaleAdult = '/images/indian_man_rural_1781537155398.png';
const imgFamily = '/images/indian_family_rural_1781537170620.png';

const CARDS_DATA = [
  { id: 1, name: 'Ramesh Kumar', role: 'Father / Deceased', img: imgMaleOld },
  { id: 2, name: 'Priya Sharma', role: 'Claimant / Wife', img: imgFemaleAdult },
  { id: 3, name: 'Amit Patel', role: 'Nominee / Brother', img: imgMaleAdult },
  { id: 4, name: 'Sunita Verma', role: 'Mother / Beneficiary', img: imgFemaleOld },
  { id: 5, name: 'Rajesh Gupta', role: 'Co-applicant / Uncle', img: imgMaleFarmer },
  { id: 6, name: 'Ananya Nair', role: 'Daughter / Claimant', img: imgFemaleAdult },
  { id: 7, name: 'Vikram Singh', role: 'Grandfather', img: imgMaleOld },
  { id: 8, name: 'Kavita Reddy', role: 'Sister / Co-heir', img: imgFemaleAdult },
  { id: 9, name: 'Sanjay Mehta', role: 'Son / Administrator', img: imgMaleAdult },
  { id: 10, name: 'Neha Joshi', role: 'Wife / Claimant', img: imgFemaleAdult },
  { id: 11, name: 'Arjun Sen', role: 'Son / Nominee', img: imgMaleFarmer },
  { id: 12, name: 'Aditi Rao', role: 'Daughter / Legal Heir', img: imgFamily },
  { id: 13, name: 'Vijay Mhatre', role: 'Father / Deceased', img: imgMaleOld },
  { id: 14, name: 'Meera Deshmukh', role: 'Mother / Nominee', img: imgFemaleOld },
  { id: 15, name: 'Rahul Roy', role: 'Brother / Co-owner', img: imgMaleAdult },
  { id: 16, name: 'Divya Iyer', role: 'Niece / Legal Representative', img: imgFemaleAdult },
  { id: 17, name: 'Suresh Menon', role: 'Grandson / Claimant', img: imgMaleAdult },
  { id: 18, name: 'Swati Pillai', role: 'Daughter-in-law', img: imgFemaleAdult },
  { id: 19, name: 'Deepak Saxena', role: 'Cousin / Executor', img: imgMaleFarmer },
  { id: 20, name: 'Ritu Kapoor', role: 'Aunt / Nominee', img: imgFemaleOld },
  { id: 21, name: 'Manish Pandey', role: 'Son / Legal Heir', img: imgMaleAdult },
  { id: 22, name: 'Sonia Gandhi', role: 'Wife / Beneficiary', img: imgFemaleAdult },
  { id: 23, name: 'Karan Johar', role: 'Brother / Executor', img: imgMaleAdult },
  { id: 24, name: 'Alia Bhatt', role: 'Daughter / Claimant', img: imgFemaleAdult },
  { id: 25, name: 'Ranbir Singh', role: 'Husband / Nominee', img: imgFamily },
  { id: 26, name: 'Deepika P.', role: 'Wife / Nominee', img: imgFemaleAdult },
  { id: 27, name: 'Saif Ali', role: 'Father / Deceased', img: imgMaleOld },
  { id: 28, name: 'Kareena K.', role: 'Sister / Co-heir', img: imgFamily },
  { id: 29, name: 'Hrithik R.', role: 'Son / Administrator', img: imgMaleAdult },
  { id: 30, name: 'Katrina K.', role: 'Wife / Claimant', img: imgFemaleAdult },
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
