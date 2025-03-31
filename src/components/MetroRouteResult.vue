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
// import { useQuasar } from 'quasar';
import metroData from 'src/assets/metrojson.json';

export default {
  name: 'MetroRouter',
  
  setup() {
    // const $q = useQuasar();
    
    // Dijkstra's algorithm for shortest path
    const findShortestPath = (start, end) => {
      const stations = metroData.stations;
      const distances = {};
      const previous = {};
      const unvisited = new Set();
      
      // Initialize distances with Infinity except for starting node
      stations.forEach(station => {
        if (station.is_active) {
          distances[station.id] = station.id === start ? 0 : Infinity;
          unvisited.add(station.id);
          previous[station.id] = null;
        }
      });
      
      while (unvisited.size > 0) {
        // Find unvisited node with smallest distance
        let current = null;
        let smallestDistance = Infinity;
        
        unvisited.forEach(stationId => {
          if (distances[stationId] < smallestDistance) {
            smallestDistance = distances[stationId];
            current = stationId;
          }
        });
        
        // If we've reached our destination or there's no path
        if (current === null || current === end) break;
        
        // Remove current from unvisited
        unvisited.delete(current);
        
        // Find current station object
        const currentStation = stations.find(s => s.id === current);
        
        // Check each neighbor
        currentStation.connections.forEach(connection => {
          const neighbor = connection.to;
          const neighborStation = stations.find(s => s.id === neighbor);
          
          // Skip if neighbor is not active
          if (!neighborStation.is_active) return;
          
          const distance = connection.distance;
          const totalDistance = distances[current] + distance;
          
          if (totalDistance < distances[neighbor]) {
            distances[neighbor] = totalDistance;
            previous[neighbor] = { 
              station: current, 
              line: connection.line 
            };
          }
        });
      }
      
      // Reconstruct path
      const path = [];
      let current = end;
      
      while (current !== null) {
        const station = stations.find(s => s.id === current);
        path.unshift({
          id: current,
          name: station.name,
          line: previous[current]?.line
        });
        current = previous[current]?.station || null;
      }
      
      return {
        path,
        distance: distances[end],
        possible: distances[end] !== Infinity
      };
    };
    
    // Find route with least line changes
    const findLeastExchanges = (start, end) => {
      const stations = metroData.stations;
      const startStation = stations.find(s => s.id === start);
      const endStation = stations.find(s => s.id === end);
      
      if (!startStation || !endStation || !startStation.is_active || !endStation.is_active) {
        return { path: [], exchanges: 0, possible: false };
      }
      
      // BFS to find least exchanges
      const queue = [];
      const visited = new Set();
      const paths = {};
      
      // Initialize queue with starting station
      startStation.lines.forEach(line => {
        queue.push({ 
          station: start, 
          line, 
          path: [{ id: start, name: startStation.name, line }],
          exchanges: 0
        });
      });
      
      while (queue.length > 0) {
        const { station, line, path, exchanges } = queue.shift();
        const key = `${station}-${line}`;
        
        // Skip if we've visited this station-line combination
        if (visited.has(key)) continue;
        visited.add(key);
        
        // Save this path
        paths[key] = { path, exchanges };
        
        // If we've reached the destination, we're done
        if (station === end) continue;
        
        // Get current station object
        const currentStation = stations.find(s => s.id === station);
        
        // Process connections
        currentStation.connections.forEach(connection => {
          const neighbor = connection.to;
          const neighborStation = stations.find(s => s.id === neighbor);
          
          // Skip if neighbor is not active
          if (!neighborStation?.is_active) return;
          
          // Check if we need to change lines
          const connectionLine = connection.line;
          const newExchanges = connectionLine === line ? exchanges : exchanges + 1;
          
          // Build new path
          const newPath = [...path, { 
            id: neighbor, 
            name: neighborStation.name, 
            line: connectionLine 
          }];
          
          // Add to queue
          queue.push({ 
            station: neighbor, 
            line: connectionLine, 
            path: newPath, 
            exchanges: newExchanges 
          });
        });
      }
      
      // Find the path to end with least exchanges
      let bestPath = null;
      let leastExchanges = Infinity;
      
      endStation.lines.forEach(line => {
        const key = `${end}-${line}`;
        if (paths[key] && paths[key].exchanges < leastExchanges) {
          bestPath = paths[key].path;
          leastExchanges = paths[key].exchanges;
        }
      }); 
      
      return {
        path: bestPath || [],
        exchanges: leastExchanges,
        possible: bestPath !== null
      };
    };
    
    return {
      findShortestPath,
      findLeastExchanges
    };
  }
};
</script>

<style scoped>
.station-selector {
  width: 100%;
}
</style>