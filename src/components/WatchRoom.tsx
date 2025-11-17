"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html, useTexture, Text3D, Center, OrbitControls } from "@react-three/drei";
import { useThree, useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { WallType, WatchRoomProps } from "@/lib/types/types";

// ✅ Hook cleaned of unused variables
const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Set initial value after mount to ensure window is defined
        const checkMobile = () => window.innerWidth < breakpoint;
        setIsMobile(checkMobile());

        const handleResize = () => {
            setIsMobile(checkMobile());
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [breakpoint]);

    return isMobile;
};

const DesktopFPSControls = ({ roomWidth, roomDepth, roomHeight }: {
    roomWidth: number,
    roomDepth: number,
    roomHeight: number
}) => {
    const { camera } = useThree();
    const keys = useRef<Record<string, boolean>>({});

    // Keyboard movement controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => (keys.current[e.code] = true);
        const handleKeyUp = (e: KeyboardEvent) => (keys.current[e.code] = false);
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    // Movement logic per frame
    useFrame(() => {
        const moveSpeed = 0.1;
        const turnSpeed = 0.03;
        const direction = new THREE.Vector3();

        // WSAD movement
        if (keys.current["KeyW"]) direction.z -= 1;
        if (keys.current["KeyS"]) direction.z += 1;
        if (keys.current["KeyA"]) direction.x -= 1;
        if (keys.current["KeyD"]) direction.x += 1;

        // QE rotation
        if (keys.current["KeyQ"]) camera.rotation.y += turnSpeed;
        if (keys.current["KeyE"]) camera.rotation.y -= turnSpeed;

        // Apply movement relative to camera direction
        if (direction.lengthSq() > 0) {
            direction.normalize();
            const move = new THREE.Vector3(direction.x, 0, direction.z)
                .applyEuler(new THREE.Euler(0, camera.rotation.y, 0))
                .multiplyScalar(moveSpeed);
            camera.position.add(move);
        }

        // Keep camera within bounds
        const minX = -roomWidth / 2 + 1.5;
        const maxX = roomWidth / 2 - 1.5;
        const minY = 1.2; // Keep a consistent eye-level
        const maxY = 1.8; // Don't let user fly
        const minZ = -roomDepth / 2 + 1.5;
        const maxZ = roomDepth / 2 - 1.5;

        camera.position.x = Math.max(minX, Math.min(maxX, camera.position.x));
        camera.position.y = Math.max(minY, Math.min(maxY, camera.position.y));
        camera.position.z = Math.max(minZ, Math.min(maxZ, camera.position.z));
    });

    return null; // This component is a controller, it doesn't render anything
};

// ✅ Wall component defined OUTSIDE WatchRoom for performance
const Wall = ({ position, args, color, isMobile }: WallType & { isMobile: boolean }) => (
    <mesh position={position} receiveShadow={!isMobile} castShadow={!isMobile}>
        <boxGeometry args={args} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
);


