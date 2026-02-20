/**
 * Ch.5 ルーター
 */
import React from 'react';
import { useREStore } from '../../store/realEstateEngine';
import '../../ch5.css';

import PropertySelect from './PropertySelect';
import YieldAnalysis from './YieldAnalysis';
import LoanSetup from './LoanSetup';
import REOpening from './REOpening';
import REDashboard from './REDashboard';
import REResult from './REResult';
import Ch5EventDisplay from './Ch5EventDisplay';
import BSDisplay from './BSDisplay';
import PropertyBuy from './PropertyBuy';
import GameClear from './GameClear';
import FinalReport from './FinalReport';

export default function Ch5Router() {
    const phase = useREStore(s => s.phase);

    const Component = {
        'ch5-property-select': PropertySelect,
        'ch5-yield-analysis': YieldAnalysis,
        'ch5-loan-setup': LoanSetup,
        'ch5-opening': REOpening,
        'ch5-dashboard': REDashboard,
        'ch5-results': REResult,
        'ch5-event': Ch5EventDisplay,
        'ch5-bs-display': BSDisplay,
        'ch5-property-buy': PropertyBuy,
        'ch5-game-clear': GameClear,
        'ch5-final-report': FinalReport,
    }[phase] || REDashboard;

    return (
        <div className="ch5-container ch5-fade-in" key={phase}>
            <Component />
        </div>
    );
}
