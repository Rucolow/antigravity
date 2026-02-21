import { useGameStore } from './store/gameEngine';
import { useCafeStore } from './store/cafeEngine';
import { useRetailStore } from './store/retailEngine';
import { useHotelStore } from './store/hotelEngine';
import { useECStore } from './store/ecEngine';
import { useREStore } from './store/realEstateEngine';
import { useState, useEffect } from 'react';
import HUD from './components/HUD';
import Opening from './components/Opening';
import BaitoSelect from './components/BaitoSelect';
import Dashboard from './components/Dashboard';
import EventDisplay from './components/EventDisplay';
import Allocation from './components/Allocation';
import SedoriShop from './components/SedoriShop';
import MarcheScale from './components/MarcheScale';
import WeekResult from './components/WeekResult';
import Ending from './components/Ending';
import Report from './components/Report';
import Ch1Router from './components/ch1/Ch1Router';
import Ch2Router from './components/ch2/Ch2Router';
import Ch3Router from './components/ch3/Ch3Router';
import Ch4Router from './components/ch4/Ch4Router';
import Ch5Router from './components/ch5/Ch5Router';

const CH0_SCREENS = {
  'opening': Opening,
  'baito-select': BaitoSelect,
  'dashboard': Dashboard,
  'event': EventDisplay,
  'event-result': EventDisplay,
  'allocation': Allocation,
  'sedori': SedoriShop,
  'marche': MarcheScale,
  'results': WeekResult,
  'ending': Ending,
  'report': Report,
};

export default function App() {
  const ch0Phase = useGameStore(s => s.phase);
  const ch1Phase = useCafeStore(s => s.phase);
  const ch2Phase = useRetailStore(s => s.phase);
  const ch3Phase = useHotelStore(s => s.phase);
  const ch4Phase = useECStore(s => s.phase);
  const ch5Phase = useREStore(s => s.phase);
  const chapter = useGameStore(s => s.chapter);

  const isCh1 = chapter === 1;
  const isCh2 = chapter === 2;
  const isCh3 = chapter === 3;
  const isCh4 = chapter === 4;
  const isCh5 = chapter === 5;

  // Screen transition
  const [visible, setVisible] = useState(true);
  const currentPhase = isCh5 ? ch5Phase : (isCh4 ? ch4Phase : (isCh3 ? ch3Phase : (isCh2 ? ch2Phase : (isCh1 ? ch1Phase : ch0Phase))));
  const [displayedPhase, setDisplayedPhase] = useState(currentPhase);

  useEffect(() => {
    if (currentPhase !== displayedPhase) {
      setVisible(false);
      const timer = setTimeout(() => {
        setDisplayedPhase(currentPhase);
        setVisible(true);
        window.scrollTo(0, 0);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [currentPhase, displayedPhase]);

  // Ch.5
  if (isCh5) {
    return (
      <div className="app ch5-app" style={{ paddingTop: 0 }}>
        <div className={`screen-transition ${visible ? 'screen-transition--visible' : ''}`}>
          <Ch5Router />
        </div>
      </div>
    );
  }

  // Ch.4
  if (isCh4) {
    return (
      <div className="app ch4-app" style={{ paddingTop: 0 }}>
        <div className={`screen-transition ${visible ? 'screen-transition--visible' : ''}`}>
          <Ch4Router />
        </div>
      </div>
    );
  }

  // Ch.3
  if (isCh3) {
    return (
      <div className="app ch3-app" style={{ paddingTop: 0 }}>
        <div className={`screen-transition ${visible ? 'screen-transition--visible' : ''}`}>
          <Ch3Router />
        </div>
      </div>
    );
  }

  // Ch.2
  if (isCh2) {
    const showCh2Hud = false; // Ch.2は独自HUD
    return (
      <div className="app ch2-app" style={{ paddingTop: 0 }}>
        <div className={`screen-transition ${visible ? 'screen-transition--visible' : ''}`}>
          <Ch2Router />
        </div>
      </div>
    );
  }

  // Ch.1
  if (isCh1) {
    const showCh1Hud = !['ch1-opening', 'ch1-setup-location', 'ch1-setup-interior', 'ch1-setup-menu', 'ch1-setup-hours', 'ch1-open', 'ch1-report'].includes(ch1Phase);

    return (
      <div className="app ch1-app" style={showCh1Hud ? undefined : { paddingTop: 0 }}>
        <div className={`screen-transition ${visible ? 'screen-transition--visible' : ''}`}>
          <Ch1Router />
        </div>
      </div>
    );
  }

  // Ch.0
  const Screen = CH0_SCREENS[ch0Phase] || Opening;
  const showHud = !['opening', 'baito-select', 'ending', 'report'].includes(ch0Phase);
  const DisplayScreen = CH0_SCREENS[displayedPhase] || Opening;

  return (
    <div className="app" style={showHud ? undefined : { paddingTop: 0 }}>
      <HUD />
      <div className={`screen-transition ${visible ? 'screen-transition--visible' : ''}`}>
        <DisplayScreen />
      </div>
    </div>
  );
}
