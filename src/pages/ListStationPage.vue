<template>
  <q-page class="q-pa-md">
    <h4 class="q-mb-md">Metro Stations</h4>

    <div class="q-pa-md">
      <q-input v-model="searchQuery" label="Search stations" outlined dense clearable class="q-ma-md">
        <template v-slot:append>
          <q-icon name="search" /> </template>
      </q-input>
    </div>

    <q-list separator>
      <q-item v-for="station in filteredStations" :key="station.id" v-ripple clickable @click="selectStation(station)">
        <q-item-section>
          <div class="row items-center">
            <q-item-label>{{ station.name }}</q-item-label> <q-item-label caption class="row items-center">
              <q-chip v-for="lineId in station.lines" :key="lineId"
                :style="{ backgroundColor: getLineColor(lineId) === 'yellow' ? '#ffb300' : getLineColor(lineId) }"
                text-color="white" size="sm" class="q-mr-xs">
                {{ getLineName(lineId) }}
              </q-chip>
            </q-item-label>
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script>
import metroData from 'src/assets/metrojson.json';
import { ref, computed } from 'vue'; // [cite: 37]
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'ListStationPage',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const searchQuery = ref('');

    // Read the 'selectingFor' query parameter passed from FindRoutePage
    const selectingForField = ref(route.query.selectingFor);

    const allStations = metroData.stations
      .filter(station => station.is_active)
      .map(station => ({
        id: station.id,
        name: station.name,
        lines: station.lines,
        // Assuming station.lines is an array of line IDs. If not, adjust accordingly.
        // The original code [cite: 36] used `line` directly as `backgroundColor` and `line.toUpperCase()`
        // This implies line was a string like "red" or a hex color.
        // We need to map line_ids to their visual properties.
        // For this example, I'm assuming station.lines contains line_ids from metroData.lines
        //lines: station.connections.map(conn => conn.line_id)
        //         .filter((value, index, self) => self.indexOf(value) === index) // Unique line_ids
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const filteredStations = computed(() => { // [cite: 38]
      if (!searchQuery.value) {
        return allStations;
      }
      return allStations.filter(
        station =>
          station.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    const getLineData = (lineId) => {
      return metroData.lines.find(line => line.id === lineId);
    }

    const getLineColor = (lineId) => {
      const line = getLineData(lineId);
      return line ? line.id : '#757575'; // Default color
    };

    const getLineName = (lineId) => {
      const line = getLineData(lineId);
      return line ? line.name.toUpperCase() : 'N/A';
    };

    const selectStation = (station) => {
      router.push({
        path: '/find-route', // Or your defined route for FindRoutePage
        query: {
          selectedStationId: station.id,
          selectedStationName: station.name,
          selectingFor: selectingForField.value // Pass this back
        }
      });
    };

    return {
      searchQuery,
      filteredStations,
      selectStation,
      getLineColor,
      getLineName
    }; // [cite: 39]
  }
};
</script>
<style scoped>
.q-pa-md {
  width: 100%;
}

.row {
  margin: 0;

  justify-content: space-between;
  align-items: center;
  display: flex;
}

.color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}
</style>
