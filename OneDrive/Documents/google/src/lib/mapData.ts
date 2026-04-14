import { useState, useEffect } from 'react';

// Geographic boundaries for Urban vs Rural simulation
export const URBAN_BOUNDS = {
  minLat: 28.55, maxLat: 28.65,
  minLng: 77.10, maxLng: 77.25
};

export const isUrban = (lat: number, lng: number) => {
  return lat >= URBAN_BOUNDS.minLat && lat <= URBAN_BOUNDS.maxLat &&
         lng >= URBAN_BOUNDS.minLng && lng <= URBAN_BOUNDS.maxLng;
};

export interface MobileUnit {
  id: string;
  name: string;
  lat: number;
  lng: number;
  targetLat?: number;
  targetLng?: number;
  type: 'MOBILE_CLINIC' | 'HEALTH_WORKER';
  status: 'TRANSIT' | 'ACTIVE' | 'IDLE';
}

export const useRealTimeTracking = (baseLocation?: [number, number]) => {
  const [units, setUnits] = useState<MobileUnit[]>([]);

  useEffect(() => {
    if (!baseLocation) return;

    // Initialize units with specific target nodes representing patient emergencies or designated zones
    const targetA = [baseLocation[0] + 0.02, baseLocation[1] - 0.01]; // Gap Hotspot
    const targetB = [baseLocation[0] - 0.03, baseLocation[1] + 0.02]; // Rural Area edge

    const initialUnits: MobileUnit[] = [
      { 
        id: 'MC1', name: 'Mobile Clinic 01', 
        lat: baseLocation[0] + 0.04, lng: baseLocation[1] + 0.04, 
        targetLat: targetA[0], targetLng: targetA[1],
        type: 'MOBILE_CLINIC', status: 'TRANSIT' 
      },
      { 
        id: 'MC2', name: 'Mobile Clinic 02', 
        lat: baseLocation[0] - 0.015, lng: baseLocation[1] + 0.005, 
        type: 'MOBILE_CLINIC', status: 'IDLE' 
      },
      { 
        id: 'HW1', name: 'Worker Anita', 
        lat: baseLocation[0] + 0.05, lng: baseLocation[1] - 0.04, 
        targetLat: targetB[0], targetLng: targetB[1],
        type: 'HEALTH_WORKER', status: 'TRANSIT' 
      },
      { 
        id: 'HW2', name: 'Worker Rohan', 
        lat: baseLocation[0] - 0.02, lng: baseLocation[1] - 0.02, 
        type: 'HEALTH_WORKER', status: 'ACTIVE' 
      },
    ];
    
    setUnits(initialUnits);

    // Advanced Interpolation Engine: Every 2 seconds, units move 5% closer to their targets
    const interval = setInterval(() => {
      setUnits(prevUnits => prevUnits.map(unit => {
        if (unit.status === 'TRANSIT' && unit.targetLat && unit.targetLng) {
          
          // Calculate distance vector
          const dLat = unit.targetLat - unit.lat;
          const dLng = unit.targetLng - unit.lng;
          const distance = Math.sqrt(dLat * dLat + dLng * dLng);
          
          // If arrived (within a very small threshold), change status to ACTIVE
          if (distance < 0.001) {
            return { ...unit, status: 'ACTIVE', lat: unit.targetLat, lng: unit.targetLng };
          }
          
          // Interpolate step (5% of remaining distance)
          return {
            ...unit,
            lat: unit.lat + (dLat * 0.05),
            lng: unit.lng + (dLng * 0.05)
          };
        }
        return unit;
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [baseLocation]);

  return units;
};

export const getRelativePolygons = (base: [number, number], offset: number = 0.05) => {
  return [
    [
      [base[0] + offset, base[1] + offset],
      [base[0] + offset + 0.02, base[1] + offset + 0.03],
      [base[0] + offset - 0.01, base[1] + offset + 0.05],
      [base[0] + offset - 0.03, base[1] + offset + 0.02]
    ] as [number, number][]
  ];
};
