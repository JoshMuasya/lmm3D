"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html, useTexture, Text3D, Center, OrbitControls } from "@react-three/drei";
import { useThree, useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { WallType, WatchRoomProps } from "@/lib/types/types";

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

const WatchRoom: React.FC<WatchRoomProps> = ({ watch, onBack }) => {
    const lightRef = useRef<THREE.PointLight>(null);
    const { camera } = useThree();
    const velocity = useRef(new THREE.Vector3());
    const direction = useRef(new THREE.Vector3());
    const keys = useRef<Record<string, boolean>>({});

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
    const Model = watch.Model;

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

    // 🧱 Wall helper
    const Wall = ({ position, args, color }: WallType & { isMobile: boolean }) => (
        <mesh position={position} receiveShadow={!isMobile} castShadow={!isMobile}>
            <boxGeometry args={args} />
            <meshStandardMaterial color={color} side={THREE.DoubleSide} />
        </mesh>
    );

    return (
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
                        bevelEnabled
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
                    position={[0, 2.2, 0]}
                    scale={1.0}
                    onClick={(e) => {
                        e.stopPropagation();

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

            {isMobile ? (
                <OrbitControls
                    target={[0, 2.2, 0]} // Target the watch
                    enablePan={false}      // Don't let user move camera target
                    minDistance={2}        // Min zoom
                    maxDistance={roomDepth / 2 - 2} // Max zoom (stay in room)
                    minPolarAngle={Math.PI / 4}     // Look down limit
                    maxPolarAngle={Math.PI / 1.5}   // Look up limit
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
