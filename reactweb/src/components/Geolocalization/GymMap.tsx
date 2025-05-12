import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Gym } from "../../models/Gym";
import { geocodeAddress } from "../../services/geocodingService";
import L, { Icon } from "leaflet"; // Ensure correct import
import { useLanguage } from "../../context/LanguageContext";

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

  useEffect(() => {
    const fetchGymLocations = async () => {
      const locations = await Promise.all(
        gyms.map(async (gym) => {
          const position = await geocodeAddress(gym.place);
          if (position) {
            return { id: gym.id, name: gym.name, place: gym.place, position };
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
        setZoom(12); // Ajusta el zoom al nivel deseado
      }
    };

    fetchGymLocations();
  }, [gyms]);

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
              <Popup>
                <strong>{gym.name}</strong>
                <br />
                {gym.place}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default GymMap;
