"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Text3D, Center } from "@react-three/drei";
import { Box3, Vector3, Group } from "three";

interface LogoTextProps {
  text: string;
  width: number;
  className?: string;
}

function Text3DScene({ text, onBoundsCalculated }: { text: string; onBoundsCalculated: (width: number, height: number) => void }) {
  const groupRef = useRef<Group>(null);
  const [measured, setMeasured] = useState(false);
  const { camera } = useThree();

  useEffect(() => {
    if (groupRef.current && !measured) {
      const box = new Box3().setFromObject(groupRef.current);
      const size = new Vector3();
      box.getSize(size);

      onBoundsCalculated(size.x, size.y);
      setMeasured(true);
    }
  }, [measured, onBoundsCalculated]);

  return (
    <group ref={groupRef}>
      <Center>
        <Text3D
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
          <meshStandardMaterial color="hsl(210, 85%, 65%)" />
        </Text3D>
      </Center>
    </group>
  );
}

export function LogoText({ text, width, className = "" }: LogoTextProps) {
  const [cameraZ, setCameraZ] = useState(5);
  const [aspectRatio, setAspectRatio] = useState(0.3);
  const fov = 50;

  const handleBoundsCalculated = (textWidth: number, textHeight: number) => {
    const vFov = (fov * Math.PI) / 180;
    const containerAspect = width / (width * aspectRatio);
    const textAspect = textWidth / textHeight;

    let distance: number;
    if (textAspect > containerAspect) {
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * containerAspect);
      distance = (textWidth / 2) / Math.tan(hFov / 2);
    } else {
      distance = (textHeight / 2) / Math.tan(vFov / 2);
    }

    const newAspect = textHeight / textWidth;
    setAspectRatio(newAspect);
    setCameraZ(distance * 1.1);
  };

  const height = width * aspectRatio;

  return (
    <div
      className={className}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        margin: "0 auto",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, cameraZ], fov }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Text3DScene text={text} onBoundsCalculated={handleBoundsCalculated} />
      </Canvas>
    </div>
  );
}
