import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Gym } from "../../models/Gym";
import { geocodeAddress } from "../../services/geocodingService";
import L, { Icon } from "leaflet"; // Ensure correct import
import { useLanguage } from "../../context/LanguageContext";
import { getGymCombats } from "../../services/combatService";

const redIcon: Icon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png", // URL del icono
  iconSize: [25, 41], // Tamaño del icono
  iconAnchor: [12, 41], // Punto de anclaje del icono
  popupAnchor: [1, -34], // Punto donde se abre el popup
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png", // Sombra del icono
  shadowSize: [41, 41], // Tamaño de la sombra
});

interface GymMapProps {
  gyms: Gym[];
}

// Componente para actualizar dinámicamente el centro y el zoom del mapa
const SetMapView: React.FC<{ center: [number, number]; zoom: number }> = ({
  center,
  zoom,
}) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom); // Actualiza el centro y el zoom del mapa
  }, [center, zoom, map]);
  return null;
};

const GymMap: React.FC<GymMapProps> = ({ gyms }) => {
  const { t } = useLanguage();
  const [gymLocations, setGymLocations] = useState<
    { id: string; name: string; place: string; position: [number, number] }[]
  >([]);
  const [center, setCenter] = useState<[number, number]>([40.416775, -3.70379]); // Valor inicial
  const [zoom, setZoom] = useState<number>(6); // Nivel de zoom inicial
  // Combates cache: { [gymId]: { loading, combats, error } }
  const [combatsCache, setCombatsCache] = useState<Record<string, { loading: boolean; combats: any[]; error: string | null }>>({});
  const [activeGymId, setActiveGymId] = useState<string | null>(null);

  useEffect(() => {
    const fetchGymLocations = async () => {
      const locations = await Promise.all(
        gyms.map(async (gym) => {
          if (!gym._id) return null; 
          const position = await geocodeAddress(gym.place);
          if (position) {
            return { id: gym._id, name: gym.name, place: gym.place, position };
          }
          return null;
        })
      );
      const validLocations = locations.filter(
        (location) => location !== null
      ) as any;
      setGymLocations(validLocations);
      if (validLocations.length > 0) {
        setCenter(validLocations[0].position);
        setZoom(12);
      }
    };
    fetchGymLocations();
  }, [gyms]);

  // Load Combates
  const handlePopupOpen = async (gymId: string) => {
    if (!gymId) return; 
    setActiveGymId(gymId);
    if (!combatsCache[gymId]) {
      setCombatsCache((prev) => ({ ...prev, [gymId]: { loading: true, combats: [], error: null } }));
      try {
        const res = await getGymCombats(gymId, 1, 10);
        // Only show future Combates
        const now = new Date();
        const futureCombats = res.combats.filter((c: any) => {
          const combatDate = new Date(c.date);
          return combatDate >= now;
        });
        setCombatsCache((prev) => ({ ...prev, [gymId]: { loading: false, combats: futureCombats, error: null } }));
      } catch (err) {
        setCombatsCache((prev) => ({ ...prev, [gymId]: { loading: false, combats: [], error: t("errorLoadingCombats") } }));
      }
    }
  };

  // Si el centro aún no está definido, muestra un mensaje de carga
  if (!center) {
    return <div>{t("loadingMap")}</div>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "20px",
          color: "#333",
          fontSize: "24px",
        }}
      >
        {t("gymMapTitle")}
      </h2>
      <div
        style={{
          height: "500px",
          width: "80%",
          maxWidth: "800px",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
      >
        <MapContainer style={{ height: "100%", width: "100%" }}>
          <SetMapView center={center} zoom={zoom} />{" "}
          {/* Actualiza dinámicamente el centro y el zoom */}
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {gymLocations.map((gym) => (
            <Marker key={gym.id} position={gym.position} icon={redIcon as Icon}>
              <Popup
                eventHandlers={{
                  add: () => handlePopupOpen(gym.id),
                  popupopen: () => handlePopupOpen(gym.id),
                }}
              >
                <strong>{gym.name}</strong>
                <br />
                {gym.place}
                <br />
                <b>Lista de Combates</b>
                <div style={{ minWidth: 220 }}>
                  {combatsCache[gym.id]?.loading && <div>{t("loadingCombats")}</div>}
                  {combatsCache[gym.id]?.error && <div style={{ color: 'red' }}>{combatsCache[gym.id]?.error}</div>}
                  {combatsCache[gym.id] && !combatsCache[gym.id].loading && !combatsCache[gym.id].error && (
                    <ul style={{ paddingLeft: 18 }}>
                      {combatsCache[gym.id].combats.length === 0 && <li>{t("noCombatsAvailable")}</li>}
                      {combatsCache[gym.id].combats.map((combat: any) => {
                        let opponentName = '-';
                        if (combat.opponent) {
                          if (typeof combat.opponent === 'string') {
                            opponentName = combat.opponent;
                          } else if (typeof combat.opponent === 'object') {
                            opponentName = combat.opponent.username || combat.opponent.name || combat.opponent._id || '-';
                          }
                        }
                        return (
                          <li key={combat._id} style={{
                            marginBottom: 12,
                            padding: '10px 12px',
                            background: '#f5f5f5',
                            borderRadius: 6,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                            listStyle: 'none',
                            fontSize: 15
                          }}>
                            <div style={{ fontWeight: 600, color: '#333' }}>Fecha: <span style={{ fontWeight: 400 }}>{combat.date?.slice(0, 10)}</span></div>
                            <div style={{ color: '#555' }}>Hora: <span style={{ fontWeight: 500 }}>{combat.time}</span></div>
                            <div style={{ color: '#555' }}>Nivel: <span style={{ fontWeight: 500 }}>{combat.level || '-'}</span></div>
                            <div style={{ color: '#555' }}>Oponente: <span style={{ fontWeight: 500 }}>{opponentName}</span></div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default GymMap;
