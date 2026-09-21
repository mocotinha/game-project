// Sprites de personagens via DiceBear (biblioteca de avatares npm, CC0).
// Substitui os sprites Kenney por avatares SVG gerados em JS.
import Phaser from "phaser";
import { createAvatar } from "@dicebear/core";
import { adventurer, personas } from "@dicebear/collection";

const STYLES = { adventurer, personas } as const;
export type AvatarStyle = keyof typeof STYLES;

export interface AvatarSpec {
  style: AvatarStyle;
  seed: string;
}

export function avatarTextureKey(style: AvatarStyle, seed: string): string {
  return `av:${style}:${seed}`;
}

function toDataUri(svg: string): string {
  return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
}

function renderSvg(style: AvatarStyle, seed: string): string {
  switch (style) {
    case "adventurer":
      return createAvatar(adventurer, { seed, size: 96 }).toString();
    case "personas":
      return createAvatar(personas, { seed, size: 96 }).toString();
  }
}

function ensureOne(scene: Phaser.Scene, style: AvatarStyle, seed: string): Promise<void> {
  const key = avatarTextureKey(style, seed);
  if (scene.textures.exists(key)) return Promise.resolve();
  const uri = toDataUri(renderSvg(style, seed));
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (!scene.textures.exists(key)) scene.textures.addImage(key, img);
      resolve();
    };
    img.onerror = () => resolve(); // fail-silent: mantem fallback vetorial
    img.src = uri;
  });
}

/** Gera e registra as texturas de avatar necessarias (idempotente). */
export async function ensureAvatars(scene: Phaser.Scene, specs: AvatarSpec[]): Promise<void> {
  const seen = new Set<string>();
  const unique = specs.filter((s) => {
    const k = avatarTextureKey(s.style, s.seed);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  await Promise.all(unique.map((s) => ensureOne(scene, s.style, s.seed)));
}
