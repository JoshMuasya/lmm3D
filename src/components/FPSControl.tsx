"use client";

import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function FPSControls({
  bounds = { width: 14, depth: 19, height: 6 },
  speed = 0.05,
  lookEnabled = false, // Mouse look toggle
  enabled = true,
  turnSpeed = 0.03, // 🔹 Speed for Q/E rotation
}: {
  bounds?: { width: number; depth: number; height: number };
  speed?: number;
  lookEnabled?: boolean;
  enabled?: boolean;
  turnSpeed?: number;
}) {
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const move = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    turnLeft: false,
    turnRight: false,
  });

  const sensitivity = 0.002;
  const halfWidth = bounds.width / 2 - 0.5;
  const halfDepth = bounds.depth / 2 - 0.5;

  useEffect(() => {
    if (!enabled) return;

    camera.rotation.order = "YXZ";

    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW": move.current.forward = true; break;
        case "KeyS": move.current.backward = true; break;
        case "KeyA": move.current.left = true; break;
        case "KeyD": move.current.right = true; break;
        case "KeyQ": move.current.turnLeft = true; break;
        case "KeyE": move.current.turnRight = true; break;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW": move.current.forward = false; break;
        case "KeyS": move.current.backward = false; break;
        case "KeyA": move.current.left = false; break;
        case "KeyD": move.current.right = false; break;
        case "KeyQ": move.current.turnLeft = false; break;
        case "KeyE": move.current.turnRight = false; break;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!lookEnabled) return;
      camera.rotation.y -= e.movementX * sensitivity;
      camera.rotation.x -= e.movementY * sensitivity;
      camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [camera, enabled, lookEnabled]);

  useEffect(() => {
    if (!enabled) return;

    const animate = () => {
      // Handle rotation (Q/E)
      if (move.current.turnLeft) camera.rotation.y += turnSpeed;
      if (move.current.turnRight) camera.rotation.y -= turnSpeed;

      // Handle movement
      direction.current.set(0, 0, 0);
      if (move.current.forward) direction.current.z -= 1;
      if (move.current.backward) direction.current.z += 1;
      if (move.current.left) direction.current.x -= 1;
      if (move.current.right) direction.current.x += 1;
      direction.current.normalize();

      velocity.current.copy(direction.current).applyEuler(camera.rotation).multiplyScalar(speed);

      const newPos = camera.position.clone().add(velocity.current);

      if (newPos.x > -halfWidth && newPos.x < halfWidth) camera.position.x = newPos.x;
      if (newPos.z > -halfDepth && newPos.z < halfDepth) camera.position.z = newPos.z;

      if (camera.position.y < 1.5) camera.position.y = 1.5;
      if (camera.position.y > bounds.height - 1) camera.position.y = bounds.height - 1;

      requestAnimationFrame(animate);
    };
    animate();
  }, [camera, halfWidth, halfDepth, bounds.height, speed, enabled, turnSpeed]);

  return null;
}
