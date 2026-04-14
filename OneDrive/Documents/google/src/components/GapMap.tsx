import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap, Polygon, Marker, LayersControl, Polyline, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import { useRealTimeTracking, getRelativePolygons, MobileUnit } from '@/lib/mapData';
import { useDb } from '@/context/DatabaseContext';

// Map icon configuration for different units
const getIcon = (type: string, status: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="marker-container ${status.toLowerCase()}">
            <div class="marker-icon ${type.toLowerCase()}"></div>
            <div class="marker-pulse"></div>
          </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const MapEffect = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [map, center]);
  return null;
};

// Generates procedural multiple rings for Heatmap aesthetic
const renderHeatmap = (baseLat: number, baseLng: number) => {
  const radii = [1500, 1000, 500];
  const opacities = [0.1, 0.25, 0.5];
  
  return radii.map((radius, i) => (
    <Circle
      key={`heat-${i}`}
      center={[baseLat, baseLng]}
      radius={radius}
      pathOptions={{ fillColor: '#ff3366', color: 'transparent', fillOpacity: opacities[i], weight: 0 }}
    />
  ));
};

const GapMap = ({ isSatellite = false }: { isSatellite?: boolean }) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const units = useRealTimeTracking(userLocation || [28.6139, 77.2090]);
  const { problems } = useDb();
  
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
          setUserLocation([28.6139, 77.2090]); // Fallback to New Delhi
        }
      );
    } else {
      setUserLocation([28.6139, 77.2090]);
    }
  }, []);

  const base = userLocation || [28.6139, 77.2090];
  const ruralPolys = getRelativePolygons(base, 0.03);
  const urbanPolys = getRelativePolygons(base, -0.04);
  const hotspotLocation = [base[0] + 0.02, base[1] - 0.01];

  // Get active problems with locations
  const activeLocations = problems.filter(p => p.status === 'pending' && p.location);

  const activeUnitsCount = units.filter(u => u.status === 'ACTIVE' || u.status === 'TRANSIT').length;

  return (
    <div className="glass" style={{ 
      height: '500px', 
      width: '100%', 
      overflow: 'hidden', 
      borderRadius: '24px',
      position: 'relative'
    }}>
      
      {/* Live Telemetry HUD Overlay */}
      <div style={{
        position: 'absolute', top: '20px', left: '20px', zIndex: 1000,
        background: 'rgba(10, 15, 25, 0.8)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px',
        padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)', width: '220px', color: 'white'
      }} className="animate-fade-in">
        <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>Live Telemetry</h4>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Deployed Units:</span>
          <strong>{activeUnitsCount} / {units.length}</strong>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Urgent Alerts:</span>
          <strong style={{ color: 'var(--accent)' }}>{activeLocations.length} Pending</strong>
        </div>
        
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
        
        <div style={{ fontSize: '0.7rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {units.filter(u => u.status === 'TRANSIT').map(u => (
            <div key={`hud-${u.id}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>{u.name}</span>
              <span style={{ color: '#0072ff' }}>In Transit...</span>
            </div>
          ))}
        </div>
      </div>

      <MapContainer 
        center={base} 
        zoom={12} 
        style={{ 
          height: '100%', 
          width: '100%', 
          filter: isSatellite ? 'none' : 'invert(1) hue-rotate(180deg) brightness(0.8) contrast(1.2)' 
        }}
        zoomControl={true}
      >
        <TileLayer
          attribution={isSatellite ? 'Tiles &copy; Esri' : '&copy; OpenStreetMap contributors'}
          url={isSatellite 
            ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
        />
        {userLocation && <MapEffect center={userLocation} />}
        
        <LayersControl position="topright">
          
          <LayersControl.Overlay checked name="Patient SOS">
            <LayerGroup>
              {activeLocations.map(p => (
                p.location && (
                  <Marker key={`p-${p.id}`} position={[p.location.lat, p.location.lng]} icon={L.divIcon({
                    className: 'patient-marker',
                    html: '<div style="width: 16px; height: 16px; background: var(--accent); border: 2px solid white; border-radius: 50%; box-shadow: 0 0 15px var(--accent);"></div>',
                    iconSize: [20, 20]
                  })}>
                    <Popup>
                      <div style={{ color: '#000', fontSize: '11px' }}>
                        <strong>Patient: {p.userName}</strong><br/>
                        Issue: {p.description}
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Mobile Clinics & Workers">
            <LayerGroup>
              {units.map((unit) => (
                <React.Fragment key={`u-${unit.id}`}>
                  <Marker position={[unit.lat, unit.lng]} icon={getIcon(unit.type, unit.status)}>
                    <Popup>
                      <div style={{ color: '#000', fontSize: '11px' }}>
                        <strong>{unit.name}</strong><br/>
                        Status: <span style={{ fontWeight: 'bold', color: unit.status === 'TRANSIT' ? '#0072ff' : (unit.status === 'ACTIVE' ? '#00ff64' : '#ffb800') }}>{unit.status}</span>
                      </div>
                    </Popup>
                  </Marker>
                  
                  {/* Deployment Path Generation for Transit units */}
                  {unit.status === 'TRANSIT' && unit.targetLat && unit.targetLng && (
                    <Polyline 
                      positions={[[unit.lat, unit.lng], [unit.targetLat, unit.targetLng]]}
                      pathOptions={{ color: '#0072ff', weight: 2, dashArray: '8, 8', opacity: 0.6 }}
                    />
                  )}
                </React.Fragment>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Disease Gap Heatmaps">
            <LayerGroup>
              {/* Complex procedural heatmap rings */}
              {renderHeatmap(hotspotLocation[0], hotspotLocation[1])}
              <Marker position={hotspotLocation as [number, number]} opacity={0}>
                <Popup>Detected Local Health Gap Hotspot</Popup>
              </Marker>
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Structural Urban Zones">
            <LayerGroup>
              {urbanPolys.map((poly, idx) => (
                <Polygon key={`u-${idx}`} positions={poly} pathOptions={{ fillColor: '#00d1ff', fillOpacity: 0.1, color: '#00d1ff', weight: 1, dashArray: '5, 5' }}>
                  <Popup>Urban Sector: Enhanced Facilities</Popup>
                </Polygon>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Last-Mile Rural Zones">
            <LayerGroup>
              {ruralPolys.map((poly, idx) => (
                <Polygon key={`r-${idx}`} positions={poly} pathOptions={{ fillColor: '#ffb800', fillOpacity: 0.1, color: '#ffb800', weight: 1, dashArray: '5, 5' }}>
                  <Popup>Rural Last-Mile: Critical Gap Area</Popup>
                </Polygon>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        
        </LayersControl>
        
        {/* User Location Marker (Always strictly On) */}
        {userLocation && (
          <Marker position={userLocation} icon={L.divIcon({
            className: 'user-marker',
            html: '<div style="width: 14px; height: 14px; background: #0072ff; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px #0072ff;"></div>',
            iconSize: [20, 20]
          })}>
            <Popup>Command Center (You)</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Legacy Legend */}
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="glass" style={{ padding: '8px 12px', fontSize: '10px', fontWeight: '600', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0072ff' }}></div> Active Routing
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff3366' }}></div> Disease Hotspot
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-div-icon { background: transparent !important; border: none !important; }
        .marker-container { position: relative; width: 30px; height: 30px; }
        .marker-icon {
          width: 12px; height: 12px; background: white; border: 2px solid var(--primary);
          border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2;
        }
        .marker-icon.mobile_clinic { border-color: #00ff64; }
        .marker-icon.health_worker { border-color: #ffb800; }
        
        .marker-pulse {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 100%; height: 100%; border: 2px solid var(--primary); border-radius: 50%;
          animation: map-pulse 2s infinite ease-out; opacity: 0;
        }
        .transit .marker-pulse { border-color: #0072ff; }
        .active .marker-pulse { border-color: #00ff64; }

        @keyframes map-pulse {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        
        .leaflet-control-layers {
          background: rgba(10, 15, 25, 0.9) !important;
          color: white !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important;
          backdrop-filter: blur(10px);
        }
        .leaflet-control-layers-list form { margin: 10px; }
      `}</style>
    </div>
  );
};

export default GapMap;
