import { WallSection } from "../types/types";

const roomWidth = 15;
const roomDepth = 20;
const roomHeight = 7;

export const wallSections: WallSection[] = [
  {
    id: "backWall",
    wallPanels: [
      {
        position: [-roomWidth / 4, roomHeight / 2, -roomDepth / 2],
        args: [roomWidth / 2, roomHeight, 0.1],
        color: "#2a2a2a",
        picture: {
          position: [-roomWidth / 4, roomHeight / 2, -roomDepth / 2 + 0.06],
          textureUrl: "/omega.png",
          rotation: [0, 0, 0],
          link: "",
          title: "Omega Watch",
        },
      },
      {
        position: [roomWidth / 4, roomHeight / 2, -roomDepth / 2],
        args: [roomWidth / 2, roomHeight, 0.1],
        color: "#2a2a2a",
        picture: {
          position: [roomWidth / 4, roomHeight / 2, -roomDepth / 2 + 0.06],
          textureUrl: "/omega1.png",
          rotation: [0, 0, 0],
          link: "",
          title: "Omega Watch",
          modelUrl: "/models/luxury_watch.glb",
        },
      },
    ],
    lights: [
      {
        position: [-roomWidth / 4, roomHeight + 0.5, -roomDepth / 2 + 0.2],
        target: [-roomWidth / 4, roomHeight / 2, -roomDepth / 2],
      },
      {
        position: [roomWidth / 4, roomHeight + 0.5, -roomDepth / 2 + 0.2],
        target: [roomWidth / 4, roomHeight / 2, -roomDepth / 2],
      },
    ],
  },
  {
    id: "leftWall",
    wallPanels: [
      {
        position: [-roomWidth / 2, roomHeight / 2, -roomDepth / 4],
        args: [0.1, roomHeight, roomDepth / 2],
        color: "#2a2a2a",
        picture: {
          position: [-roomWidth / 2 + 0.06, roomHeight / 2, -roomDepth / 4],
          textureUrl: "/art3.jpg",
          rotation: [0, Math.PI / 2, 0],
          link: "",
        },
      },
      {
        position: [-roomWidth / 2, roomHeight / 2, roomDepth / 4],
        args: [0.1, roomHeight, roomDepth / 2],
        color: "#2a2a2a",
        picture: {
          position: [-roomWidth / 2 + 0.06, roomHeight / 2, roomDepth / 4],
          textureUrl: "/art4.jpg",
          rotation: [0, Math.PI / 2, 0],
          link: "",
        },
      },
    ],
    lights: [
      {
        position: [-roomWidth / 2 + 0.5, roomHeight + 0.5, -roomDepth / 4],
        target: [-roomWidth / 2, roomHeight / 2, -roomDepth / 4],
      },
      {
        position: [-roomWidth / 2 + 0.5, roomHeight + 0.5, roomDepth / 4],
        target: [-roomWidth / 2, roomHeight / 2, roomDepth / 4],
      },
    ],
  },
  {
    id: "rightWall",
    wallPanels: [
      {
        position: [roomWidth / 2, roomHeight / 2, -roomDepth / 4],
        args: [0.1, roomHeight, roomDepth / 2],
        color: "#2a2a2a",
        picture: {
          position: [roomWidth / 2 - 0.06, roomHeight / 2, -roomDepth / 4],
          textureUrl: "/art5.jpg",
          rotation: [0, -Math.PI / 2, 0],
          link: "",
        },
      },
      {
        position: [roomWidth / 2, roomHeight / 2, roomDepth / 4],
        args: [0.1, roomHeight, roomDepth / 2],
        color: "#2a2a2a",
        picture: {
          position: [roomWidth / 2 - 0.06, roomHeight / 2, roomDepth / 4],
          textureUrl: "/art6.jpg",
          rotation: [0, -Math.PI / 2, 0],
          link: "",
        },
      },
    ],
    lights: [
      {
        position: [roomWidth / 2 - 0.5, roomHeight + 0.5, -roomDepth / 4],
        target: [roomWidth / 2, roomHeight / 2, -roomDepth / 4],
      },
      {
        position: [roomWidth / 2 - 0.5, roomHeight + 0.5, roomDepth / 4],
        target: [roomWidth / 2, roomHeight / 2, roomDepth / 4],
      },
    ],
  },
  {
    id: "frontWall",
    wallPanels: [
      {
        position: [-roomWidth / 4, roomHeight / 2, roomDepth / 2],
        args: [roomWidth / 2, roomHeight, 0.1],
        color: "#2a2a2a",
        picture: {
          position: [-roomWidth / 4, roomHeight / 2, roomDepth / 2 - 0.06],
          textureUrl: "/art7.jpg",
          rotation: [0, Math.PI, 0],
          link: "",
        },
      },
      {
        position: [roomWidth / 4, roomHeight / 2, roomDepth / 2],
        args: [roomWidth / 2, roomHeight, 0.1],
        color: "#2a2a2a",
        picture: {
          position: [roomWidth / 4, roomHeight / 2, roomDepth / 2 - 0.06],
          textureUrl: "/art8.jpg",
          rotation: [0, Math.PI, 0],
          link: "",
        },
      },
    ],
    lights: [
      {
        position: [-roomWidth / 4, roomHeight + 0.5, roomDepth / 2 - 0.2],
        target: [-roomWidth / 4, roomHeight / 2, roomDepth / 2],
      },
      {
        position: [roomWidth / 4, roomHeight + 0.5, roomDepth / 2 - 0.2],
        target: [roomWidth / 4, roomHeight / 2, roomDepth / 2],
      },
    ],
  },
];
