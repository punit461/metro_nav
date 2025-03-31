export const FindRoutePageVue = `
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
          />
        </div>
      </q-card-section>
    </q-card>
    
    <metro-route-result v-if="routeResult" :result="routeResult" />
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
      stationOptions: metroData.stations
        .filter(station => station.is_active)
        .map(station => ({
          id: station.id,
          name: station.name
        })),
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
              distance: connection.distance
            }));
        }
      });
      this.graph = graph;
    },
    findRoute() {
      if (this.fromStation && this.toStation && this.fromStation !== this.toStation) {
        this.routeResult = this.dijkstra(this.fromStation, this.toStation);
      }
    },
    dijkstra(start, end) {
      const distances = {};
      const previous = {};
      const queue = new Set(Object.keys(this.graph));

      // Initialize distances
      queue.forEach(node => {
        distances[node] = Infinity;
        previous[node] = null;
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
          let temp = end;
          while (temp) {
            path.unshift(temp);
            temp = previous[temp];
          }
          return { path, distance: distances[end] };
        }

        // Update distances for neighbors
        this.graph[current].forEach(neighbor => {
          const alt = distances[current] + neighbor.distance;
          if (alt < distances[neighbor.to]) {
            distances[neighbor.to] = alt;
            previous[neighbor.to] = current;
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
        this.findRoute();
      }
    }
  }
};
</script>