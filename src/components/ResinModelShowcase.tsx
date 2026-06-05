"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

type TrackedMaterial = THREE.MeshPhysicalMaterial & {
  userData: {
    materialPhase?: number;
  };
};

const MODEL_URL = "/models/lovepuzzle.glb";
const flowColor = new THREE.Color();
const paletteColor = new THREE.Color();

const iridescentPalette = [
  "#fff7fb",
  "#ffd6eb",
  "#ff8bd1",
  "#ff5aad",
  "#ff776d",
  "#ffad4f",
  "#ffe066",
  "#d6ff62",
  "#86f26b",
  "#40e686",
  "#2ee6c9",
  "#31f4ff",
  "#42c8ff",
  "#5b94ff",
  "#806cff",
  "#a55cff",
  "#d75cff",
  "#ff6fec",
  "#ffc0f2",
  "#ffffff",
  "#d9ad58",
  "#f7f2d1",
].map((color) => new THREE.Color(color));

function isMesh(object: THREE.Object3D): object is THREE.Mesh {
  return (object as THREE.Mesh).isMesh === true;
}

function createShowcaseMaterial() {
  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#14c7ee"),
    transparent: true,
    opacity: 1,
    roughness: 0.14,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    emissive: new THREE.Color("#0a95c0"),
    emissiveIntensity: 0.34,
    envMapIntensity: 2.2,
    ior: 1.45,
    sheen: 0,
    sheenColor: new THREE.Color("#f5b5d8"),
    sheenRoughness: 0.82,
    depthWrite: false,
    thickness: 0.22,
    transmission: 0,
    side: THREE.DoubleSide,
  }) as TrackedMaterial;

  material.userData.materialPhase = 0;
  return material;
}

function samplePalette(time: number) {
  const scaled = ((time % iridescentPalette.length) + iridescentPalette.length) % iridescentPalette.length;
  const currentIndex = Math.floor(scaled);
  const nextIndex = (currentIndex + 1) % iridescentPalette.length;
  const blend = THREE.MathUtils.smoothstep(scaled - currentIndex, 0, 1);
  return paletteColor.lerpColors(iridescentPalette[currentIndex], iridescentPalette[nextIndex], blend);
}

const materialLooks = [
  {
    color: new THREE.Color("#eefcff"),
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    emissive: new THREE.Color("#66e8ff"),
    emissiveIntensity: 0.34,
    envMapIntensity: 2.8,
    metalness: 0,
    roughness: 0.04,
    sheen: 0,
    sheenColor: new THREE.Color("#ffffff"),
    sheenRoughness: 0.6,
  },
  {
    color: new THREE.Color("#d9ad58"),
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    emissive: new THREE.Color("#2b1a04"),
    emissiveIntensity: 0.05,
    envMapIntensity: 3.2,
    metalness: 0.92,
    roughness: 0.18,
    sheen: 0,
    sheenColor: new THREE.Color("#ffffff"),
    sheenRoughness: 0.7,
  },
  {
    color: new THREE.Color("#37e8ff"),
    clearcoat: 0.65,
    clearcoatRoughness: 0.18,
    emissive: new THREE.Color("#ff64f2"),
    emissiveIntensity: 0.52,
    envMapIntensity: 2.2,
    metalness: 0,
    roughness: 0.16,
    sheen: 1,
    sheenColor: new THREE.Color("#ffec70"),
    sheenRoughness: 0.28,
  },
  {
    color: new THREE.Color("#f2f7fb"),
    clearcoat: 0.65,
    clearcoatRoughness: 0.82,
    emissive: new THREE.Color("#dcecf5"),
    emissiveIntensity: 0.18,
    envMapIntensity: 0.95,
    metalness: 0,
    roughness: 0.88,
    sheen: 0,
    sheenColor: new THREE.Color("#ffffff"),
    sheenRoughness: 0.7,
  },
  {
    color: new THREE.Color("#f26ab9"),
    clearcoat: 0.1,
    clearcoatRoughness: 0.76,
    emissive: new THREE.Color("#7d1d55"),
    emissiveIntensity: 0.18,
    envMapIntensity: 0.58,
    metalness: 0,
    roughness: 0.94,
    sheen: 1,
    sheenColor: new THREE.Color("#ffd6ef"),
    sheenRoughness: 0.9,
  },
];

