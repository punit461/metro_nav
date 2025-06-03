<!-- Updated FindRoutePage.vue -->
<template>
  <q-page class="q-pa-md">
    <h4 class="q-mb-md">Find Route</h4>
    
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-5">
            <q-input
              v-model="fromStationName"
              label="From"
              filled
              readonly
              @click="navigateToStationSelect('from')"
              class="q-mb-md cursor-pointer"
            >
              <template v-slot:append>
                <q-icon name="arrow_drop_down" />
              </template>
            </q-input>
          </div>
          
          <div class="col-12 col-md-2 flex flex-center">
            <q-btn round color="primary" icon="swap_vert" @click="swapStations" />
          </div>
          
          <div class="col-12 col-md-5">
            <q-input
              v-model="toStationName"
              label="To"
              filled
              readonly
              @click="navigateToStationSelect('to')"
              class="q-mb-md cursor-pointer"
            >
              <template v-slot:append>
                <q-icon name="arrow_drop_down" />
              </template>
            </q-input>
          </div>
        </div>
        
        <div class="row justify-center q-mt-md">
          <q-btn
            color="primary"
            label="Find Route" icon="search"
            :disable="!fromStationId || !toStationId || fromStationId === toStationId"
            @click="findRoute"
            :loading="isLoading"
          />
        </div>
      </q-card-section>
    </q-card>
    
    <metro-route-result v-if="routeResult && !isNavigating" :result="routeResult" />

    <q-inner-loading :showing="isLoading">
      <q-spinner-dots size="50px" color="primary" /> </q-inner-loading>
  </q-page>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>

<script>
import MetroRouteResult from 'components/MetroRouteResult.vue';
import metroData from 'src/assets/metrojson.json';

export default {
  name: 'FindRoutePage',
  components: {
    MetroRouteResult
  },
  data() {
    return {
      fromStationId: null,
      fromStationName: '',
      toStationId: null,
      toStationName: '',
      routeResult: null,
      isLoading: false,
      isNavigating: false, // Keep this if used for route preview logic
      graph: {},
      processedQuery: false // Flag to ensure query is processed once
    };
  },
  watch: {
    '$route.query': {
      immediate: true,
      handler(newQuery) {
        const { selectedStationId, selectedStationName, selectingFor } = newQuery;
        if (selectedStationId && selectedStationName && selectingFor && !this.processedQuery) {
          this.processedQuery = true;

          if (selectingFor === 'from') {
            this.fromStationId = selectedStationId;
            this.fromStationName = selectedStationName;
            // Save to localStorage
            localStorage.setItem('fromStationId', selectedStationId);
            localStorage.setItem('fromStationName', selectedStationName);
          } else if (selectingFor === 'to') {
            this.toStationId = selectedStationId;
            this.toStationName = selectedStationName;
            // Save to localStorage
            localStorage.setItem('toStationId', selectedStationId);
            localStorage.setItem('toStationName', selectedStationName);
          }
          
          // Clean up query parameters
          const queryToKeep = { ...newQuery };
          delete queryToKeep.selectedStationId;
          delete queryToKeep.selectedStationName;
          delete queryToKeep.selectingFor;
          
          this.$router.replace({ query: queryToKeep }).finally(() => {
            setTimeout(() => {
              this.processedQuery = false;
            }, 0);
          });
        } else if (!selectedStationId && !selectedStationName && !selectingFor) {
          this.processedQuery = false;
        }
      }
    }
  },
  created() {
    this.buildGraph();
    // Restore values from local storage
    this.fromStationId = localStorage.getItem('fromStationId') || null;
    this.fromStationName = localStorage.getItem('fromStationName') || '';
    this.toStationId = localStorage.getItem('toStationId') || null;
    this.toStationName = localStorage.getItem('toStationName') || '';
  },
  methods: {
    buildGraph() {
      const graph = {};
      metroData.stations.forEach(station => { // [cite: 11]
        if (station.is_active) {
          graph[station.id] = station.connections
            .filter(connection => {
              const targetStation = metroData.stations.find(s => s.id === connection.to);
              return targetStation && targetStation.is_active;
            })
            .map(connection => ({ // [cite: 12]
              to: connection.to,
              distance: connection.distance,
              line_id: connection.line
            }));
        }
      });
      this.graph = graph; // [cite: 13]
    },
    navigateToStationSelect(field) {
      // Save current values before navigation
      localStorage.setItem('fromStationId', this.fromStationId);
      localStorage.setItem('fromStationName', this.fromStationName);
      localStorage.setItem('toStationId', this.toStationId);
      localStorage.setItem('toStationName', this.toStationName);
      
      this.$router.push({ path: '/list-stations', query: { selectingFor: field } });
    },
    findRoute() {
      if (this.fromStationId && this.toStationId && this.fromStationId !== this.toStationId) {
        this.isLoading = true;
        setTimeout(() => { // [cite: 14]
          const result = this.dijkstra(this.fromStationId, this.toStationId); // Use IDs
          if (result) {
            result.path = result.path.map(
              stationId => metroData.stations.find(station => station.id === stationId)?.name
            ); // [cite: 14, 15]
            this.routeResult = result;
            localStorage.setItem('currentRouteResult', JSON.stringify(result));
            this.$router.push('/route-details'); // [cite: 16]
          } else {
            this.$q.notify({
              color: 'negative',
              message: 'No route found between selected stations.',
              icon: 'error'
            });
            this.routeResult = null; // [cite: 17]
          }
          this.isLoading = false;
        }, 1000); // [cite: 14]
      }
    },
    dijkstra(start, end) { // [cite: 18]
      const distances = {};
      const previous = {}; // [cite: 19]
      const queue = new Set(Object.keys(this.graph));
      const lines = {}; // [cite: 19]

      queue.forEach(node => {
        distances[node] = Infinity;
        previous[node] = null;
        lines[node] = null;
      });
      distances[start] = 0; // [cite: 21]

      while (queue.size > 0) {
        const current = Array.from(queue).reduce((minNode, node) =>
          distances[node] < distances[minNode] ? node : minNode
        );
        queue.delete(current); // [cite: 22]

        if (current === end) {
          const path = [];
          const pathLines = []; // [cite: 23]
          let temp = end;
          while (temp) {
            path.unshift(temp);
            if (lines[temp]) { // [cite: 24]
              pathLines.unshift(lines[temp]); // [cite: 24]
            }
            temp = previous[temp]; // [cite: 25]
          }
          return { 
            path, 
            distance: Math.round(distances[end] * 10) / 10, 
            lines: pathLines
          }; // [cite: 26]
        }

        if (!this.graph[current]) continue; // Station might not be in graph if inactive or no connections

        this.graph[current].forEach(neighbor => {
          const alt = distances[current] + neighbor.distance;
          if (alt < distances[neighbor.to]) {
            distances[neighbor.to] = alt;
            previous[neighbor.to] = current;
            lines[neighbor.to] = neighbor.line_id; // [cite: 27]
          }
        });
      }
      return null; // [cite: 29]
    },
    swapStations() {
      // Swap both IDs and names
      [this.fromStationId, this.toStationId] = [this.toStationId, this.fromStationId];
      [this.fromStationName, this.toStationName] = [this.toStationName, this.fromStationName];

      if (this.routeResult) {
        this.routeResult = null; // [cite: 32]
      }
    }
  }
};
</script>