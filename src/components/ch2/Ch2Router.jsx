import React from 'react';
import { useRetailStore } from '../../store/retailEngine';
import IndustrySelect from './IndustrySelect';
import RetailLocationSelect from './RetailLocationSelect';
import RetailInteriorSelect from './RetailInteriorSelect';
import InitialStockSetup from './InitialStockSetup';
import ShopOpening from './ShopOpening';
import RetailDashboard from './RetailDashboard';
import RetailResult from './RetailResult';
import Ch2EventDisplay from './Ch2EventDisplay';
import RetailExitSelect from './RetailExitSelect';
import Ch2Report from './Ch2Report';
import InventoryManage from './InventoryManage';
import '../../ch2.css';

const SCREENS = {
    'ch2-setup-industry': IndustrySelect,
    'ch2-setup-location': RetailLocationSelect,
    'ch2-setup-interior': RetailInteriorSelect,
    'ch2-setup-stock': InitialStockSetup,
    'ch2-open': ShopOpening,
    'ch2-dashboard': RetailDashboard,
    'ch2-operation': RetailDashboard,
    'ch2-simulating': RetailDashboard,
    'ch2-results': RetailResult,
    'ch2-event': Ch2EventDisplay,
    'ch2-exit': RetailExitSelect,
    'ch2-report': Ch2Report,
    'ch2-inventory': InventoryManage,
};

export default function Ch2Router() {
    const phase = useRetailStore(s => s.phase);
    const Screen = SCREENS[phase];

    if (!Screen) {
        return <div className="ch2-opening">Chapter 2 読み込み中…</div>;
    }

    return <Screen />;
}
