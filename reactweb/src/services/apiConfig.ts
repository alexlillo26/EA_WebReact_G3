const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:9000/api"
    : "https://ea3-api.upc.edu/api";

export { API_BASE_URL };
