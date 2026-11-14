"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FlameSafeMascotFallback } from "./FlameSafeMascotFallback";

interface FlameSafe3DHeroSceneProps {
  className?: string;
}

function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * Interactive 3D "Astro-Flame Bot" Mascot matching the reference storyboard:
 * - Rounded white futuristic astronaut helmet
 * - Dark glossy black visor screen (#040814)
 * - Two glowing cyan-blue vertical rounded-pill LED eyes (#00B8FF) + glowing cyan LED smile
 * - Dual-color flame & plasma crown (orange-gold #FF7A18/#FFB547 base + electric cyan-blue #00B8FF plasma tips)
 * - White space suit with glowing cyan chest ring emblem, floating above Earth's glowing horizon
 *   with golden-orange and cyan orbital light arcs.
 */
export const FlameSafe3DHeroScene: React.FC<FlameSafe3DHeroSceneProps> = ({
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [useFallback, setUseFallback] = useState<boolean>(false);
  const [sceneReady, setSceneReady] = useState<boolean>(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !isWebGLAvailable()) {
      setUseFallback(true);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const isMobile = window.innerWidth < 768;
    const width = Math.max(container.clientWidth, 300);
    const height = Math.max(container.clientHeight, 340);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isMobile,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      setUseFallback(true);
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.05, isMobile ? 6.8 : 5.7);
    camera.lookAt(0, 0.85, 0);

    // ------------------------------------------------------------------
    // LIGHTING: Cyan LED Visor Glow + Warm Flame & Orbital Rim Lighting
    // ------------------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.75);
    keyLight.position.set(3.2, 5.0, 4.5);
    scene.add(keyLight);

    const flameTopLight = new THREE.PointLight(0xff7a18, 4.2, 9);
    flameTopLight.position.set(-0.2, 2.45, 1.2);
    scene.add(flameTopLight);

    const cyanVisorLight = new THREE.PointLight(0x00b8ff, 3.8, 10);
    cyanVisorLight.position.set(0.4, 1.3, 2.2);
    scene.add(cyanVisorLight);

    const disposables: Array<{ dispose: () => void }> = [];
    const track = <T extends { dispose: () => void }>(item: T): T => {
      disposables.push(item);
      return item;
    };

    // ------------------------------------------------------------------
    // ENVIRONMENT: Glowing Earth Horizon, Golden Orbital Arcs & Stars
    // ------------------------------------------------------------------
    const starCount = isMobile ? 90 : 180;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 20;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 12 + 1.0;
      starPositions[i * 3 + 2] = -3.0 - Math.random() * 10;
    }
    const starGeo = track(new THREE.BufferGeometry());
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMat = track(
      new THREE.PointsMaterial({
        color: 0xf8fafc,
        size: 0.048,
        transparent: true,
        opacity: 0.78,
      })
    );
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Glowing Blue-and-Gold Earth Horizon Below Mascot
    const earthGroup = new THREE.Group();
    earthGroup.position.set(-0.15, -3.55, -3.4);
    const earthGeo = track(new THREE.SphereGeometry(3.35, 44, 44));
    const earthMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x0b4ea8,
        emissive: 0x05285e,
        emissiveIntensity: 0.72,
        roughness: 0.5,
        metalness: 0.15,
      })
    );
    earthGroup.add(new THREE.Mesh(earthGeo, earthMat));

    const atmoRimGeo = track(new THREE.TorusGeometry(3.38, 0.035, 16, 84));
    const atmoRimMat = track(
      new THREE.MeshBasicMaterial({
        color: 0x39b9eb,
        transparent: true,
        opacity: 0.65,
      })
    );
    const atmoRim = new THREE.Mesh(atmoRimGeo, atmoRimMat);
    atmoRim.rotation.x = Math.PI / 2.1;
    earthGroup.add(atmoRim);
    scene.add(earthGroup);

    // Golden-Orange & Cyan Orbital Swirl Rings Behind Mascot
    const goldenOrbitGeo = track(new THREE.TorusGeometry(2.15, 0.014, 12, 96));
    const goldenOrbitMat = track(
      new THREE.MeshBasicMaterial({
        color: 0xff7a18,
        transparent: true,
        opacity: 0.55,
      })
    );
    const goldenOrbit = new THREE.Mesh(goldenOrbitGeo, goldenOrbitMat);
    goldenOrbit.position.set(0, 1.0, -0.5);
    goldenOrbit.rotation.x = 1.15;
    goldenOrbit.rotation.y = -0.38;
    scene.add(goldenOrbit);

    const cyanOrbitGeo = track(new THREE.TorusGeometry(1.85, 0.012, 12, 96));
    const cyanOrbitMat = track(
      new THREE.MeshBasicMaterial({
        color: 0x00b8ff,
        transparent: true,
        opacity: 0.45,
      })
    );
    const cyanOrbit = new THREE.Mesh(cyanOrbitGeo, cyanOrbitMat);
    cyanOrbit.position.set(0, 1.0, -0.35);
    cyanOrbit.rotation.x = 1.25;
    cyanOrbit.rotation.y = 0.32;
    scene.add(cyanOrbit);

    // ------------------------------------------------------------------
    // ASTRO-FLAME BOT 3D CHARACTER
    // ------------------------------------------------------------------
    const mascotRoot = new THREE.Group();
    mascotRoot.position.set(-0.08, 0.28, 0.2);
    mascotRoot.rotation.z = -0.08; // Dynamic floating tilt like reference image
    scene.add(mascotRoot);

    const suitWhiteMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xf4f7fb,
        roughness: 0.2,
        metalness: 0.12,
      })
    );
    const darkJointMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x111a2e,
        roughness: 0.32,
        metalness: 0.55,
      })
    );
    const visorScreenMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x030712,
        roughness: 0.08,
        metalness: 0.4,
      })
    );
    const cyanLedMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x00b8ff,
        emissive: 0x00b8ff,
        emissiveIntensity: 2.3,
        roughness: 0.1,
      })
    );
    const flameOrangeMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xff7a18,
        emissive: 0xe94b16,
        emissiveIntensity: 1.05,
        roughness: 0.2,
      })
    );
    const goldenFlameMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xffb547,
        emissive: 0xff7a18,
        emissiveIntensity: 1.35,
        roughness: 0.16,
      })
    );
    const plasmaCyanMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x39b9eb,
        emissive: 0x00b8ff,
        emissiveIntensity: 1.65,
        roughness: 0.15,
      })
    );

    // Articulated Legs & Boots (Floating Pose)
    const legGeo = track(new THREE.CapsuleGeometry(0.155, 0.26, 10, 18));
    const leftLeg = new THREE.Mesh(legGeo, suitWhiteMat);
    leftLeg.position.set(-0.21, -0.32, 0.04);
    leftLeg.rotation.z = 0.12;
    leftLeg.rotation.x = 0.18;
    mascotRoot.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, suitWhiteMat);
    rightLeg.position.set(0.21, -0.28, -0.04);
    rightLeg.rotation.z = -0.14;
    rightLeg.rotation.x = -0.12;
    mascotRoot.add(rightLeg);

    const bootGeo = track(new THREE.SphereGeometry(0.19, 20, 16));
    const leftBoot = new THREE.Mesh(bootGeo, suitWhiteMat);
    leftBoot.scale.set(1, 0.58, 1.28);
    leftBoot.position.set(-0.24, -0.56, 0.12);
    mascotRoot.add(leftBoot);

    const rightBoot = new THREE.Mesh(bootGeo, suitWhiteMat);
    rightBoot.scale.set(1, 0.58, 1.28);
    rightBoot.position.set(0.25, -0.52, -0.02);
    mascotRoot.add(rightBoot);

    // Rounded Space Suit Torso
    const torsoGeo = track(new THREE.CapsuleGeometry(0.41, 0.36, 14, 24));
    const torso = new THREE.Mesh(torsoGeo, suitWhiteMat);
    torso.scale.set(1.06, 1, 0.85);
    torso.position.set(0, 0.18, 0);
    mascotRoot.add(torso);

    // Belt & Glowing Cyan Chest Ring Emblem
    const beltGeo = track(new THREE.CylinderGeometry(0.44, 0.44, 0.1, 32));
    const belt = new THREE.Mesh(beltGeo, darkJointMat);
    belt.scale.set(1.03, 1, 0.84);
    belt.position.set(0, -0.04, 0);
    mascotRoot.add(belt);

    const chestPlateGeo = track(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 28));
    const chestPlate = new THREE.Mesh(chestPlateGeo, darkJointMat);
    chestPlate.rotation.x = Math.PI / 2;
    chestPlate.position.set(0, 0.24, 0.36);
    mascotRoot.add(chestPlate);

    const chestRingGeo = track(new THREE.TorusGeometry(0.13, 0.024, 12, 32));
    const chestRing = new THREE.Mesh(chestRingGeo, cyanLedMat);
    chestRing.position.set(0, 0.24, 0.38);
    mascotRoot.add(chestRing);

    const chestCoreGeo = track(new THREE.SphereGeometry(0.055, 16, 16));
    const chestCore = new THREE.Mesh(chestCoreGeo, cyanLedMat);
    chestCore.position.set(0, 0.24, 0.38);
    mascotRoot.add(chestCore);

    // Articulated Arms (Welcoming Wave)
    const armGeo = track(new THREE.CapsuleGeometry(0.115, 0.3, 10, 16));
    const handGeo = track(new THREE.SphereGeometry(0.12, 16, 16));

    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.48, 0.36, 0.04);
    const leftArm = new THREE.Mesh(armGeo, suitWhiteMat);
    leftArm.rotation.z = 0.68;
    leftArm.rotation.x = -0.25;
    leftArm.position.set(-0.16, -0.08, 0.08);
    leftArmGroup.add(leftArm);
    const leftHand = new THREE.Mesh(handGeo, darkJointMat);
    leftHand.position.set(-0.3, -0.2, 0.16);
    leftArmGroup.add(leftHand);
    mascotRoot.add(leftArmGroup);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.48, 0.38, 0.04);
    const rightArm = new THREE.Mesh(armGeo, suitWhiteMat);
    rightArm.rotation.z = -1.12;
    rightArm.rotation.x = -0.3;
    rightArm.position.set(0.22, 0.08, 0.12);
    rightArmGroup.add(rightArm);
    const rightHand = new THREE.Mesh(handGeo, darkJointMat);
    rightHand.position.set(0.4, 0.2, 0.22);
    rightArmGroup.add(rightHand);
    mascotRoot.add(rightArmGroup);

    // ------------------------------------------------------------------
    // HEAD: Sleek White Helmet + Dark Visor Screen + Cyan LED Eyes & Smile
    //       + Dual Orange-Gold & Cyan-Blue Flame Crown
    // ------------------------------------------------------------------
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.06, 0.04);
    mascotRoot.add(headGroup);

    // Rounded White Helmet Shell
    const helmetGeo = track(new THREE.SphereGeometry(0.7, 36, 32));
    const helmet = new THREE.Mesh(helmetGeo, suitWhiteMat);
    helmet.scale.set(1.12, 0.94, 0.96);
    headGroup.add(helmet);

    // Ear Pod Comms with Cyan Glow Rings
    const earGeo = track(new THREE.CylinderGeometry(0.17, 0.17, 0.15, 24));
    const leftEar = new THREE.Mesh(earGeo, darkJointMat);
    leftEar.rotation.z = Math.PI / 2;
    leftEar.position.set(-0.79, -0.02, 0);
    headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, darkJointMat);
    rightEar.rotation.z = Math.PI / 2;
    rightEar.position.set(0.79, -0.02, 0);
    headGroup.add(rightEar);

    const earRingGeo = track(new THREE.TorusGeometry(0.13, 0.02, 10, 24));
    const leftEarRing = new THREE.Mesh(earRingGeo, cyanLedMat);
    leftEarRing.rotation.y = Math.PI / 2;
    leftEarRing.position.set(-0.86, -0.02, 0);
    headGroup.add(leftEarRing);

    const rightEarRing = new THREE.Mesh(earRingGeo, cyanLedMat);
    rightEarRing.rotation.y = Math.PI / 2;
    rightEarRing.position.set(0.86, -0.02, 0);
    headGroup.add(rightEarRing);

    // Dark Glossy Visor Screen Faceplate
    const visorGeo = track(new THREE.SphereGeometry(0.58, 32, 28));
    const visorScreen = new THREE.Mesh(visorGeo, visorScreenMat);
    visorScreen.scale.set(1.08, 0.78, 0.55);
    visorScreen.position.set(0, -0.02, 0.42);
    headGroup.add(visorScreen);

    // Glowing Cyan Rim Around Visor
    const visorRimGeo = track(new THREE.TorusGeometry(0.52, 0.018, 12, 48));
    const visorRim = new THREE.Mesh(visorRimGeo, cyanLedMat);
    visorRim.scale.set(1.16, 0.82, 1);
    visorRim.position.set(0, -0.02, 0.58);
    headGroup.add(visorRim);

    // Two Glowing Cyan-Blue Vertical Rounded-Pill LED Eyes
    const ledEyeGeo = track(new THREE.CapsuleGeometry(0.082, 0.11, 12, 20));
    const glintGeo = track(new THREE.SphereGeometry(0.028, 10, 10));
    const whiteMat = track(new THREE.MeshBasicMaterial({ color: 0xffffff }));

    const leftEyeGroup = new THREE.Group();
    leftEyeGroup.position.set(-0.22, 0.02, 0.7);
    leftEyeGroup.add(new THREE.Mesh(ledEyeGeo, cyanLedMat));
    const leftGlint = new THREE.Mesh(glintGeo, whiteMat);
    leftGlint.position.set(-0.025, 0.045, 0.075);
    leftEyeGroup.add(leftGlint);
    headGroup.add(leftEyeGroup);

    const rightEyeGroup = new THREE.Group();
    rightEyeGroup.position.set(0.22, 0.02, 0.7);
    rightEyeGroup.add(new THREE.Mesh(ledEyeGeo, cyanLedMat));
    const rightGlint = new THREE.Mesh(glintGeo, whiteMat);
    rightGlint.position.set(-0.025, 0.045, 0.075);
    rightEyeGroup.add(rightGlint);
    headGroup.add(rightEyeGroup);

    // Glowing Cyan Curved LED Smile
    const smileGeo = track(new THREE.TorusGeometry(0.095, 0.02, 10, 24, Math.PI));
    const smile = new THREE.Mesh(smileGeo, cyanLedMat);
    smile.rotation.z = Math.PI;
    smile.position.set(0, -0.15, 0.71);
    headGroup.add(smile);

    // Dual-Color Flame & Plasma Crown Above Helmet (Orange-Gold Base + Cyan Plasma Tips)
    const flamePlumes: Array<{
      mesh: THREE.Mesh;
      baseRotZ: number;
      phase: number;
      speed: number;
    }> = [];
    const crownSpecs = [
      // Lower/Mid Warm Orange-Gold Flame Plumes
      { x: -0.14, y: 0.78, z: 0.02, r: 0.25, h: 0.66, rotZ: 0.12, mat: flameOrangeMat, phase: 0 },
      { x: -0.34, y: 0.66, z: 0.04, r: 0.18, h: 0.52, rotZ: 0.36, mat: goldenFlameMat, phase: 1.1 },
      { x: 0.06, y: 0.82, z: 0.05, r: 0.22, h: 0.64, rotZ: -0.06, mat: goldenFlameMat, phase: 2.2 },
      // Upper/Right Electric Cyan-Blue Plasma Flame Tips
      { x: 0.22, y: 0.88, z: 0.0, r: 0.2, h: 0.68, rotZ: -0.24, mat: plasmaCyanMat, phase: 3.3 },
      { x: 0.04, y: 0.98, z: -0.04, r: 0.16, h: 0.58, rotZ: -0.14, mat: plasmaCyanMat, phase: 4.4 },
    ];
    crownSpecs.forEach((spec, idx) => {
      const coneGeo = track(new THREE.ConeGeometry(spec.r, spec.h, 20));
      const cone = new THREE.Mesh(coneGeo, spec.mat);
      cone.position.set(spec.x, spec.y, spec.z);
      cone.rotation.z = spec.rotZ;
      headGroup.add(cone);
      flamePlumes.push({
        mesh: cone,
        baseRotZ: spec.rotZ,
        phase: spec.phase,
        speed: 2.6 + idx * 0.35,
      });
    });

    // ------------------------------------------------------------------
    // ANIMATION & POINTER PARALLAX
    // ------------------------------------------------------------------
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isInViewport = true;
    let rafId = 0;
    const startTime = performance.now();

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const handleResize = () => {
      if (!container) return;
      const w = Math.max(container.clientWidth, 280);
      const h = Math.max(container.clientHeight, 320);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        isInViewport = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("resize", handleResize);

    const animate = (now: number) => {
      rafId = window.requestAnimationFrame(animate);
      if (!isInViewport || document.hidden) return;

      const t = (now - startTime) * 0.001;

      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      // Floating & friendly wave motion
      mascotRoot.position.y = 0.28 + Math.sin(t * 1.35) * 0.065;
      mascotRoot.rotation.y = currentX * 0.22 + Math.sin(t * 0.5) * 0.05;
      headGroup.rotation.y = currentX * 0.2;
      headGroup.rotation.x = -currentY * 0.12;
      rightArmGroup.rotation.z = Math.sin(t * 2.4) * 0.08;

      // Dual-tone flame crown flicker
      for (const plume of flamePlumes) {
        const wave = Math.sin(t * plume.speed + plume.phase);
        plume.mesh.scale.set(1, 1 + wave * 0.12, 1);
        plume.mesh.rotation.z = plume.baseRotZ + wave * 0.07;
      }

      // Periodic LED eye blink every ~4.4s
      const blink = t % 4.4;
      const eyeScaleY = blink > 4.24 ? 0.12 : 1;
      leftEyeGroup.scale.y = eyeScaleY;
      rightEyeGroup.scale.y = eyeScaleY;

      goldenOrbit.rotation.z = t * 0.12;
      cyanOrbit.rotation.z = -t * 0.15;
      earthGroup.rotation.y = t * 0.025;

      renderer.render(scene, camera);
    };

    rafId = window.requestAnimationFrame(animate);
    setSceneReady(true);

    return () => {
      window.cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);

      for (const item of disposables) {
        item.dispose();
      }
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (useFallback) {
    return <FlameSafeMascotFallback className={className} />;
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[340px] sm:min-h-[420px] lg:min-h-[460px] overflow-hidden ${className}`}
      aria-label="Interactive 3D Astro-Flame Bot Mascot"
    >
      {!sceneReady && (
        <div className="absolute inset-0 z-10">
          <FlameSafeMascotFallback />
        </div>
      )}
    </div>
  );
};

export default FlameSafe3DHeroScene;
