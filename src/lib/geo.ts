/**
 * Calculates the distance between two points in meters using the Haversine formula.
 * Returns a human-readable string (e.g., "500m", "1.2km").
 */
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): string | null {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371e3; // Earth's radius in metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // in metres
    if (d < 1000) return `${Math.round(d)}m`;
    return `${(d / 1000).toFixed(1)}km`;
}
