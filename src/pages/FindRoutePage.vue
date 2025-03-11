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
import { metroStations, findRoute } from 'src/assets/metro-data.js';
import MetroRouteResult from 'components/MetroRouteResult.vue';

export default {
  name: 'FindRoutePage',
  components: {
    MetroRouteResult
  },
  data () {
    return {
      fromStation: null,
      toStation: null,
      routeResult: null,
      stationOptions: metroStations.map(station => ({
        id: station.id,
        name: station.name,
        line: station.line
      }))
    }
  },
  methods: {
    findRoute() {
      if (this.fromStation && this.toStation && this.fromStation !== this.toStation) {
        this.routeResult = findRoute(this.fromStation, this.toStation);
      }
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
}
</script>
`;