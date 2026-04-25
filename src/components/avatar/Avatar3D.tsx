import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useStore } from '../../lib/store';
import * as THREE from 'three';

function Avatar3DModel() {
  const meshRef = useRef<THREE.Group>(null);
  const { state } = useStore();
  const { userBody, avatarGender } = state;

  // Calculate body proportions
  const proportions = useMemo(() => {
    return {
      height: userBody.height / 175,
      shoulderWidth: userBody.shoulders / 45,
      waistWidth: userBody.waist / 80,
      hipWidth: userBody.hips / 95,
      isMale: avatarGender === 'male',
    };
  }, [userBody, avatarGender]);

  // Gentle rotation animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  // Mannequin colors - elegant white/cream
  const mannequinColor = '#fafafa';
  const accentColor = '#4f46e5';

  // Create smooth mannequin body using merged geometries
  const shoulderW = 0.45 * proportions.shoulderWidth;
  const waistW = 0.32 * proportions.waistWidth;
  const hipW = 0.38 * proportions.hipWidth;
  const torsoHeight = 0.9;
  const legLength = 1.1;

  return (
    <group ref={meshRef}>
      {/* Head - Smooth sphere */}
      <mesh position={[0, 2.55, 0]} castShadow>
        <sphereGeometry args={[0.22, 64, 64]} />
        <meshStandardMaterial 
          color={mannequinColor} 
          roughness={0.15} 
          metalness={0.05}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Neck - Smooth cylinder */}
      <mesh position={[0, 2.28, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 0.2, 32]} />
        <meshStandardMaterial color={mannequinColor} roughness={0.15} metalness={0.05} />
      </mesh>

      {/* Upper Torso - Chest area */}
      <mesh position={[0, 1.95, 0]} castShadow>
        <boxGeometry 
          args={[shoulderW, 0.4, 0.22]} 
        />
        <meshStandardMaterial color={mannequinColor} roughness={0.15} metalness={0.05} />
      </mesh>

      {/* Mid Torso */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <boxGeometry 
          args={[(shoulderW + waistW) / 2, 0.35, 0.2]} 
        />
        <meshStandardMaterial color={mannequinColor} roughness={0.15} metalness={0.05} />
      </mesh>

      {/* Waist */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <boxGeometry 
          args={[waistW, 0.3, 0.18]} 
        />
        <meshStandardMaterial color={mannequinColor} roughness={0.15} metalness={0.05} />
      </mesh>

      {/* Hips */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry 
          args={[hipW, 0.35, 0.2]} 
        />
        <meshStandardMaterial color={mannequinColor} roughness={0.15} metalness={0.05} />
      </mesh>

      {/* Left Shoulder */}
      <mesh position={[-shoulderW / 2 - 0.05, 2.05, 0]} castShadow>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial color={mannequinColor} roughness={0.15} metalness={0.05} />
      </mesh>

      {/* Right Shoulder */}
      <mesh position={[shoulderW / 2 + 0.05, 2.05, 0]} castShadow>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial color={mannequinColor} roughness={0.15} metalness={0.05} />
      </mesh>

      {/* Left Upper Arm */}
      <mesh position={[-shoulderW / 2 - 0.08, 1.75, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.05, 0.55, 24]} />
        <meshStandardMaterial color={mannequinColor} roughness={0.15} metalness={0.05} />
      </mesh>

      {/* Right Upper Arm */}
      <mesh position={[shoulderW / 2 + 0.08, 1.75, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.05, 0.55, 24]} />
        <meshStandardMaterial color={mannequinColor} roughness={0.15} metalness={0.05} />
      </mesh>

      {/* Left Forearm */}
      <mesh position={[-shoulderW / 2 - 0.09, 1.35, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.04, 0.5, 24]} />
        <meshStandardMaterial color={mannequinColor} roughness={0.15} metalness={0.05} />
      </mesh>

      {/* Right Forearm */}
      <mesh position={[shoulderW / 2 + 0.09, 1.35, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.04, 0.5, 24]} />
        <meshStandardMaterial color={mannequinColor} roughness={0.15} metalness={0.05} />
      </mesh>

      {/* Left Hand */}
      <mesh position={[-shoulderW / 2 - 0.09, 1.05, 0]} castShadow>
        <sphereGeometry args={[0.045, 24, 24]} />
        <meshStandardMaterial color={mannequinColor} roughness={0.15} metalness={0.05} />
      </mesh>

      {/* Right Hand */}
      <mesh position={[shoulderW / 2 + 0.09, 1.05, 0]} castShadow>
        <sphereGeometry args={[0.045, 24, 24]} />
        <meshStandardMaterial color={mannequinColor} roughness={0.15} metalness={0.05} />
      </mesh>

      {/* Left Upper Leg */}
      <mesh position={[-0.13, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.075, 0.65, 32]} />
        <meshStandardMaterial color={mannequinColor} roughness={0.15} metalness={0.05} />
      </mesh>

      {/* Right Upper Leg */}
      <mesh position={[0.13, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.075, 0.65, 32]} />
        <meshStandardMaterial color={mannequinColor} roughness={0.15} metalness={0.05} />
      </mesh>

      {/* Left Lower Leg */}
      <mesh position={[-0.13, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.055, 0.6, 32]} />
        <meshStandardMaterial color={mannequinColor} roughness={0.15} metalness={0.05} />
      </mesh>

      {/* Right Lower Leg */}
      <mesh position={[0.13, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.055, 0.6, 32]} />
        <meshStandardMaterial color={mannequinColor} roughness={0.15} metalness={0.05} />
      </mesh>

      {/* Left Foot */}
      <mesh position={[-0.13, -0.1, 0.05]} castShadow>
        <boxGeometry args={[0.1, 0.08, 0.22]} />
        <meshStandardMaterial color={mannequinColor} roughness={0.15} metalness={0.05} />
      </mesh>

      {/* Right Foot */}
      <mesh position={[0.13, -0.1, 0.05]} castShadow>
        <boxGeometry args={[0.1, 0.08, 0.22]} />
        <meshStandardMaterial color={mannequinColor} roughness={0.15} metalness={0.05} />
      </mesh>

      {/* Measurement accent rings - Glowing */}
      <mesh position={[0, 1.95, 0.12]}>
        <torusGeometry args={[shoulderW / 2 + 0.02, 0.008, 16, 64]} />
        <meshStandardMaterial 
          color={accentColor} 
          emissive={accentColor} 
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>

      <mesh position={[0, 1.45, 0.1]}>
        <torusGeometry args={[waistW / 2 + 0.02, 0.008, 16, 64]} />
        <meshStandardMaterial 
          color={accentColor} 
          emissive={accentColor} 
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>

      <mesh position={[0, 1.15, 0.11]}>
        <torusGeometry args={[hipW / 2 + 0.02, 0.008, 16, 64]} />
        <meshStandardMaterial 
          color={accentColor} 
          emissive={accentColor} 
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Base platform - Elegant */}
      <mesh position={[0, -0.18, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.2, 64]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Center pole */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 2.4, 16]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  );
}

interface Avatar3DProps {
  className?: string;
}

export function Avatar3D({ className = '' }: Avatar3DProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 45 }}
        style={{ background: 'transparent' }}
        shadows
      >
        {/* Enhanced Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[5, 8, 5]} 
          intensity={1.2} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
        <pointLight position={[0, 4, 4]} intensity={0.6} color="#4f46e5" />
        <pointLight position={[3, 2, 3]} intensity={0.3} color="#ffffff" />
        <hemisphereLight color="#ffffff" groundColor="#f1f5f9" intensity={0.4} />

        {/* 3D Model */}
        <Avatar3DModel />

        {/* Controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={8}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
          autoRotate={false}
          enableDamping
          dampingFactor={0.05}
        />

        {/* Ground shadow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.17, 0]} receiveShadow>
          <circleGeometry args={[1, 32]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.08} />
        </mesh>
      </Canvas>
    </div>
  );
}
