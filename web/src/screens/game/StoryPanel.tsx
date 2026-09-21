import { useEffect, useState } from "react";
import { gameBus, uiBus, type StoryPayload } from "../../game/bus";

export default function StoryPanel() {
  const [story, setStory] = useState<StoryPayload | null>(null);

  useEffect(() => {
    const off = gameBus.on("story", setStory);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") uiBus.emit("advanceStory");
    };
    window.addEventListener("keydown", onKey);
    return () => {
      off();
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!story) return null;

  return (
    <div
      className="absolute inset-0 grid place-items-center bg-ink/85 p-8"
      onClick={() => uiBus.emit("advanceStory")}
    >
      <div className="max-w-2xl rounded-2xl border border-line bg-petrol/95 p-10 text-center shadow-2xl slide-in">
        <div className="hud-label text-emerald">{story.title}</div>
        <p className="mt-4 whitespace-pre-line font-body text-lg leading-relaxed text-cream">
          {story.body}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            uiBus.emit("advanceStory");
          }}
          className="mt-8 rounded-xl bg-gold px-6 py-3 font-display font-semibold text-ink hover:bg-gold-deep"
        >
          {story.isFinal ? "Ver creditos ▸" : "Continuar ▸"}
        </button>
      </div>
    </div>
  );
}
