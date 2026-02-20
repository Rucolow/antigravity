import React from 'react';
import { useCafeStore } from '../../store/cafeEngine';
import LocationSelect from './LocationSelect';
import InteriorSelect from './InteriorSelect';
import MenuSetup from './MenuSetup';
import HoursSelect from './HoursSelect';
import CafeOpening from './CafeOpening';
import CafeDashboard from './CafeDashboard';
import CafeResult from './CafeResult';
import Ch1EventDisplay from './Ch1EventDisplay';
import ExitSelect from './ExitSelect';
import Ch1Report from './Ch1Report';
import StaffManage from './StaffManage';
import Ch2Bridge from './Ch2Bridge';

const SCREENS = {
    'ch1-setup-location': LocationSelect,
    'ch1-setup-interior': InteriorSelect,
    'ch1-setup-menu': MenuSetup,
    'ch1-setup-hours': HoursSelect,
    'ch1-open': CafeOpening,
    'ch1-dashboard': CafeDashboard,
    'ch1-operation': CafeDashboard,
    'ch1-simulating': CafeDashboard,
    'ch1-results': CafeResult,
    'ch1-event': Ch1EventDisplay,
    'ch1-exit': ExitSelect,
    'ch1-report': Ch1Report,
    'ch1-staff': StaffManage,
    'ch1-bridge': Ch2Bridge,
};

export default function Ch1Router() {
    const phase = useCafeStore(s => s.phase);
    const Screen = SCREENS[phase];

    if (!Screen) {
        return <div className="ch1-loading">Chapter 1 読み込み中…</div>;
    }

    return <Screen />;
}
