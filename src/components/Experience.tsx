"use client"

import { DoorType, RoomType, WallLightType, WallType, WatchData, WatchDisplayProps, WatchModelType } from '@/lib/types/types'
import * as THREE from "three";
import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { wallSections } from '@/lib/data/WallSection';
import Watch1 from "./Models/Watch1";
import FPSControls from './FPSControl';
import WatchRoom from './WatchRoom';
import { useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Text3D, Center } from "@react-three/drei";


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

const Wall = ({ position, args, color, isMobile }: WallType) => {
    return (
        <mesh
            position={position}
            receiveShadow={!isMobile}
            castShadow={!isMobile}
        >
            <boxGeometry args={args} />
            <meshStandardMaterial color={color} side={THREE.DoubleSide} />
        </mesh>
    )
}

const WallLight = ({ position, target, isMobile }: WallLightType & { isMobile: boolean }) => {
    const lightRef = useRef<THREE.SpotLight>(null)
    const targetRef = useRef<THREE.Object3D>(null)

    useEffect(() => {
        if (lightRef.current && targetRef.current) {
            lightRef.current.target = targetRef.current
        }
    }, [])

    return (
        <>
            <spotLight
                ref={lightRef}
                position={position}
                angle={0.8}          // wider cone
                penumbra={0.6}
                intensity={4}        // stronger
                distance={6}         // limit range
                decay={2}            // natural falloff
                castShadow={!isMobile}
            />
            <object3D ref={targetRef} position={target} />
        </>
    )
}

