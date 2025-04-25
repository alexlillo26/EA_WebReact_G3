// filepath: c:\EA\Proyecto\Proyecto-Frontend-Web\EA_WebReact_G3\reactweb\src\services\geocodingService.ts
export const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        return [parseFloat(lat), parseFloat(lon)];
      }
      return null; // No se encontraron resultados
    } catch (error) {
      console.error("Error al geocodificar la dirección:", error);
      return null;
    }
  };