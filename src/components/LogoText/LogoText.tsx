"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Text3D, Center, Outlines } from "@react-three/drei";
import {
  Box3,
  Vector3,
  Group,
  PerspectiveCamera,
  DataTexture,
  RGBAFormat,
  NearestFilter,
  MeshToonMaterial,
  Mesh,
  PointLight,
} from "three";

interface LogoTextProps {
  text: string;
  height: number;
  className?: string;
  rotationDegrees?: number;
  rotationSpeed?: number;
}

function useGradientMaps() {
  return useMemo(() => {
    // Brighter gradient for front face (orange)
    const faceColors = new Uint8Array([
      180, 100, 50, 255,   // dark orange
      230, 150, 80, 255,   // mid orange
      255, 200, 130, 255,  // light orange
    ]);
    const faceTexture = new DataTexture(faceColors, 3, 1, RGBAFormat);
    faceTexture.minFilter = NearestFilter;
    faceTexture.magFilter = NearestFilter;
    faceTexture.needsUpdate = true;

    // Darker gradient for sides (darker orange/brown)
    const sideColors = new Uint8Array([
      100, 50, 20, 255,    // dark
      140, 70, 30, 255,    // mid
      180, 100, 50, 255,   // light
    ]);
    const sideTexture = new DataTexture(sideColors, 3, 1, RGBAFormat);
    sideTexture.minFilter = NearestFilter;
    sideTexture.magFilter = NearestFilter;
    sideTexture.needsUpdate = true;

    return { faceTexture, sideTexture };
  }, []);
}

function OrbitingLight({
  color,
  intensity,
  radius,
  speed,
  offsetAngle = 0,
  yOffset = 0
}: {
  color: string;
  intensity: number;
  radius: number;
  speed: number;
  offsetAngle?: number;
  yOffset?: number;
}) {
  const lightRef = useRef<PointLight>(null);

  useFrame(({ clock }) => {
    if (lightRef.current) {
      const t = clock.getElapsedTime() * speed + offsetAngle;
      lightRef.current.position.x = Math.cos(t) * radius;
      lightRef.current.position.y = Math.sin(t * 0.5) * 0.5 + yOffset;
      lightRef.current.position.z = Math.sin(t) * radius + 1;
    }
  });

  return (
    <pointLight
      ref={lightRef}
      color={color}
      intensity={intensity}
      distance={8}
      decay={2}
    />
  );
}

function Text3DScene({
  text,
  rotationDegrees,
  rotationSpeed
}: {
  text: string;
  rotationDegrees: number;
  rotationSpeed: number;
}) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const rotationGroupRef = useRef<Group>(null);
  const { camera } = useThree();
  const fitted = useRef(false);
  const { faceTexture, sideTexture } = useGradientMaps();
  const rotationRadians = (rotationDegrees * Math.PI) / 180;

  const materials = useMemo(() => {
    const faceMaterial = new MeshToonMaterial({
      color: "#ffc070",
      gradientMap: faceTexture,
    });
    const sideMaterial = new MeshToonMaterial({
      color: "#c07030",
      gradientMap: sideTexture,
    });
    // TextGeometry uses: [0] = front, [1] = side
    return [faceMaterial, sideMaterial];
  }, [faceTexture, sideTexture]);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.material = materials;
    }
  }, [materials]);

  useFrame(({ clock }) => {
    if (groupRef.current && !fitted.current) {
      const box = new Box3().setFromObject(groupRef.current);
      const size = new Vector3();
      box.getSize(size);

      if (size.x > 0) {
        const perspCam = camera as PerspectiveCamera;
        const fov = perspCam.fov * (Math.PI / 180);

        const distance = (size.y / 2) / Math.tan(fov / 2);
        camera.position.z = distance * 1.1;
        camera.updateProjectionMatrix();
        fitted.current = true;
      }
    }

    if (rotationGroupRef.current) {
      const t = clock.getElapsedTime() * rotationSpeed;
      rotationGroupRef.current.rotation.y = Math.sin(t) * rotationRadians;
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={rotationGroupRef}>
        <Center>
          <Text3D
            ref={meshRef}
            font="/Play_Bold.json"
            size={1}
            height={0.2}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={5}
          >
            {text}
            <Outlines thickness={0.05} color="#1a0a00" />
          </Text3D>
        </Center>
      </group>
    </group>
  );
}

export function LogoText({
  text,
  height,
  className = "",
  rotationDegrees = 1,
  rotationSpeed = 0.5
}: LogoTextProps) {
  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: `${height}px`,
        margin: "0 auto",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        {/* Orbiting lights */}
        <OrbitingLight
          color="#ffa050"
          intensity={3}
          radius={3}
          speed={0.8}
          offsetAngle={0}
          yOffset={0.2}
        />
        <OrbitingLight
          color="#ffcc80"
          intensity={2.5}
          radius={2.5}
          speed={1.2}
          offsetAngle={Math.PI}
          yOffset={-0.1}
        />
        <OrbitingLight
          color="#ffffff"
          intensity={2}
          radius={2}
          speed={0.6}
          offsetAngle={Math.PI / 2}
          yOffset={0.3}
        />

        <Text3DScene
          text={text}
          rotationDegrees={rotationDegrees}
          rotationSpeed={rotationSpeed}
        />
      </Canvas>
    </div>
  );
}