type ResinModelShowcaseProps = {
  className?: string;
  framed?: boolean;
  showCaption?: boolean;
};

export function ResinModelShowcase({ className = "", framed = true, showCaption = true }: ResinModelShowcaseProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [useStaticFallback, setUseStaticFallback] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    if (window.matchMedia("(max-width: 1023px)").matches) {
      return;
    }

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0.15, 6.2);

    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
    } catch {
      try {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: false,
          powerPreference: "low-power",
        });
      } catch {
        const errorFrame = window.requestAnimationFrame(() => setUseStaticFallback(true));
        return () => window.cancelAnimationFrame(errorFrame);
      }
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.4));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.16;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.width = "100%";
    mount.appendChild(renderer.domElement);

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(3.8, 4.5, 4.6);
    keyLight.castShadow = false;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x9ceaff, 1.8);
    rimLight.position.set(-3.2, 1.8, 2.2);
    scene.add(rimLight);
    const softFill = new THREE.PointLight(0xffd1ef, 1.2, 8);
    softFill.position.set(0, -1.2, 3.2);
    scene.add(softFill);
    scene.add(new THREE.HemisphereLight(0xe9f8ff, 0xf2dbff, 2.1));

    const trackedMaterials: TrackedMaterial[] = [];
    const showcaseMaterial = createShowcaseMaterial();
    trackedMaterials.push(showcaseMaterial);
    const loader = new GLTFLoader();
    let modelRoot: THREE.Object3D | null = null;
    let pointerX = 0;
    let pointerY = 0;
    let smoothX = 0;
    let smoothY = 0;
    let frameId = 0;
    let disposed = false;
    const onPointerMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const onPointerLeave = () => {
      pointerX = 0;
      pointerY = 0;
    };

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    mount.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("pointerleave", onPointerLeave);

    loader.load(
      MODEL_URL,
      (gltf) => {
        if (disposed) return;

        modelRoot = gltf.scene;
        const meshes: THREE.Mesh[] = [];
        modelRoot.traverse((object) => {
          if (isMesh(object)) meshes.push(object);
        });

        const visibleMeshes = meshes;

        const box = new THREE.Box3();
        visibleMeshes.forEach((mesh) => {
          mesh.geometry.computeBoundingBox();
          const meshBox = mesh.geometry.boundingBox?.clone();
          if (!meshBox) return;
          mesh.updateWorldMatrix(true, false);
          meshBox.applyMatrix4(mesh.matrixWorld);
          box.union(meshBox);
        });

        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);

        modelRoot.position.sub(center);
        const maxAxis = Math.max(size.x, size.y, size.z);
        const scale = maxAxis > 0 ? 2.35 / maxAxis : 1;
        modelRoot.scale.setScalar(scale);
        modelRoot.rotation.set(-0.18, -0.2, 0.05);

        visibleMeshes.forEach((object) => {
          object.castShadow = true;
          object.receiveShadow = true;
          object.material = showcaseMaterial;
        });

        modelGroup.add(modelRoot);
        setLoadError(false);
        setIsLoaded(true);
      },
      (event) => {
        if (!event.total) return;
        setProgress(Math.round((event.loaded / event.total) * 100));
      },
      () => {
        setLoadError(true);
      },
    );

    const animate = (time: number) => {
      smoothX += (pointerX - smoothX) * 0.06;
      smoothY += (pointerY - smoothY) * 0.06;

      const seconds = time * 0.001;
      modelGroup.rotation.y = Math.sin(seconds * 0.32) * 0.09 + smoothX * 0.32;
      modelGroup.rotation.x = -0.06 + smoothY * 0.16;
      modelGroup.position.y = Math.sin(seconds * 0.72) * 0.035;

      trackedMaterials.forEach((material) => {
        const phase = (seconds * 0.26) % materialLooks.length;
        const currentIndex = Math.floor(phase);
        const nextIndex = (currentIndex + 1) % materialLooks.length;
        const blend = THREE.MathUtils.smoothstep(phase - currentIndex, 0, 1);
        const current = materialLooks[currentIndex];
        const next = materialLooks[nextIndex];
        const shimmer = (Math.sin(seconds * 1.25) + 1) / 2;

        flowColor.copy(samplePalette(seconds * 2.25 + Math.sin(seconds * 0.8) * 1.6));
        material.color.lerpColors(current.color, next.color, blend).lerp(flowColor, 0.34 + shimmer * 0.22);
        material.emissive.lerpColors(current.emissive, next.emissive, blend).lerp(flowColor, 0.55);
        material.metalness = THREE.MathUtils.lerp(current.metalness, next.metalness, blend);
        material.roughness = THREE.MathUtils.lerp(current.roughness, next.roughness, blend);
        material.clearcoat = THREE.MathUtils.lerp(current.clearcoat, next.clearcoat, blend);
        material.clearcoatRoughness = Math.max(0.02, THREE.MathUtils.lerp(current.clearcoatRoughness, next.clearcoatRoughness, blend) - shimmer * 0.05);
        material.emissiveIntensity = THREE.MathUtils.lerp(current.emissiveIntensity, next.emissiveIntensity, blend) + shimmer * 0.26;
        material.envMapIntensity = THREE.MathUtils.lerp(current.envMapIntensity, next.envMapIntensity, blend) + shimmer * 0.8;
        material.sheen = Math.min(1, THREE.MathUtils.lerp(current.sheen, next.sheen, blend) + 0.45 + shimmer * 0.28);
        material.sheenColor.lerpColors(current.sheenColor, next.sheenColor, blend).lerp(flowColor, 0.7);
        material.sheenRoughness = Math.max(0.12, THREE.MathUtils.lerp(current.sheenRoughness, next.sheenRoughness, blend) - shimmer * 0.18);
        const glassAmount = Math.max(0, 1 - Math.abs(phase - 0) / 1.1, 1 - Math.abs(phase - materialLooks.length) / 1.1);
        material.opacity = THREE.MathUtils.lerp(0.98, 0.46, glassAmount);
        material.transmission = THREE.MathUtils.lerp(0.02, 0.32, glassAmount);
        material.thickness = THREE.MathUtils.lerp(0.2, 0.72, glassAmount);
        material.ior = THREE.MathUtils.lerp(1.44, 1.5, glassAmount);
      });

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };
    frameId = window.requestAnimationFrame(animate);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerleave", onPointerLeave);
      renderer.domElement.remove();
      renderer.dispose();
      trackedMaterials.forEach((material) => material.dispose());
      modelRoot?.traverse((object) => {
        if (isMesh(object)) object.geometry.dispose();
      });
    };
  }, [retryKey]);

  return (
    <div
      className={`relative min-h-[min(68vw,560px)] overflow-hidden ${
        framed ? "rounded-[30px] border border-[#aacde2] bg-[#dff3ff] shadow-[0_24px_70px_rgba(54,100,134,0.18)]" : "bg-transparent"
      } ${className}`}
    >
      <div ref={mountRef} className="resin-showcase-canvas absolute inset-0 z-10 cursor-grab active:cursor-grabbing" />
      <Image
        alt="Resin pieces with soft handmade colors"
        className="resin-showcase-mobile-fallback absolute inset-0 z-20 h-full w-full object-cover"
        fill
        sizes="100vw"
        src="/assets/resin-collection.png"
        style={useStaticFallback ? { display: "block" } : undefined}
      />
      {!isLoaded && !loadError && !useStaticFallback && (
        <div className="resin-showcase-loader absolute inset-0 z-20 grid place-items-center text-center">
          <div className="rounded-full border border-white/60 bg-white/70 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#5f819d] shadow-sm">
            Loading model {progress > 0 ? `${progress}%` : ""}
          </div>
        </div>
      )}
      {loadError && !isLoaded ? (
        <div className="resin-showcase-error absolute inset-0 z-20 hidden place-items-center text-center lg:grid">
          <div className="max-w-xs">
            <p className="text-sm font-semibold text-[#566c71]">The 3D model could not load.</p>
            <button
              type="button"
              onClick={() => {
                setProgress(0);
                setIsLoaded(false);
                setLoadError(false);
                setRetryKey((current) => current + 1);
              }}
              className="mt-4 rounded-full border border-[#aacde2] bg-white/80 px-5 py-2 text-sm font-semibold text-[#2d3842] shadow-sm"
            >
              Retry 3D
            </button>
          </div>
        </div>
      ) : null}
      {showCaption && (
        <div className="pointer-events-none absolute bottom-8 right-8 z-20 text-right text-[0.62rem] font-bold uppercase tracking-[0.32em] text-[#6791b8]">
          Resin material
          <br />
          motion study
        </div>
      )}
    </div>
  );
}