const WatchRoom: React.FC<WatchRoomProps> = ({ watch, onBack }) => {
    const lightRef = useRef<THREE.PointLight>(null);
    const { camera } = useThree();

    // ❌ Removed tapTarget state and useFrame lerp to fix mobile control conflict
    // const [tapTarget, setTapTarget] = useState<THREE.Vector3 | null>(null);

    const [tooltip, setTooltip] = useState({
        visible: false,
        text: "",
        position: [0, 0, 0] as [number, number, number],
    });

    const isMobile = useIsMobile();

    // Room dimensions
    const roomWidth = 25;
    const roomDepth = 18;
    const roomHeight = 10;

    // Watch model
    const modelScale = isMobile ? 0.6 : 1.0;

    const Model = watch.Model;

    useEffect(() => {
        if (isMobile) {
            camera.position.set(0, 3.2, 9);
            camera.rotation.set(-0.25, 0, 0);
        }
    }, [isMobile, camera]);

    // 🌟 Light pulse
    useEffect(() => {
        if (lightRef.current) {
            gsap.to(lightRef.current, {
                intensity: 3,
                duration: 2,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut",
            });
        }
    }, []);

    // ❌ Removed handleTapMove function

    return (
        // ❌ Removed onClick={handleTapMove} from main group
        <group>
            {/* 💡 Lighting */}
            <ambientLight intensity={1.3} color="#ffffff" />
            <pointLight
                ref={lightRef}
                position={[0, roomHeight - 2, 0]}
                intensity={2.5}
                distance={12}
                decay={2}
                color="#ffd8a8"
                castShadow={!isMobile}
            />

            {/* 🧱 Floor & Ceiling */}
            <Wall position={[0, 0, 0]} args={[roomWidth, 0.1, roomDepth]} color="#8b3a3a" isMobile={isMobile} />
            <Wall position={[0, roomHeight, 0]} args={[roomWidth, 0.1, roomDepth]} color="#4A0E0E" isMobile={isMobile} />

            {/* 🧱 Walls */}
            <Wall position={[0, roomHeight / 2, -roomDepth / 2]} args={[roomWidth, roomHeight, 0.1]} color="#2E0A0A" isMobile={isMobile} />
            <Wall position={[0, roomHeight / 2, roomDepth / 2]} args={[roomWidth, roomHeight, 0.1]} color="#2E0A0A" isMobile={isMobile} />
            <Wall position={[-roomWidth / 2, roomHeight / 2, 0]} args={[0.1, roomHeight, roomDepth]} color="#2E0A0A" isMobile={isMobile} />
            <Wall position={[roomWidth / 2, roomHeight / 2, 0]} args={[0.1, roomHeight, roomDepth]} color="#2E0A0A" isMobile={isMobile} />

            {/* 🚪 Exit Sign (inside view) */}
            <group position={[0, 4.5, roomDepth / 2 - 0.1]} rotation={[0, Math.PI, 0]}>
                <Center>
                    <Text3D
                        font="/fonts/Montserrat_Bold.json"
                        size={0.4}
                        height={0.1}
                        bevelEnabled={!isMobile}
                        bevelThickness={0.02}
                        bevelSize={0.01}
                        bevelSegments={4}
                    >
                        Back to Gallery
                        <meshStandardMaterial
                            color="#ff1a1a"
                            emissive="#ff0000"
                            emissiveIntensity={3.5}
                            metalness={0.4}
                            roughness={0.3}
                        />
                    </Text3D>
                </Center>

                <mesh position={[0, 0, -0.05]}>
                    <planeGeometry args={[5, 0.6]} />
                    <meshStandardMaterial
                        color="#ff0000"
                        emissive="#ff0000"
                        emissiveIntensity={2}
                        transparent
                        opacity={0.3}
                    />
                </mesh>

                <pointLight position={[0, 0, 0.2]} color="#ff0000" intensity={3} distance={2} decay={2} />
            </group>

            {/* 🚪 Door */}
            <group position={[0, 2, roomDepth / 2 + 0.05]}>
                <mesh
                    onClick={onBack}
                    onPointerEnter={() => (document.body.style.cursor = "pointer")}
                    onPointerLeave={() => (document.body.style.cursor = "auto")}
                >
                    <boxGeometry args={[1.5, 3, 0.5]} />
                    <meshStandardMaterial color="#8B4513" roughness={0.6} metalness={0.2} />
                </mesh>
                <mesh position={[0.6, 0, 0.1]}>
                    <sphereGeometry args={[0.08, 16, 16]} />
                    <meshStandardMaterial color="gold" emissive="gold" emissiveIntensity={0.5} />
                </mesh>
            </group>

            {/* 🕰️ Stand + Watch */}
            <group position={[0, 0, 0]}>
                {/* Watch above stand */}
                <group
                    position={isMobile ? [1.2, 2.0, -0.5] : [0, 2.2, 0]}
                    scale={isMobile ? 0.5 : 1}
                    onClick={(e) => {
                        e.stopPropagation(); // ✅ Good! Prevents any parent clicks

                        setTooltip((prev) => {
                            // If already visible, hide it; otherwise show it
                            if (prev.visible) {
                                return { ...prev, visible: false };
                            } else {
                                return {
                                    visible: true,
                                    text: "This is a premium timepiece with automatic movement.",
                                    position: [0, 3, 0], // Tooltip above the watch
                                };
                            }
                        });
                    }}
                    onPointerEnter={() => (document.body.style.cursor = "pointer")}
                    onPointerLeave={() => (document.body.style.cursor = "auto")}
                >
                    <Model />
                </group>
            </group>

            {/* Tooltip */}
            {tooltip.visible && (
                <Html position={tooltip.position} center distanceFactor={8}>
                    <div
                        style={{
                            padding: "8px 12px",
                            background: "rgba(0, 0, 0, 0.7)",
                            color: "white",
                            borderRadius: "4px",
                            fontSize: "14px",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {tooltip.text}
                    </div>
                </Html>
            )}

            {isMobile && (
                <Html position={[0, 5, 8]} zIndexRange={[100, 0]}>
                    <button
                        // ✅ This new function is the correct type
                        onClick={(e) => {
                            // Prevent click from "leaking" to the 3D canvas
                            e.stopPropagation();

                            // Call your original function
                            onBack();
                        }}
                        style={{
                            position: "fixed",
                            top: "16px",
                            left: "16px",
                            padding: "10px 16px",
                            background: "rgba(0,0,0,0.6)",
                            color: "white",
                            borderRadius: "8px",
                            fontSize: "16px",
                            backdropFilter: "blur(6px)",
                        }}
                    >
                        Back
                    </button>
                </Html>
            )}


            {isMobile ? (
                <OrbitControls
                    enablePan={true}
                    enableRotate={true}
                    enableZoom={false}
                    panSpeed={1.5}
                    rotateSpeed={2.0}
                    maxPolarAngle={Math.PI * 0.9}
                    minPolarAngle={Math.PI * 0.15}
                    minDistance={3}
                    maxDistance={30}
                    target={[0, 2.2, 0]}
                />

            ) : (
                <DesktopFPSControls
                    roomWidth={roomWidth}
                    roomDepth={roomDepth}
                    roomHeight={roomHeight}
                />
            )}
        </group>
    );
};

export default WatchRoom;