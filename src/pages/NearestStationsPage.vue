<template>
  <div class="nearest-stations">

    <q-card-section>
      <div class="text-h6">Nearest Stations</div>
    </q-card-section>

    <div v-if="loading" class="text-center">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <div v-else-if="error" class="text-negative">
      {{ error }}
    </div>

    <div v-else>
      <q-list bordered separator>
        <q-item v-for="station in nearestStations" :key="station.id" clickable v-ripple>
          <q-item-section>
            <q-item-label>{{ station.name }}</q-item-label>
            <q-item-label caption>
              {{ station.distance.toFixed(2) }} km away
              <q-chip v-for="line in station.lines" :key="line" :color="getLineColor(line)" text-color="white" size="sm"
                class="q-ml-sm">
                {{ line }}
              </q-chip>
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat round color="primary" icon="directions" @click="navigate(station)" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { findNearestStations } from '../components/StationService.vue';

export default {
  name: 'NearestStations',

  setup() {
    const nearestStations = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const getLineColor = (line) => {
      const colors = {
        purple: 'purple',
        green: 'green',
        blue: 'blue',
        yellow: 'amber-8',
        pink: 'pink'
      };
      return colors[line] || 'grey';
    };

    const getCurrentLocation = () => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by your browser'));
        }

        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position.coords),
          (error) => reject(error)
        );
      });
    };

    const loadNearestStations = async () => {
      loading.value = true;
      error.value = null;

      try {
        const coords = await getCurrentLocation();
        nearestStations.value = findNearestStations(coords.latitude, coords.longitude);
      } catch (err) {
        error.value = 'Could not determine your location. Please enable location services.';
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const navigate = (station) => {
      if (!station || !station.coordinates.lat || !station.coordinates.lng) {
        console.error('Station coordinates not available');
        return;
      }
      const url = `https://www.google.com/maps/dir/?api=1&destination=${station.coordinates.lat},${station.coordinates.lng}`;
      window.open(url, '_blank');
    };

    onMounted(() => {
      loadNearestStations();
    });

    return {
      nearestStations,
      loading,
      error,
      getLineColor,
      navigate
    };
  }
};
</script>
