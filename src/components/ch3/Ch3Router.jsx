import React from 'react';
import { useHotelStore } from '../../store/hotelEngine';
import '../../ch3.css';

import PropertySelect from './PropertySelect';
import RoomPresetSelect from './RoomPresetSelect';
import ChannelSetup from './ChannelSetup';
import HotelOpening from './HotelOpening';
import HotelDashboard from './HotelDashboard';
import HotelResult from './HotelResult';
import Ch3EventDisplay from './Ch3EventDisplay';
import PricingPanel from './PricingPanel';
import HotelExitSelect from './HotelExitSelect';
import Ch3Report from './Ch3Report';

export default function Ch3Router() {
    const phase = useHotelStore(s => s.phase);

    const renderPhase = () => {
        switch (phase) {
            case 'ch3-setup-property':
                return <PropertySelect />;
            case 'ch3-setup-rooms':
                return <RoomPresetSelect />;
            case 'ch3-setup-channel':
                return <ChannelSetup />;
            case 'ch3-opening':
                return <HotelOpening />;
            case 'ch3-dashboard':
                return <HotelDashboard />;
            case 'ch3-pricing':
                return <PricingPanel />;
            case 'ch3-simulating':
                return (
                    <div className="ch3-container" style={{ textAlign: 'center', paddingTop: 60 }}>
                        <p style={{ fontSize: '2rem', animation: 'ch3Pulse 1.2s ease infinite' }}>🏨</p>
                        <p style={{ fontSize: '0.85rem', marginTop: 12 }}>経営シミュレート中...</p>
                    </div>
                );
            case 'ch3-results':
                return <HotelResult />;
            case 'ch3-event':
                return <Ch3EventDisplay />;
            case 'ch3-exit':
                return <HotelExitSelect />;
            case 'ch3-report':
                return <Ch3Report />;
            default:
                return (
                    <div className="ch3-container">
                        <p>Ch.3 Loading... (phase: {phase})</p>
                    </div>
                );
        }
    };

    return renderPhase();
}
