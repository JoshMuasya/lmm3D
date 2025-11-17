import { ThreeEvent } from "@react-three/fiber";
import { ReactNode } from "react";
import * as THREE from "three";
import { OrbitControls as OrbitControlsImpl } from "three/examples/jsm/controls/OrbitControls.js";

export interface WallProps {
width: number;
height: number;
position: [number, number, number];
rotation?: [number, number, number];
color?: string;
emissive?: string;
}

export interface FloorProps {
width: number;
depth: number;
position?: [number, number, number];
texture?: THREE.Texture | null;
}

export interface CeilingProps {
width: number;
depth: number;
position?: [number, number, number];
color?: string;
}

export interface DoorProps {
position: [number, number, number];
width: number;
height: number;
color?: string;
}

export interface RoomContentsProps {
  onDoorOpened?: () => void
  onWatchSelected?: (watchId: string) => void;
}

export interface StandProps {
  position: [number, number, number];
  width?: number;
  height?: number;
  depth?: number;
  color?: string;
  lightColor?: string;
  lightIntensity?: number;
  ringColor?: string;
  children?: ReactNode;
}

export interface Watch1Props {
  floatHeight?: number; // height above the stand
  scale?: number;
  rotationSpeed?: number; // rotation speed
}

export type WatchComponentProps = Watch1Props & {
    handlePointerEnter: (text: string, event: ThreeEvent<PointerEvent>) => void;
    handlePointerLeave: () => void;
};

export interface WallType {
    position: [
        x: number,
        y: number,
        z: number
    ];
    args: [
        width?: number,
        height?: number,
        depth?: number,
    ];
    color: string;
    isMobile?: boolean
}

export interface DoorType {
    onClick: (event: ThreeEvent<MouseEvent>) => void
}

export interface RoomType {
    onDoorClick: (event: ThreeEvent<MouseEvent>) => void;  // Door click handler passed down
}

// Type for Experience component internal refs
export type ExperienceRefs = {
  controlsRef: React.RefObject<OrbitControlsImpl>;
  doorRef: React.RefObject<THREE.Mesh>;
};

export interface WallLightType {
    position: [
        x: number,
        y: number,
        z: number
    ];
    target: [
        x: number,
        y: number,
        z: number
    ]
}

export interface PictureProps {
    position: [
        x: number,
        y: number,
        z: number
    ];
    size?: [
        number,
        number
    ];
    textureUrl: string;
    rotation?: [number, number, number];
    link?: string;
    onClick?: (event: ThreeEvent<MouseEvent>) => void
}

export interface WallSection {
  id: string;
  wallPanels: {
    position: [number, number, number];
    args: [number, number, number];
    color: string;
    picture?: {
    position: [number, number, number];
    textureUrl: string;
    rotation?: [number, number, number];
    link?: string;
    title?: string,
    modelUrl?: string
  };
  }[];
  lights: {
    position: [number, number, number];
    target: [number, number, number];
  }[];
}

export interface WatchData {
  id?: string
  title?: string
  textureUrl: string
  modelUrl: string
  Model: WatchModelType;
}

export type WatchModelType = React.ComponentType<Record<string, never>>;

export interface WatchDisplayProps {
  Model: WatchModelType;
  position: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
}

export interface WatchRoomProps {
    watch: WatchData;
    onBack: () => void;
}