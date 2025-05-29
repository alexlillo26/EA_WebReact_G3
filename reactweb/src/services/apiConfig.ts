const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:9000"
    : "https://ea3-api.upc.edu";

export { API_BASE_URL };
