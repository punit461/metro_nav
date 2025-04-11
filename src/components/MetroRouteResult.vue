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
                Platform {{ getPlatform(station) }} • {{ getLineInfo(station).name }}
              </span>
              <span v-else-if="isInterchange(index)" class="platform-info">
                Change to Platform {{ getPlatform(result.path[index + 1]) }} • {{ getLineInfo(result.path[index + 1]).name }}
              </span>
              <span v-else class="platform-info">
                Platform {{ getPlatform(station) }} • {{ getLineInfo(station).name }}
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
        // Check if they are on different lines
        return this.getLineInfo(currentStation.name).id !== this.getLineInfo(nextStation.name).id;
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
    getLineColor(stationName) {
      const line = this.getLineInfo(stationName);
      return `bg-${line.id || 'primary'}`;
    },
    getPlatform(stationName) {
      const station = this.getStationByName(stationName);
      return station.platform || Math.floor(Math.random() * 4) + 1; // Random platform if not specified
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
.bg-red { background-color: #E53935 !important; }
.bg-blue { background-color: #1E88E5 !important; }
.bg-green { background-color: #43A047 !important; }
.bg-yellow { background-color: #FDD835 !important; }
.bg-purple { background-color: #8E24AA !important; }
.bg-orange { background-color: #FB8C00 !important; }
.bg-pink { background-color: #EC407A !important; }
</style>