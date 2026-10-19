import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { useEffect } from 'react';
import { audio } from '../audio/engine';
import { CaroScreen } from '../games/caro/CaroScreen';
import { OaqScreen } from '../games/oaq/OaqScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { LoadingScreen } from '../screens/LoadingScreen';
import { MenuScreen } from '../screens/MenuScreen';
import { SetupScreen } from '../screens/SetupScreen';
import { useGame } from '../store/useGame';
import { SettingsModal } from '../ui/SettingsModal';
import { Stage } from '../ui/Stage';

const SCREENS = {
  loading: LoadingScreen,
  menu: MenuScreen,
  setup: SetupScreen,
  caro: CaroScreen,
  oaq: OaqScreen,
  leaderboard: LeaderboardScreen,
};

export function App() {
  const screen = useGame((s) => s.screen);
  const settings = useGame((s) => s.settings);
  const Screen = SCREENS[screen];

  useEffect(() => {
    audio.setVolumes(settings.musicVolume, settings.sfxVolume, settings.muted);
  }, [settings.musicVolume, settings.sfxVolume, settings.muted]);

  useEffect(() => {
    if (screen !== 'loading') audio.playMusic(settings.track);
  }, [screen, settings.track]);

  return (
    <MotionConfig reducedMotion={settings.reduceMotion ? 'always' : 'never'}>
      <Stage className={`theme-${settings.theme} ${settings.reduceMotion ? 'reduce-motion' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            className="screen"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <Screen />
          </motion.div>
        </AnimatePresence>
        <SettingsModal />
      </Stage>
    </MotionConfig>
  );
}
