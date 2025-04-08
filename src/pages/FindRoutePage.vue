<!-- Updated FindRoutePage.vue -->
<template>
  <q-page class="q-pa-md">
    <h4 class="q-mb-md">Find Route</h4>
    
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-5">
            <q-select
              v-model="fromStation"
              :options="stationOptions"
              label="From"
              map-options
              emit-value
              option-value="id"
              option-label="name"
              filled
              class="q-mb-md"
            />
          </div>
          
          <div class="col-12 col-md-2 flex flex-center">
            <q-btn round color="primary" icon="swap_vert" @click="swapStations" />
          </div>
          
          <div class="col-12 col-md-5">
            <q-select
              v-model="toStation"
              :options="stationOptions"
              label="To"
              map-options
              emit-value
              option-value="id"
              option-label="name"
              filled
              class="q-mb-md"
            />
          </div>
        </div>
        
        <div class="row justify-center q-mt-md">
          <q-btn
            color="primary"
            label="Find Route"
            icon="search"
            :disable="!fromStation || !toStation || fromStation === toStation"
            @click="findRoute"
            :loading="isLoading"
          />
        </div>
      </q-card-section>
    </q-card>
    
    <!-- Quick preview of the route if available -->
    <metro-route-result v-if="routeResult && !isNavigating" :result="routeResult" />

    <!-- Loading state while finding route -->
    <q-inner-loading :showing="isLoading">
      <q-spinner-dots size="50px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

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
      fromStation: null,
      toStation: null,
      routeResult: null,
      isLoading: false,
      isNavigating: false,
      stationOptions: metroData.stations
        .filter(station => station.is_active)
        .map(station => ({
          id: station.id,
          name: station.name
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      graph: {}
    };
  },
  created() {
    this.buildGraph();
  },
  methods: {
    buildGraph() {
      const graph = {};
      metroData.stations.forEach(station => {
        if (station.is_active) {
          graph[station.id] = station.connections
            .filter(connection => {
              const targetStation = metroData.stations.find(s => s.id === connection.to);
              return targetStation && targetStation.is_active;
            })
            .map(connection => ({
              to: connection.to,
              distance: connection.distance,
              line_id: connection.line_id
            }));
        }
      });
      this.graph = graph;
    },
    findRoute() {
      if (this.fromStation && this.toStation && this.fromStation !== this.toStation) {
        this.isLoading = true;
        
        // Simulate a network request (remove in production)
        setTimeout(() => {
          const result = this.dijkstra(this.fromStation, this.toStation);
          if (result) {
            // Map station IDs to names
            result.path = result.path.map(
              stationId => metroData.stations.find(station => station.id === stationId)?.name
            );
            
            this.routeResult = result;
            
            // Store the route result in localStorage
            localStorage.setItem('currentRouteResult', JSON.stringify(result));
            // Navigate to route details page
            this.$router.push('/route-details');
          } else {
            this.$q.notify({
              color: 'negative',
              message: 'No route found between selected stations.',
              icon: 'error'
            });
            this.routeResult = null;
          }
          this.isLoading = false;
        }, 1000);
      }
    },
    dijkstra(start, end) {
      const distances = {};
      const previous = {};
      const queue = new Set(Object.keys(this.graph));
      const lines = {}; // Keep track of which line is used for each segment

      // Initialize distances
      queue.forEach(node => {
        distances[node] = Infinity;
        previous[node] = null;
        lines[node] = null;
      });
      distances[start] = 0;

      while (queue.size > 0) {
        // Find the node with the smallest distance
        const current = Array.from(queue).reduce((minNode, node) =>
          distances[node] < distances[minNode] ? node : minNode
        );

        queue.delete(current);

        // If we reached the destination, build the path
        if (current === end) {
          const path = [];
          const pathLines = [];
          let temp = end;
          while (temp) {
            path.unshift(temp);
            if (lines[temp]) {
              pathLines.unshift(lines[temp]);
            }
            temp = previous[temp];
          }
          return { 
            path, 
            distance: Math.round(distances[end] * 10) / 10, // Round to 1 decimal point 
            lines: pathLines
          };
        }

        // Update distances for neighbors
        this.graph[current].forEach(neighbor => {
          const alt = distances[current] + neighbor.distance;
          if (alt < distances[neighbor.to]) {
            distances[neighbor.to] = alt;
            previous[neighbor.to] = current;
            lines[neighbor.to] = neighbor.line_id;
          }
        });
      }

      // If no path is found
      return null;
    },
    swapStations() {
      const temp = this.fromStation;
      this.fromStation = this.toStation;
      this.toStation = temp;

      if (this.routeResult) {
        this.routeResult = null; // Clear previous result
      }
    }
  }
};
</script>