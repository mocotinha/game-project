import { useEffect } from "react";
import { useAppStore } from "./game/store";
import { audio } from "./game/audio";
import MainMenu from "./screens/MainMenu";
import NewGame from "./screens/NewGame";
import LoadGame from "./screens/LoadGame";
import Configuration from "./screens/Configuration";
import Credits from "./screens/Credits";
import GameScreen from "./screens/game/GameScreen";

const TEXT_SCALE: Record<string, string> = {
  small: "14px",
  normal: "16px",
  large: "19px",
};

export default function App() {
  const screen = useAppStore((s) => s.screen);
  const settings = useAppStore((s) => s.settings);

  // Volumes de audio seguem as configuracoes.
  useEffect(() => {
    audio.setVolumes(settings.music_volume, settings.sound_volume);
  }, [settings.music_volume, settings.sound_volume]);

  // Acessibilidade: tamanho do texto e alto contraste aplicados globalmente.
  useEffect(() => {
    document.documentElement.style.fontSize = TEXT_SCALE[settings.text_size] ?? "16px";
    document.documentElement.classList.toggle("high-contrast", settings.high_contrast);
  }, [settings.text_size, settings.high_contrast]);

  // Musica ambiente por contexto (menu vs jogo).
  useEffect(() => {
    audio.playMusic(screen === "game" ? "world" : "menu");
  }, [screen]);

  return (
    <div id="stage">
      <div className="relative h-screen w-screen overflow-hidden">
        {screen === "menu" && <MainMenu />}
        {screen === "new" && <NewGame />}
        {screen === "load" && <LoadGame />}
        {screen === "config" && <Configuration />}
        {screen === "credits" && <Credits />}
        {screen === "game" && <GameScreen />}
      </div>
    </div>
  );
}
