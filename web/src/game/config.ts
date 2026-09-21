// Constantes portadas de src/config.py (mesmos valores).

export const SCREEN_WIDTH = 1280;
export const SCREEN_HEIGHT = 720;
export const SCREEN_TITLE = "Aurora: Quem Decide?";

export const MAP_WIDTH = 3200;
export const MAP_HEIGHT = 2400;

export const MAX_SPEED = 240.0;
export const ACCELERATION = 1400.0;
export const FRICTION = 0.8;

// Paleta "Aurora" (identidade nova do deck presentation/).
export const COLORS = {
  ink: "#0a1f2b",
  petrol: "#103343",
  petrol2: "#17475c",
  emerald: "#2ec4a3",
  emeraldDeep: "#14846c",
  gold: "#f5c451",
  goldDeep: "#e0a92e",
  cream: "#f4efe3",
  creamDim: "#cdd6d3",
  slate: "#6f8792",
} as const;

// Numeros hexadecimais para uso no Phaser (0xRRGGBB).
export const HEX = {
  ink: 0x0a1f2b,
  petrol: 0x103343,
  petrol2: 0x17475c,
  emerald: 0x2ec4a3,
  emeraldDeep: 0x14846c,
  gold: 0xf5c451,
  goldDeep: 0xe0a92e,
  cream: 0xf4efe3,
  creamDim: 0xcdd6d3,
  slate: 0x6f8792,
  grass: 0x2a6053,
  road: 0x4c4f56,
  roadEdge: 0x786e58,
} as const;

export const DISCLAIMER =
  "Personagens e acontecimentos sao ficticios. Conteudo educativo e nao partidario.";

export const CREATOR_NAME = "Joao Junior";
export const CREATOR_ORG =
  "MAC5784 - Inteligencia Artificial em Jogos de Computador (2026)";
export const CREATOR_YEAR = "2026";
