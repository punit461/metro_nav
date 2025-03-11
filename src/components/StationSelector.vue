<template>
  <div class="metro-route-result">
    <q-card flat bordered class="q-mb-md" v-if="route">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <div class="text-h6">Route Summary</div>
            <div class="q-mt-sm">
              <q-item dense>
                <q-item-section avatar>
                  <q-icon name="payments" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Fare: ₹{{ route.fare }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item dense>
                <q-item-section avatar>
                  <q-icon name="schedule" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Travel Time: {{ route.time }} mins</q-item-label>
                </q-item-section>
              </q-item>
              <q-item dense>
                <q-item-section avatar>
                  <q-icon name="train" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ route.stationCount }} stations</q-item-label>
                </q-item-section>
              </q-item>
              <q-item dense>
                <q-item-section avatar>
                  <q-icon name="swap_horiz" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ route.interchanges }} line changes</q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="text-h6">Lines Used</div>
            <div class="q-mt-sm">
              <q-chip
                v-for="line in route.lines"
                :key="line.id"
                :style="{ backgroundColor: line.color }"
                text-color="white"
                size="md"
                class="q-ma-xs"
              >
                {{ line.name }}
              </q-chip>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card bordered class="station-list" v-if="route">
      <q-card-section>
        <div class="text-h6">Journey Details</div>
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-list bordered separator>
          <div v-for="(station, index) in route.stations" :key="station.id">
            <!-- Station with interchange information -->
            <q-item>
              <q-item-section avatar>
                <q-avatar>
                  <div class="station-marker" 
                       :class="{'interchange': station.isInterchange}">
                    <div class="line-indicator"
                         :style="{ backgroundColor: getLineColor(station, index) }"></div>
                  </div>
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium">{{ station.name }}</q-item-label>
                <q-item-label caption v-if="station.isInterchange">
                  Interchange Station
                </q-item-label>
              </q-item-section>

              <q-item-section side v-if="station.currentLine">
                <q-chip
                  :style="{ backgroundColor: station.currentLine.color }"
                  text-color="white"
                  size="sm"
                >
                  {{ station.currentLine.name }}
                </q-chip>
              </q-item-section>
            </q-item>

            <!-- Change line instructions if needed -->
            <q-item v-if="station.changeTo">
              <q-item-section avatar>
                <q-icon name="swap_vertical_circle" color="orange" size="sm" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-orange text-weight-medium">
                  Change to {{ station.changeTo.name }} Line
                </q-item-label>
                <q-item-label caption>
                  Platform {{ station.changeToPlatform }} → 
                  Towards {{ station.changeTowards }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-chip
                  :style="{ backgroundColor: station.changeTo.color }"
                  text-color="white"
                  size="sm"
                >
                  {{ station.changeTo.name }}
                </q-chip>
              </q-item-section>
            </q-item>

            <!-- Vertical line connector except for last item -->
            <div v-if="index < route.stations.length - 1" 
                 class="line-connector"
                 :style="{ backgroundColor: getLineColor(station, index) }"></div>
          </div>
        </q-list>
      </q-card-section>
    </q-card>

    <div class="text-center q-mt-lg" v-if="!route">
      <q-icon name="info" color="info" size="lg" />
      <p>Select origin and destination stations to view route details</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MetroRouteResult',
  props: {
    route: {
      type: Object,
      default: null
    }
  },
  methods: {
    getLineColor(station, index) {
      // Return the color of the current line for this station
      if (station.currentLine) {
        return station.currentLine.color;
      }
      
      // If no current line is set, try to determine from the previous or next station
      if (index > 0 && this.route.stations[index - 1].currentLine) {
        return this.route.stations[index - 1].currentLine.color;
      }
      
      if (index < this.route.stations.length - 1 && this.route.stations[index + 1].currentLine) {
        return this.route.stations[index + 1].currentLine.color;
      }
      
      // Default color if no line information is available
      return '#666666';
    }
  }
};
</script>

<style scoped>
.metro-route-result {
  margin-top: 20px;
}

.station-marker {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #ffffff;
  border: 2px solid #666666;
  display: flex;
  justify-content: center;
  align-items: center;
}

.interchange {
  width: 24px;
  height: 24px;
  border: 3px solid #ff6600;
}

.line-indicator {
  width: 14px;
  height: 14px;
  border-radius: 50%;
}

.line-connector {
  width: 2px;
  height: 30px;
  margin-left: 20px;
}

.station-list {
  max-height: 600px;
  overflow-y: auto;
}
</style>