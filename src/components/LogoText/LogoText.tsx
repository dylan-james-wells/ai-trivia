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
} from "three";

interface LogoTextProps {
  text: string;
  height: number;
  className?: string;
}

function useGradientMaps() {
  return useMemo(() => {
    // Brighter gradient for front face
    const faceColors = new Uint8Array([
      80, 130, 190, 255,   // dark
      120, 170, 230, 255,  // mid
      170, 210, 255, 255,  // light
    ]);
    const faceTexture = new DataTexture(faceColors, 3, 1, RGBAFormat);
    faceTexture.minFilter = NearestFilter;
    faceTexture.magFilter = NearestFilter;
    faceTexture.needsUpdate = true;

    // Darker gradient for sides
    const sideColors = new Uint8Array([
      30, 60, 100, 255,    // dark
      50, 90, 140, 255,    // mid
      80, 120, 170, 255,   // light
    ]);
    const sideTexture = new DataTexture(sideColors, 3, 1, RGBAFormat);
    sideTexture.minFilter = NearestFilter;
    sideTexture.magFilter = NearestFilter;
    sideTexture.needsUpdate = true;

    return { faceTexture, sideTexture };
  }, []);
}

function Text3DScene({ text }: { text: string }) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const { camera } = useThree();
  const fitted = useRef(false);
  const { faceTexture, sideTexture } = useGradientMaps();

  const materials = useMemo(() => {
    const faceMaterial = new MeshToonMaterial({
      color: "#7ac0ff",
      gradientMap: faceTexture,
    });
    const sideMaterial = new MeshToonMaterial({
      color: "#4a80c0",
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

  useFrame(() => {
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
  });

  return (
    <group ref={groupRef}>
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
          <Outlines thickness={0.035} color="#0a1a2c" />
        </Text3D>
      </Center>
    </group>
  );
}

export function LogoText({ text, height, className = "" }: LogoTextProps) {
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
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <directionalLight position={[-3, 2, 3]} intensity={0.5} />
        <Text3DScene text={text} />
      </Canvas>
    </div>
  );
}