const UpwardLight = ({ position, isMobile }: { position: [number, number, number], isMobile: boolean }) => {
    const lightRef = useRef<THREE.SpotLight>(null);
    const targetRef = useRef<THREE.Object3D>(null);

    useEffect(() => {
        if (lightRef.current && targetRef.current) {
            lightRef.current.target = targetRef.current;
        }
    }, []);

    return (
        <>
            <spotLight
                ref={lightRef}
                position={position}
                angle={0.6}             // tighter beam
                penumbra={0.9}
                intensity={4.5}           // brighter
                distance={2}
                decay={2.5}
                color="#ffd8a8"         // warm soft tone
                castShadow={!isMobile}
            />
            <object3D ref={targetRef} position={[position[0], position[1] + 1.2, position[2]]} />

            {/* Optional glowing orb at top */}
            <mesh position={[position[0], position[1] - 0.1, position[2]]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial
                    color="#ffd8a8"
                    emissive="#ffefcf"
                    emissiveIntensity={2}
                    metalness={0.3}
                    roughness={0.4}
                />
            </mesh>
        </>
    );
};

const WatchDisplay: React.FC<WatchDisplayProps> = ({
    Model,
    position,
    scale = 0.3,
    rotation = [0, Math.PI, 0],
}) => {
    return (
        <group position={position} scale={scale} rotation={rotation}>
            <group position={[0, 0.5, 0]}>
                <Model />
            </group>
        </group>
    );
};



const Door = ({ onClick }: DoorType) => {
    const doorRef = useRef(null)

    return (
        <mesh
            ref={doorRef}
            position={[0, 1, 5.06]} // Front wall Opening 
            onClick={onClick}
            onPointerEnter={() => document.body.style.cursor = "pointer"}
            onPointerLeave={() => document.body.style.cursor = "auto"}
        >
            {/* The Door */}
            <boxGeometry args={[1.2, 2, 0.1]} />
            <meshStandardMaterial color="#8B4513" />

            {/* Door Knob */}
            <mesh position={[0.45, 0, 0.06]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial color="gold" />
            </mesh>

        </mesh>
    )
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const Room = ({ onDoorClick, onPictureClick, isMobile }: RoomType & { onPictureClick?: Function, isMobile: boolean }) => {
    const roomWidth = 15
    const roomDepth = 20
    const roomHeight = 7

    // Carpet settings
    const carpetWidth = 2
    const carpetDepth = roomDepth - 2 // leaves a bit of space before back wall

    // Stand settings
    const standWidth = 0.8
    const standHeight = 1.0
    const standDepth = 0.8
    const numStandsPerSide = 4
    const spacing = carpetDepth / (numStandsPerSide + 1)

    return (
        <group>
            {/* Floor */}
            <Wall
                position={[0, -0.05, 0]}
                args={[roomWidth, 0.1, roomDepth]}
                color="grey"
                isMobile={isMobile}
            />

            {/* Roof */}
            <Wall
                position={[0, roomHeight + 0.05, 0]}
                args={[roomWidth, 0.1, roomDepth]}
                color="#4A0E0E"
                isMobile={isMobile}
            />

            {/* Walls (auto-generated from wallSections data) */}
            {wallSections.map((section) => (
                <group key={section.id}>
                    {section.wallPanels.map((panel, i) => (
                        <group key={`${section.id}-panel-${i}`}>
                            <Wall {...panel} isMobile={isMobile} />
                        </group>
                    ))}

                    {section.lights.map((light, i) => (
                        <WallLight key={`${section.id}-light-${i}`} {...light} isMobile={isMobile} />
                    ))}
                </group>
            ))}

            {/* Signage */}
            <mesh position={[0, 5.5, roomDepth / 2 + 0.15]}>
                <planeGeometry args={[4, 2.5]} /> {/* width, height */}
                <meshBasicMaterial
                    map={useTexture("/lmm.png")}
                    transparent
                    toneMapped={false}
                />
            </mesh>

            {/* 🚪 EXIT Sign (inside view) */}
            <group position={[0, 2.5, roomDepth / 2 - 0.1]} rotation={[0, Math.PI, 0]}>
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
                        EXIT
                        <meshStandardMaterial
                            color="#ff1a1a"              // bright red
                            emissive="#ff0000"           // glowing red tone
                            emissiveIntensity={3.5}      // stronger glow
                            metalness={0.4}
                            roughness={0.3}
                        />
                    </Text3D>
                </Center>

                {/* Optional glow behind the text */}
                <mesh position={[0, 0, -0.05]}>
                    <planeGeometry args={[1.5, 0.6]} />
                    <meshStandardMaterial
                        color="#ff0000"
                        emissive="#ff0000"
                        emissiveIntensity={2}
                        transparent opacity={0.3}
                    />
                </mesh>

                {/* Red glow light to illuminate nearby wall */}
                <pointLight
                    position={[0, 0, 0.2]}
                    color="#ff0000"
                    intensity={3}
                    distance={2}
                    decay={2}
                />
            </group>


            {/* Door */}
            <mesh
                position={[0, 1, roomDepth / 2 + 0.06]}
                onClick={onDoorClick}
                onPointerEnter={() => (document.body.style.cursor = "pointer")}
                onPointerLeave={() => (document.body.style.cursor = "auto")}
            >
                <boxGeometry args={[1.2, 2, 0.1]} />
                <meshStandardMaterial color="#8B4513" />
                <mesh position={[0.45, 0, 0.06]}>
                    <sphereGeometry args={[0.05, 16, 16]} />
                    <meshStandardMaterial color="gold" />
                </mesh>
            </mesh>

            {/* 🟥 Red Carpet */}
            <mesh position={[0, 0.01, 0]}>
                <boxGeometry args={[carpetWidth, 0.02, carpetDepth]} />
                <meshStandardMaterial color="red" roughness={0.8} metalness={0.1} />
            </mesh>

            {/* 🧱 Stands on both sides */}
            {Array.from({ length: numStandsPerSide }).map((_, i) => {
                const zPos = -carpetDepth / 2 + (i + 1) * spacing;
                const xOffset = carpetWidth / 2 + 2;
                const watchHeight = standHeight + 0.4; // distance above stand

                // const leftModelIndex = (i * 2) % watchModels.length;
                // const rightModelIndex = (i * 2 + 1) % watchModels.length;
                const LeftModel = Watch1;
                const RightModel = Watch1;

                return (
                    <group
                        key={i}
                    >
                        {/* Left side stand */}
                        <mesh position={[-xOffset, standHeight / 2, zPos]} castShadow={!isMobile}>
                            <boxGeometry args={[standWidth, standHeight, standDepth]} />
                            <meshStandardMaterial color="#5C1010" metalness={0.3} roughness={0.7} />
                        </mesh>

                        {/* Reflective top panel */}
                        <mesh position={[-xOffset, standHeight + 0.01, zPos]}>
                            <boxGeometry args={[standWidth * 1.02, 0.05, standDepth * 1.02]} />
                            <meshStandardMaterial
                                color="#a85c3d"
                                metalness={0.9}
                                roughness={0.2}
                                emissive="#663300"
                                emissiveIntensity={0.3}
                            />
                        </mesh>

                        <UpwardLight position={[-xOffset, standHeight + 0.2, zPos]} isMobile={isMobile} />

                        {/* Left watch with click */}
                        <group
                            position={[-xOffset, watchHeight, zPos]}
                            onClick={(e) => {
                                e.stopPropagation();
                                const worldPos = new THREE.Vector3();
                                e.object.getWorldPosition(worldPos);
                                onPictureClick?.(
                                    { id: `left-watch-${i}`, name: "Luxury Watch", Model: LeftModel },
                                    worldPos,
                                    e.camera
                                );
                            }}
                            onPointerEnter={() => (document.body.style.cursor = "pointer")}
                            onPointerLeave={() => (document.body.style.cursor = "auto")}
                        >
                            <WatchDisplay Model={LeftModel} position={[0, 0, 0]} />
                        </group>

                        {/* Right side stand */}
                        <mesh position={[xOffset, standHeight / 2, zPos]} castShadow={!isMobile}>
                            <boxGeometry args={[standWidth, standHeight, standDepth]} />
                            <meshStandardMaterial color="#5C1010" metalness={0.3} roughness={0.7} />
                        </mesh>

                        <mesh position={[xOffset, standHeight + 0.01, zPos]}>
                            <boxGeometry args={[standWidth * 1.02, 0.05, standDepth * 1.02]} />
                            <meshStandardMaterial
                                color="#a85c3d"
                                metalness={0.9}
                                roughness={0.2}
                                emissive="#663300"
                                emissiveIntensity={0.3}
                            />
                        </mesh>

                        <UpwardLight position={[xOffset, standHeight + 0.2, zPos]} isMobile={isMobile} />

                        {/* Right watch with click */}
                        <group
                            position={[xOffset, watchHeight, zPos]}
                            onClick={(e) => {
                                e.stopPropagation();
                                const worldPos = new THREE.Vector3();
                                e.object.getWorldPosition(worldPos);
                                onPictureClick?.(
                                    { id: `right-watch-${i}`, name: "Luxury Watch", Model: RightModel },
                                    worldPos,
                                    e.camera
                                );
                            }}
                            onPointerEnter={() => (document.body.style.cursor = "pointer")}
                            onPointerLeave={() => (document.body.style.cursor = "auto")}
                        >
                            <WatchDisplay Model={RightModel} position={[0, 0, 0]} />
                        </group>
                    </group>
                );
            })}

        </group>
    )
}

const SceneLogic = ({ inWatchRoom, inside, controlsRef, isMobile }: {
    inWatchRoom: boolean,
    inside: boolean,
    controlsRef: React.RefObject<OrbitControlsImpl | null>
    isMobile: boolean
}) => {
    const { camera } = useThree();

    // This effect runs when we TRANSITION into the WatchRoom
    useEffect(() => {
        if (inWatchRoom && controlsRef.current) {
            // The zoom-in animation from handlePictureClick has just finished.
            // NOW, we animate the camera to the WatchRoom's starting position.

            // Camera Position: "at the opposite wall" (back wall, z = -8)
            // Camera Target: "to face the Door" (looking at center, z = 0)

            gsap.to(camera.position, {
                x: 0,
                y: 1.5,
                z: -8, // <-- At the "back wall"
                duration: 1.5,
                ease: "power2.inOut",
            });

            gsap.to(controlsRef.current.target, {
                x: 0,
                y: 1.5,
                z: 0, // <-- Looking at the "center" (towards the door)
                duration: 1.5,
                ease: "power2.inOut",
                onUpdate: () => controlsRef.current?.update(),
            });
        }
    }, [inWatchRoom, camera, controlsRef]);

    // This renders the correct controls for the current state
    if (inWatchRoom) {
        // When in WatchRoom, we want OrbitControls to look around
        return <OrbitControls ref={controlsRef} target={[0, 1.5, 0]} />;
    }

    if (inside) {
        if (isMobile) {
            // MOBILE: Use locked-down OrbitControls
            return (
                <OrbitControls
                    ref={controlsRef}
                    target={[0, 1.5, 0]}
                    enablePan={false}     // Prevent strafing
                    enableZoom={false}    // Prevent zooming
                    minDistance={1}
                    maxDistance={6}
                    minPolarAngle={Math.PI / 3} // Lock vertical look
                    maxPolarAngle={Math.PI / 1.8}
                />
            );
        } else {
            // DESKTOP: Use FPS controls
            return <FPSControls lookEnabled={false} turnSpeed={0.03} />;
        }
    }

    // Outside (default), use OrbitControls
    return <OrbitControls ref={controlsRef} target={[0, 1.5, 0]} />;
}

const Experience = () => {
    const [inside, setInside] = useState(false)
    const [selectedWatch, setSelectedWatch] = useState<WatchData | null>(null)
    const controlsRef = useRef<OrbitControlsImpl | null>(null)
    const doorRef = useRef<THREE.Mesh>(null)
    const [inWatchRoom, setInWatchRoom] = useState(false)

    const isMobile = useIsMobile();

    const handleDoorClick = (event: ThreeEvent<MouseEvent>) => {
        // Stop Propagation to prevent OrbitControls
        event.stopPropagation();

        const door = event.object; // We get the group containing the door
        const camera = event.camera;
        const controls = controlsRef.current

        const insidePos = { x: 0, y: 1.5, z: isMobile ? 5 : 3 };
        const insideTarget = { x: 0, y: 1.5, z: -2 };
        const outsidePos = { x: 0, y: 2, z: isMobile ? 24 : 18 };
        const outsideTarget = { x: 0, y: 1.5, z: 0 };

        if (!inside) {
            // Animate Door Opening
            gsap.to(door!.rotation, {
                y: -Math.PI / 2,
                duration: 1.5
            })

            // Animate Camera Moving Inside
            gsap.to(camera.position, {
                ...insidePos,
                duration: 2.0
            })

            // Animate Controls to Look Forward
            if (controls) {
                gsap.to(controls.target, {
                    ...insidePos,
                    duration: 2.0
                })
            }

            setInside(true)
        } else {
            // Going Outside
            gsap.to(door.rotation, {
                y: 0,
                duration: 1.5
            });

            gsap.to(camera.position, {
                ...outsidePos,
                duration: 2.0
            })

            if (controls) {
                gsap.to(controls.target, {
                    ...outsidePos,
                    duration: 2.0
                })
            }

            setInside(false)
        }
    }

    const handlePictureClick = (
        watch: WatchData,
        worldPos: THREE.Vector3,
        camera: THREE.Camera
    ) => {
        // Zoom-in animation (Restored to original)
        const controls = controlsRef.current;

        const zoomOffset = isMobile ? 2.5 : 1.8;

        gsap.to(camera.position, {
            x: worldPos.x,
            y: worldPos.y,
            z: worldPos.z + zoomOffset, // <-- This is the zoom-in
            duration: 1.5,
            ease: "power2.inOut",
            onComplete: () => {
                setSelectedWatch(watch);
                setInWatchRoom(true);
                // setFpsEnabled(false); // SceneLogic now handles this
            },
        });

        if (controls) {
            gsap.to(controls.target, {
                x: worldPos.x,
                y: worldPos.y,
                z: worldPos.z, // <-- Look at the watch
                duration: 1.5,
                ease: "power2.inOut",
                onUpdate: () => controls.update(),
            });
        }
    };


    const handleBackToGallery = (event: ThreeEvent<MouseEvent>) => {
        const controls = controlsRef.current;
        const camera = event.camera;

        console.log("Returning to gallery...", camera);

        if (!camera) return;

        const insidePos = { x: 0, y: 1.5, z: isMobile ? 5 : 3 };
        const insideTarget = { x: 0, y: 1.5, z: -2 };

        // Animate camera position back to INSIDE the gallery
        gsap.to(camera.position, {
            ...insidePos,
            duration: 2,
            ease: "power2.inOut",
            onComplete: () => {
                // Switch view back
                setInWatchRoom(false);
                setSelectedWatch(null);
                // setFpsEnabled(true); // SceneLogic now handles this
            },
        });

        // Reset control target to look forward from INSIDE
        if (controls) {
            gsap.to(controls.target, {
                ...insideTarget,
                duration: 2,
                ease: "power2.inOut",
                onUpdate: () => controls.update(),
            });
        }
    };


    return (
        <Canvas camera={{ position: [0, 2, 18], fov: 75 }}>
            <>
                <ambientLight intensity={1.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow={!isMobile} />

                {inWatchRoom && selectedWatch ? (
                    <WatchRoom
                        watch={selectedWatch}
                        onBack={handleBackToGallery}
                    />
                ) : (
                    <Room onDoorClick={handleDoorClick} onPictureClick={handlePictureClick} isMobile={isMobile} />
                )}


                <SceneLogic
                    inWatchRoom={inWatchRoom}
                    inside={inside}
                    controlsRef={controlsRef}
                    isMobile={isMobile}
                />
            </>
        </Canvas>
    )
}

export default Experience
