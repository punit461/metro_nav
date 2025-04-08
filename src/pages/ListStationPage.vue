<template>
  <q-page class="q-pa-md">
    <h4 class="q-mb-md">Metro Stations</h4>

    <!-- Search Input -->
    <div class="q-pa-md">
      <q-input
        v-model="searchQuery"
        label="Search stations"
        outlined
        dense
        clearable
        class="q-ma-md"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <!-- Station List -->
    <q-list separator>
      <q-item
        v-for="station in filteredStations"
        :key="station.id"
        v-ripple
      >
        <q-item-section>
        <div class="row items-center">
          <q-item-label>{{ station.name }}</q-item-label>
          <q-item-label caption class="row items-center">
            <q-chip
              v-for="line in station.lines"
              :key="line.id"
              :style="{ backgroundColor: line }"
              text-color="black" 
              size="sm"
              class="q-mr-xs"
            >
              {{ line.toUpperCase() }}
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
import { ref, computed } from 'vue';

export default {
  name: 'ListStationPage',
  setup() {
    const searchQuery = ref('');

    const filteredStations = computed(() => {
      if (!searchQuery.value) {
        return metroData.stations.filter(station => station.is_active);
      }
      return metroData.stations.filter(
        station =>
          station.is_active &&
          station.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    return {
      searchQuery,
      filteredStations
    };
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