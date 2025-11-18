"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html, Text3D, Center } from "@react-three/drei";
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

// ✅ Wall component defined OUTSIDE WatchRoom for performance
const Wall = ({ position, args, color, isMobile }: WallType & { isMobile: boolean }) => (
    <mesh position={position} receiveShadow={!isMobile} castShadow={!isMobile}>
        <boxGeometry args={args} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
);


const WatchRoom: React.FC<WatchRoomProps> = ({ watch, onBack }) => {
    const lightRef = useRef<THREE.PointLight>(null);

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
                            pointerEvents: "none"
                        }}
                    >
                        {tooltip.text}
                    </div>
                </Html>
            )}
        </group>
    );
};

export default WatchRoom;