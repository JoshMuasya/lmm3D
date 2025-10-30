"use client";

import { Watch1Props } from '@/lib/types/types';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react'
import * as THREE from 'three';

const Watch1 = ({
    floatHeight = 1.5 + 0.5,
    scale = 0.8,
    rotationSpeed = 0.1, // radians per second
}: Watch1Props) => {
    const { scene } = useGLTF("/models/scene.gltf"); // ✅ Path to your first watch model
    const watchRef = useRef<THREE.Object3D>(null!);

    const clonedScene = useMemo(() => scene.clone(), [scene]);

    useFrame((state, delta) => {
        if (watchRef.current) {
            watchRef.current.rotation.y += rotationSpeed * delta;
        }
    });
    return (
        <primitive
            ref={watchRef}
            object={clonedScene}
            scale={scale}
            position={[0, floatHeight - 1.5, 0]}
        />
    );
}

useGLTF.preload("/models/scene.gltf");
export default Watch1
