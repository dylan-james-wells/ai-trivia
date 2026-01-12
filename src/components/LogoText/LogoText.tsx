"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useThree, useFrame, createPortal } from "@react-three/fiber";
import { Text3D, Center, Outlines, useFBO } from "@react-three/drei";
import * as THREE from "three";
import {
  Box3,
  Vector3,
  Group,
  PerspectiveCamera,
  NearestFilter,
  MeshStandardMaterial,
  Mesh,
  Scene,
  ShaderMaterial,
  PlaneGeometry,
  OrthographicCamera,
} from "three";

interface ResponsiveHeight {
  base: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

interface LogoTextProps {
  text: string;
  height: number | ResponsiveHeight;
  className?: string;
  rotationDegrees?: number;
  rotationSpeed?: number;
  pixelSize?: number;
  pixelPulseMin?: number;
  pixelPulseMax?: number;
  pixelPulseSpeed?: number;
}

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

function useResponsiveHeight(height: number | ResponsiveHeight): number {
  const [currentHeight, setCurrentHeight] = useState<number>(
    typeof height === "number" ? height : height.base
  );

  useEffect(() => {
    if (typeof height === "number") {
      setCurrentHeight(height);
      return;
    }

    const calculateHeight = () => {
      const width = window.innerWidth;
      if (width >= BREAKPOINTS.xl && height.xl !== undefined) {
        return height.xl;
      }
      if (width >= BREAKPOINTS.lg && height.lg !== undefined) {
        return height.lg;
      }
      if (width >= BREAKPOINTS.md && height.md !== undefined) {
        return height.md;
      }
      if (width >= BREAKPOINTS.sm && height.sm !== undefined) {
        return height.sm;
      }
      return height.base;
    };

    const handleResize = () => {
      setCurrentHeight(calculateHeight());
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [height]);

  return currentHeight;
}

function Text3DContent({
  text,
  rotationDegrees,
  rotationSpeed,
  onFit
}: {
  text: string;
  rotationDegrees: number;
  rotationSpeed: number;
  onFit?: (distance: number) => void;
}) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const rotationGroupRef = useRef<Group>(null);
  const fitted = useRef(false);
  const rotationRadians = (rotationDegrees * Math.PI) / 180;

  const materials = useMemo(() => {
    const faceMaterial = new MeshStandardMaterial({
      color: "#70c0ff",
      metalness: 0.1,
      roughness: 0.4,
    });
    const sideMaterial = new MeshStandardMaterial({
      color: "#5090d0",
      metalness: 0.1,
      roughness: 0.4,
    });
    // TextGeometry uses: [0] = front, [1] = side
    return [faceMaterial, sideMaterial];
  }, []);

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
        const fov = 50 * (Math.PI / 180);
        const distance = (size.y / 2) / Math.tan(fov / 2);
        onFit?.(distance * 1.1);
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
            <Outlines thickness={0.025} color="#001a2a" />
          </Text3D>
        </Center>
      </group>
    </group>
  );
}

function PixelatedScene({
  text,
  rotationDegrees,
  rotationSpeed,
  pixelSize,
  pixelPulseMin,
  pixelPulseMax,
  pixelPulseSpeed
}: {
  text: string;
  rotationDegrees: number;
  rotationSpeed: number;
  pixelSize: number;
  pixelPulseMin?: number;
  pixelPulseMax?: number;
  pixelPulseSpeed?: number;
}) {
  const { gl, size } = useThree();
  const [virtualScene] = useState(() => new Scene());
  const [cameraDistance, setCameraDistance] = useState(5);

  // Determine if we're using pulse animation
  const isPulsing = pixelPulseMin !== undefined && pixelPulseMax !== undefined;
  const pulseMin = pixelPulseMin ?? pixelSize;
  const pulseMax = pixelPulseMax ?? pixelSize;
  const pulseSpeed = pixelPulseSpeed ?? 1;

  // Create perspective camera for the virtual scene
  const virtualCamera = useMemo(() => {
    const cam = new PerspectiveCamera(50, size.width / size.height, 0.1, 1000);
    cam.position.set(0, -0.05, 5);
    cam.lookAt(0, 0.02, 0);
    return cam;
  }, [size.width, size.height]);

  // Create orthographic camera for the screen quad
  const screenCamera = useMemo(() => {
    return new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }, []);

  // Create full-resolution FBO for the scene
  const fbo = useFBO(size.width, size.height, {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
  });

  // Screen quad mesh with pixelation shader
  const screenQuad = useMemo(() => {
    const material = new ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        uResolution: { value: [size.width, size.height] },
        uPixelSize: { value: pixelSize },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 uResolution;
        uniform float uPixelSize;
        varying vec2 vUv;
        void main() {
          vec2 pixelCount = uResolution / uPixelSize;
          vec2 pixelatedUv = floor(vUv * pixelCount) / pixelCount;
          gl_FragColor = texture2D(tDiffuse, pixelatedUv);
        }
      `,
      depthTest: false,
      depthWrite: false,
    });
    const geometry = new PlaneGeometry(2, 2);
    return new Mesh(geometry, material);
  }, [size.width, size.height, pixelSize]);

  // Update virtual camera when text is measured
  useEffect(() => {
    virtualCamera.position.set(0, -0.05, cameraDistance);
    virtualCamera.lookAt(0, 0.02, 0);
    virtualCamera.updateProjectionMatrix();
  }, [cameraDistance, virtualCamera]);

  // Update virtual camera aspect ratio
  useEffect(() => {
    virtualCamera.aspect = size.width / size.height;
    virtualCamera.updateProjectionMatrix();
  }, [size.width, size.height, virtualCamera]);

  useFrame(({ clock }) => {
    // Render virtual scene to FBO
    gl.setRenderTarget(fbo);
    gl.clear();
    gl.render(virtualScene, virtualCamera);
    gl.setRenderTarget(null);

    // Animate pixel size if pulsing
    const material = screenQuad.material as ShaderMaterial;
    if (isPulsing) {
      const t = clock.getElapsedTime() * pulseSpeed;
      // Oscillate between pulseMin and pulseMax using sine wave
      const range = pulseMax - pulseMin;
      const animatedPixelSize = pulseMin + (Math.sin(t) * 0.5 + 0.5) * range;
      material.uniforms.uPixelSize.value = animatedPixelSize;
    }

    // Update screen quad texture
    material.uniforms.tDiffuse.value = fbo.texture;

    // Render screen quad to screen
    gl.autoClear = false;
    gl.clear();
    gl.render(screenQuad, screenCamera);
    gl.autoClear = true;
  }, 1);

  return (
    <>
      {/* Virtual scene rendered to FBO */}
      {createPortal(
        <>
          <ambientLight intensity={1.5} />
          {/* Key light - main light from front center */}
          <pointLight position={[0, 0, 4]} intensity={50} color="#ffffff" />
          {/* Fill light - softer light from left */}
          <pointLight position={[-4, 0, 2]} intensity={20} color="#80b0ff" />
          {/* Fill light - softer light from right */}
          <pointLight position={[4, 0, 2]} intensity={20} color="#80b0ff" />
          <Text3DContent
            text={text}
            rotationDegrees={rotationDegrees}
            rotationSpeed={rotationSpeed}
            onFit={setCameraDistance}
          />
        </>,
        virtualScene
      )}
    </>
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
  const { camera } = useThree();
  const [cameraDistance, setCameraDistance] = useState(5);

  useEffect(() => {
    if (camera instanceof PerspectiveCamera) {
      camera.position.set(0, -0.05, cameraDistance);
      camera.lookAt(0, 0.02, 0);
      camera.updateProjectionMatrix();
    }
  }, [cameraDistance, camera]);

  return (
    <>
      <ambientLight intensity={1.5} />
      {/* Key light - main light from front center */}
      <pointLight position={[0, 0, 4]} intensity={50} color="#ffffff" />
      {/* Fill light - softer light from left */}
      <pointLight position={[-4, 0, 2]} intensity={20} color="#80b0ff" />
      {/* Fill light - softer light from right */}
      <pointLight position={[4, 0, 2]} intensity={20} color="#80b0ff" />
      <Text3DContent
        text={text}
        rotationDegrees={rotationDegrees}
        rotationSpeed={rotationSpeed}
        onFit={setCameraDistance}
      />
    </>
  );
}

export function LogoText({
  text,
  height,
  className = "",
  rotationDegrees = 0,
  rotationSpeed = 0.5,
  pixelSize,
  pixelPulseMin,
  pixelPulseMax,
  pixelPulseSpeed
}: LogoTextProps) {
  const currentHeight = useResponsiveHeight(height);

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: `${currentHeight}px`,
        margin: "0 auto",
      }}
    >
      <Canvas
        camera={{ position: [0, -0.05, 5], fov: 50 }}
        style={{ width: "100%", height: "100%" }}
      >
        {pixelSize ? (
          <PixelatedScene
            text={text}
            rotationDegrees={rotationDegrees}
            rotationSpeed={rotationSpeed}
            pixelSize={pixelSize}
            pixelPulseMin={pixelPulseMin}
            pixelPulseMax={pixelPulseMax}
            pixelPulseSpeed={pixelPulseSpeed}
          />
        ) : (
          <Text3DScene
            text={text}
            rotationDegrees={rotationDegrees}
            rotationSpeed={rotationSpeed}
          />
        )}
      </Canvas>
    </div>
  );
}
