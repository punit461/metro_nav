<!-- MetroRouteResult.vue -->
<template>
  <q-card class="route-result-card q-mb-md">
    <q-card-section class="route-header bg-primary text-white">
      <div class="row justify-between items-center">
        <div class="col-12 col-md-3">
          <div class="text-h6">Route Summary</div>
          <div class="text-subtitle2">{{ result.path[0] }} to {{ result.path[result.path.length - 1] }}</div>
        </div>
        <div class="col-12 col-md-9">
          <div class="row q-col-gutter-md">
            <div class="col-6 col-md-3 text-center">
              <div class="text-h6">{{ result.distance }} km</div>
              <div class="text-caption">Distance</div>
            </div>
            <div class="col-6 col-md-3 text-center">
              <div class="text-h6">₹{{ calculateFare(result.distance) }}</div>
              <div class="text-caption">Est. Fare</div>
            </div>
            <div class="col-6 col-md-3 text-center">
              <div class="text-h6">{{ calculateTime(result.distance) }} min</div>
              <div class="text-caption">Est. Time</div>
            </div>
            <div class="col-6 col-md-3 text-center">
              <div class="text-h6">{{ countInterchanges(result.path) }}</div>
              <div class="text-caption">Interchanges</div>
            </div>
          </div>
        </div>
      </div>
    </q-card-section>

    <q-card-section>
      <div class="station-list">
        <div v-for="(station, index) in result.path" :key="index" class="station-item">
          <div class="station-timeline">
            <div class="timeline-line" :class="getLineColor(station, index)"></div>
            <div class="timeline-dot" :class="getLineColor(station, index)"></div>
            <div v-if="index < result.path.length - 1 && isInterchange(index)" class="interchange-indicator">
              <q-icon name="swap_horiz" color="negative" size="sm" />
            </div>
          </div>
          <div class="station-details">
            <div class="station-name">{{ station }}</div>
            <div class="station-info">
              <span v-if="index === 0" class="platform-info">
                OnBoard Platform {{ getPlatform(station) }} • {{ getDirectionFromPlatform(station, getPlatform(station)) }} • {{
                  getLineInfo(station).name }}
              </span>
              <span v-else-if="isInterchange(index)" class="platform-info">
                Change to Platform {{ getPlatform(result.path[index + 1]) }} • {{ getDirectionFromPlatform(station,
                  getPlatform(station)) }} • {{ getLineInfo(result.path[index +
                  1]).name }}
              </span>
              <span v-else class="platform-info">
                {{ getLineInfo(station).name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent } from 'vue';
import metroData from 'src/assets/metrojson.json';

export default defineComponent({
  name: 'MetroRouteResult',
  props: {
    result: {
      type: Object,
      required: true
    }
  },
  methods: {
    calculateFare(distance) {
      if (distance <= 2) return 10;
      else if (distance <= 4) return 20;
      else if (distance <= 6) return 30;
      else if (distance <= 8) return 40;
      else if (distance <= 10) return 50;
      else if (distance <= 15) return 60;
      else if (distance <= 20) return 70;
      else if (distance <= 25) return 80;
      else return 90;
    },
    calculateTime(distance) {
      // Approximate travel time calculation - example logic
      const avgSpeedKmPerMin = 0.6; // 30 km/h = 0.5 km/min
      const baseTime = 0.7; // base time in minutes for each station stop
      const stationCount = this.result.path.length;
      return Math.round((distance / avgSpeedKmPerMin) + (baseTime * (stationCount - 1)));
    },
    countInterchanges(path) {
      let interchanges = 0;
      for (let i = 1; i < path.length - 1; i++) {
        if (this.isInterchange(i)) {
          interchanges++;
        }
      }
      return interchanges;
    },
    isInterchange(index) {
      if (index < this.result.path.length - 1) {
        const currentStation = this.getStationByName(this.result.path[index]);
        const nextStation = this.getStationByName(this.result.path[index + 1]);

        // First check if current station has multiple lines
        if (currentStation.lines && currentStation.lines.length > 1) {
          // Find the line that connects current and previous station
          const prevStation = index > 0 ? this.getStationByName(this.result.path[index - 1]) : null;
          const currentLine = prevStation ?
            currentStation.lines.find(line => prevStation.lines.includes(line)) :
            currentStation.lines[0];

          // Find the line that connects current and next station
          const nextLine = currentStation.lines.find(line => nextStation.lines.includes(line));

          // It's an interchange only if we need to change lines
          return currentLine !== nextLine;
        }
      }
      return false;
    },
    getStationByName(name) {
      return metroData.stations.find(station => station.name === name) || {};
    },
    getLineInfo(stationName) {
      const station = this.getStationByName(stationName);
      const lineId = station.lines[0];
      const line = metroData.lines ? metroData.lines.find(line => line.id === lineId) : { id: 'unknown', name: 'Unknown Line', color: 'grey' };
      return line || { id: 'unknown', name: 'Unknown Line', color: 'grey' };
    },
    getLineColor(stationName, index) {
      const station = this.getStationByName(stationName);
      // If we're at an interchange station, use the next station's line for the outgoing route
      if (this.isInterchange(index) && index < this.result.path.length - 1) {
        const nextStation = this.getStationByName(this.result.path[index + 1]);
        // Find the common line between current and next station
        const commonLine = station.lines.find(line => nextStation.lines.includes(line));
        if (commonLine) {
          return `bg-${commonLine}`;
        }
      }
      // Default to first line if not an interchange or last station
      return `bg-${station.lines[0] || 'primary'}`;
    },
    getLineData(lineId) {
      // Assuming you have access to the lines data from your JSON
      const line = metroData.lines ? metroData.lines.find(line => line.id === lineId) : { id: 'unknown', name: 'Unknown Line', color: 'grey' };
      // return this.metroData?.lines?.find(line => line.id === lineId) || null;
      return line;
    },
    getStationById(stationId) {
      // Get station by ID instead of name
      const station = metroData?.stations?.find(station => station.id === stationId);
      // return this.metroData?.stations?.find(station => station.id === stationId) || null;
      return station;
    },
    getPlatform(stationName) {
      // console.log('Station Name:', stationName);
      const station = this.getStationByName(stationName);
      // console.log('Station Data:', station);

      // If no station found, return default platform 1
      if (!station || !station.platforms) {
        return 1;
      }

      // Find the current station index in the path
      const currentIndex = this.result.path.indexOf(stationName);
      // console.log('currentIndex Data:', currentIndex);
      // If station not found in path, return default
      if (currentIndex === -1) {
        return 1;
      }

      const isFirstStation = currentIndex === 0;
      const isLastStation = currentIndex === this.result.path.length - 1;
      // console.log('isFirstStation:', isFirstStation, 'isLastStation:', isLastStation);

      let targetDirection = null;

      // Determine the direction we're heading
      if (!isLastStation) {
        // We're going towards the next station - find which terminus that leads to
        const nextStationName = this.result.path[currentIndex + 1];
        const nextStation = this.getStationByName(nextStationName);
        // console.log('nextStation Data:', nextStation);

        if (nextStation) {
          // Find the common line between current and next station
          const commonLine = station.lines.find(line => nextStation.lines.includes(line));
          // console.log('commonLineColor Data:', commonLine);

          if (commonLine) {
            // Get the line data to determine the terminus direction
            const lineData = this.getLineData(commonLine); // You'll need this helper method
            // console.log('lineData Data:', lineData);
            if (lineData) {
              // Find which terminus the next station is closer to
              const currentStationIndexInLine = lineData.stations.indexOf(station.id);
              const nextStationIndexInLine = lineData.stations.indexOf(nextStation.id);

              // console.log('currentStation, nextStation Indexes:', currentStationIndexInLine, nextStationIndexInLine);

              if (nextStationIndexInLine > currentStationIndexInLine) {
                // Moving towards the end of the line
                const lastStationInLine = lineData.stations[lineData.stations.length - 1];
                const lastStationData = this.getStationById(lastStationInLine);
                targetDirection = lastStationData ? lastStationData.name : null;
              } else {
                // Moving towards the beginning of the line
                const firstStationInLine = lineData.stations[0];
                const firstStationData = this.getStationById(firstStationInLine);
                targetDirection = firstStationData ? firstStationData.name : null;
              }
              // console.log('targetDirection Data:', targetDirection);
            }
          }
        }
      } else if (!isFirstStation) {
        // Last station - determine direction based on where we came from
        const prevStationName = this.result.path[currentIndex - 1];
        const prevStation = this.getStationByName(prevStationName);

        if (prevStation) {
          const commonLine = station.lines.find(line => prevStation.lines.includes(line));

          if (commonLine) {
            const lineData = this.getLineData(commonLine);

            if (lineData) {
              const currentStationIndexInLine = lineData.stations.indexOf(station.id);
              const prevStationIndexInLine = lineData.stations.indexOf(prevStation.id);

              if (prevStationIndexInLine < currentStationIndexInLine) {
                // We came from earlier in the line, so we're heading towards the end
                const lastStationInLine = lineData.stations[lineData.stations.length - 1];
                const lastStationData = this.getStationById(lastStationInLine);
                targetDirection = lastStationData ? lastStationData.name : null;
              } else {
                // We came from later in the line, so we're heading towards the beginning
                const firstStationInLine = lineData.stations[0];
                const firstStationData = this.getStationById(firstStationInLine);
                targetDirection = firstStationData ? firstStationData.name : null;
              }
            }
          }
        }
      }

      // Find the platform that matches our target direction
      if (targetDirection) {
        const matchingPlatform = station.platforms.find(p =>
          p.direction.toLowerCase().includes(targetDirection.toLowerCase())
        );

        if (matchingPlatform) {
          return parseInt(matchingPlatform.platform_id.replace('p', '')) || 1;
        }
      }

      // Fallback: return the first platform number
      return parseInt(station.platforms[0].platform_id.replace('p', '')) || 1;
    },
    // add method to get the direction from platform use getPlatform method
    getDirectionFromPlatform(stationName, platformNumber) {
      const station = this.getStationByName(stationName);
      if (!station || !station.platforms) return null;

      const platform = station.platforms.find(p => parseInt(p.platform_id.replace('p', '')) === platformNumber);
      return platform ? platform.direction : null;
    }
  }
});
</script>

<style lang="scss" scoped>
.route-result-card {
  border-radius: 8px;
  overflow: hidden;
}

.route-header {
  padding: 16px;
}

.station-list {
  padding: 8px 0;
}

.station-item {
  display: flex;
  padding: 12px 0;
  position: relative;
}

.station-timeline {
  width: 40px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timeline-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: var(--q-primary);
  z-index: 1;
}

.timeline-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: var(--q-primary);
  position: relative;
  z-index: 2;
}

.interchange-indicator {
  position: absolute;
  top: 50%;
  transform: translate(0, -50%);
  right: -5px;
  z-index: 3;
  background-color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}

.station-details {
  flex: 1;
  padding-left: 16px;
}

.station-name {
  font-weight: 600;
  font-size: 16px;
}

.station-info {
  font-size: 14px;
  color: #666;
}

.platform-info {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: #f0f0f0;
  font-size: 12px;
  margin-top: 4px;
}

/* Line color classes - adjust based on your metro system's colors */
.bg-red {
  background-color: #E53935 !important;
}

.bg-blue {
  background-color: #1E88E5 !important;
}

.bg-green {
  background-color: #43A047 !important;
}

.bg-yellow {
  background-color: #FDD835 !important;
}

.bg-purple {
  background-color: #8E24AA !important;
}

.bg-orange {
  background-color: #FB8C00 !important;
}

.bg-pink {
  background-color: #EC407A !important;
}
</style>