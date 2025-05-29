import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Gym } from "../../models/Gym";
import { geocodeAddress } from "../../services/geocodingService";
import L, { Icon } from "leaflet"; // Asegúrate de importar correctamente
import { useLanguage } from "../../context/LanguageContext";

// Icono azul para los gimnasios sin combates
const blueIcon: Icon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

interface GymMapProps {
  gyms: Gym[];
  combats?: any[]; // Parámetro opcional para combates
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

const GymMap: React.FC<GymMapProps> = ({ gyms, combats = [] }) => {
  const { t } = useLanguage();
  const [gymLocations, setGymLocations] = useState<
    { id: string; name: string; place: string; position: [number, number] }[]
  >([]);
  const [center, setCenter] = useState<[number, number]>([40.416775, -3.70379]); // Valor inicial
  const [zoom, setZoom] = useState<number>(6); // Nivel de zoom inicial

  useEffect(() => {
    const fetchGymLocations = async () => {
      const locations = await Promise.all(
        gyms.map(async (gym) => {
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
      // Si hay ubicaciones válidas, actualiza el centro al primer gimnasio
      if (validLocations.length > 0) {
        setCenter(validLocations[0].position);
        setZoom(12); // Ajusta el nivel de zoom
      }
    };
    fetchGymLocations();
  }, [gyms]);

  // Si el centro aún no está definido, muestra un mensaje de carga
  if (!center) {
    return <div>{t("loadingMap")}</div>;
  }

  // Función auxiliar: determina el oponente según los campos creator y opponent
  function getOpponentName(combat: any): string {
    let userId = "";
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        userId = user.id;
      }
    } catch {}
    if (combat.creator && combat.creator._id && combat.creator._id !== userId) {
      return combat.creator.name || combat.creator._id;
    }
    if (combat.opponent && combat.opponent._id && combat.opponent._id !== userId) {
      return combat.opponent.name || combat.opponent._id;
    }
    return "-";
  }

  // Función auxiliar: obtiene todos los combates de un gimnasio
  function getCombatsForGym(gymId: string) {
    return combats.filter((combat) => {
      if (typeof combat.gym === 'string') {
        return combat.gym === gymId;
      } else if (combat.gym && combat.gym._id) {
        return combat.gym._id === gymId;
      }
      return false;
    });
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
          <SetMapView center={center} zoom={zoom} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {/* Renderiza los marcadores de los gimnasios */}
          {gymLocations.map((gym) => {
            return (
              <Marker key={gym.id} position={gym.position} icon={blueIcon as Icon}>
                <Popup>
                  <div>
                    <strong>{gym.name}</strong>
                    <br />
                    {gym.place}
                    {getCombatsForGym(gym.id).length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        <hr />
                        <strong>{t("combatListTitle")}</strong>
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                          {getCombatsForGym(gym.id).map((combat) => (
                            <li key={combat._id}>
                              <span>{t("date")}:</span> {String(combat.date).slice(0, 10)}<br />
                              <span>{t("time")}:</span> {combat.time}<br />
                              <span>{t("opponent")}:</span> {getOpponentName(combat)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default GymMap;
