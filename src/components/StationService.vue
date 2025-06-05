<template>
  <div>
    <h1>Nearest Metro Stations</h1>
    <q-list>
      <q-item v-for="station in nearestStations" :key="station.id" @click="navigate(station)">
        <q-item-section>
          <q-item-label>{{ station.name }}</q-item-label>
          <q-item-label caption>{{ station.lines.join(', ') }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-badge color="primary">{{ station.distance.toFixed(2) }} km</q-badge>
        </q-item-section>
      </q-item>
    </q-list>

    <div v-if="loading">Loading...</div>
    <div v-if="error">{{ error }}</div>
  </div>
</template>
<script>
import metroData from '../assets/metrojson.json'

export function findNearestStations(userLat, userLng, limit = 5) {
  const stations = metroData.stations

  function calculateDistance(lat1, lon1, lat2, lon2) {
    // Convert degrees to radians
    const R = 6371 // Earth's radius in km
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Returns distance in kilometers
  }

  // Calculate distances for all stations
  const stationsWithDistance = stations
    .filter((station) => station.coordinates && station.is_active)
    .map((station) => ({
      id: station.id,
      name: station.name,
      lines: station.lines,
      distance: calculateDistance(
        userLat,
        userLng,
        station.coordinates.lat,
        station.coordinates.lng,
      ),
      coordinates: station.coordinates,
    }))

  // Sort by distance and return top N stations
  return stationsWithDistance.sort((a, b) => a.distance - b.distance).slice(0, limit)
}
</script>
