"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useThree, useFrame, createPortal } from "@react-three/fiber";
import { Text3D, Center, Outlines, useFBO } from "@react-three/drei";
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
            <Outlines thickness={0.05} color="#1a0a00" />
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
  pixelSize
}: {
  text: string;
  rotationDegrees: number;
  rotationSpeed: number;
  pixelSize: number;
}) {
  const { gl, size } = useThree();
  const [virtualScene] = useState(() => new Scene());
  const [cameraDistance, setCameraDistance] = useState(5);

  // Create perspective camera for the virtual scene
  const virtualCamera = useMemo(() => {
    const cam = new PerspectiveCamera(50, size.width / size.height, 0.1, 1000);
    cam.position.z = 5;
    return cam;
  }, [size.width, size.height]);

  // Create orthographic camera for the screen quad
  const screenCamera = useMemo(() => {
    return new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }, []);

  // Create low-resolution FBO with nearest-neighbor filtering for pixelation
  const fbo = useFBO(
    Math.floor(size.width / pixelSize),
    Math.floor(size.height / pixelSize),
    {
      minFilter: NearestFilter,
      magFilter: NearestFilter,
    }
  );

  // Screen quad mesh
  const screenQuad = useMemo(() => {
    const material = new ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
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
        varying vec2 vUv;
        void main() {
          gl_FragColor = texture2D(tDiffuse, vUv);
        }
      `,
      depthTest: false,
      depthWrite: false,
    });
    const geometry = new PlaneGeometry(2, 2);
    return new Mesh(geometry, material);
  }, []);

  // Update virtual camera when text is measured
  useEffect(() => {
    virtualCamera.position.z = cameraDistance;
    virtualCamera.updateProjectionMatrix();
  }, [cameraDistance, virtualCamera]);

  // Update virtual camera aspect ratio
  useEffect(() => {
    virtualCamera.aspect = size.width / size.height;
    virtualCamera.updateProjectionMatrix();
  }, [size.width, size.height, virtualCamera]);

  useFrame(() => {
    // Render virtual scene to low-res FBO
    gl.setRenderTarget(fbo);
    gl.clear();
    gl.render(virtualScene, virtualCamera);
    gl.setRenderTarget(null);

    // Update screen quad texture
    (screenQuad.material as ShaderMaterial).uniforms.tDiffuse.value = fbo.texture;

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
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} />
          <OrbitingLight
            color="#ffa050"
            intensity={4}
            radius={3}
            speed={1.6}
            offsetAngle={0}
            yOffset={0.2}
          />
          <OrbitingLight
            color="#ffcc80"
            intensity={3.5}
            radius={2.5}
            speed={2.4}
            offsetAngle={Math.PI}
            yOffset={-0.1}
          />
          <OrbitingLight
            color="#ffffff"
            intensity={3}
            radius={2}
            speed={1.2}
            offsetAngle={Math.PI / 2}
            yOffset={0.3}
          />
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
      camera.position.z = cameraDistance;
      camera.updateProjectionMatrix();
    }
  }, [cameraDistance, camera]);

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <OrbitingLight
        color="#ffa050"
        intensity={4}
        radius={3}
        speed={1.6}
        offsetAngle={0}
        yOffset={0.2}
      />
      <OrbitingLight
        color="#ffcc80"
        intensity={3.5}
        radius={2.5}
        speed={2.4}
        offsetAngle={Math.PI}
        yOffset={-0.1}
      />
      <OrbitingLight
        color="#ffffff"
        intensity={3}
        radius={2}
        speed={1.2}
        offsetAngle={Math.PI / 2}
        yOffset={0.3}
      />
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
  pixelSize
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
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: "100%", height: "100%" }}
      >
        {pixelSize ? (
          <PixelatedScene
            text={text}
            rotationDegrees={rotationDegrees}
            rotationSpeed={rotationSpeed}
            pixelSize={pixelSize}
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
