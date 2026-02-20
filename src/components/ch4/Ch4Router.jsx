/**
 * Ch.4 EC・D2C ルーター
 */
import React from 'react';
import '../../ch4.css';
import { useECStore } from '../../store/ecEngine';
import ProductSelect from './ProductSelect';
import BrandSetup from './BrandSetup';
import ChannelAdSetup from './ChannelAdSetup';
import ECOpening from './ECOpening';
import ECDashboard from './ECDashboard';
import ECResult from './ECResult';
import Ch4EventDisplay from './Ch4EventDisplay';
import AdPanel from './AdPanel';
import CRMPanel from './CRMPanel';
import ECExitSelect from './ECExitSelect';
import Ch4Report from './Ch4Report';

export default function Ch4Router() {
    const phase = useECStore(s => s.phase);

    const screens = {
        'ch4-product-select': ProductSelect,
        'ch4-brand-select': BrandSetup,
        'ch4-channel-setup': ChannelAdSetup,
        'ch4-opening': ECOpening,
        'ch4-dashboard': ECDashboard,
        'ch4-results': ECResult,
        'ch4-event': Ch4EventDisplay,
        'ch4-ads': AdPanel,
        'ch4-crm': CRMPanel,
        'ch4-exit': ECExitSelect,
        'ch4-report': Ch4Report,
    };

    const Screen = screens[phase] || ECDashboard;

    return (
        <div className="ch4-container ch4-fade-in" key={phase}>
            <Screen />
        </div>
    );
}
