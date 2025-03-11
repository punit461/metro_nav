<template>
  <div class="station-selector">
    <div class="q-pa-md">
      <q-input
        v-model="search"
        :label="label"
        outlined
        dense
        clearable
        @click="showDialog = true"
        @clear="clearSelection"
        readonly
      >
        <template v-slot:append>
          <q-icon name="place" />
        </template>
      </q-input>
    </div>

    <q-dialog v-model="showDialog" position="bottom">
      <q-card style="width: 100%; max-width: 500px">
        <q-card-section>
          <div class="text-h6">Select {{ label }} Station</div>
        </q-card-section>

        <q-card-section class="q-pa-none">
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

          <q-list separator>
            <q-item
              v-for="station in filteredStations"
              :key="station.id"
              clickable
              v-ripple
              @click="selectStation(station)"
            >
              <q-item-section>
                <q-item-label>{{ station.name }}</q-item-label>
                <q-item-label caption>
                  <q-chip
                    v-for="line in station.lines"
                    :key="line.id"
                    :style="{ backgroundColor: line.color }"
                    text-color="white"
                    size="sm"
                    class="q-mr-xs"
                  >
                    {{ line.name }}
                  </q-chip>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { metroStations } from '../assets/metro-data.js';

export default {
  name: 'StationSelector',
  props: {
    modelValue: {
      type: Object,
      default: () => null
    },
    label: {
      type: String,
      default: 'Station'
    }
  },
  emits: ['update:modelValue'],
  
  setup(props, { emit }) {
    const search = ref('');
    const searchQuery = ref('');
    const showDialog = ref(false);
    const stations = ref(metroStations);

    // Update the display value when model changes
    watch(() => props.modelValue, (newValue) => {
      if (newValue) {
        search.value = newValue.name;
      } else {
        search.value = '';
      }
    }, { immediate: true });

    const filteredStations = computed(() => {
      if (!searchQuery.value) {
        return stations.value;
      }
      const query = searchQuery.value.toLowerCase();
      return stations.value.filter(station => 
        station.name.toLowerCase().includes(query)
      );
    });

    const selectStation = (station) => {
      search.value = station.name;
      emit('update:modelValue', station);
      showDialog.value = false;
      searchQuery.value = '';
    };

    const clearSelection = () => {
      search.value = '';
      emit('update:modelValue', null);
    };

    return {
      search,
      searchQuery,
      showDialog,
      filteredStations,
      selectStation,
      clearSelection
    };
  }
};
</script>

<style scoped>
.station-selector {
  width: 100%;
}
</style>