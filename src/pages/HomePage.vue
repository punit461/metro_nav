export const HomePageVue = `
<template>
  <q-page class="q-pa-md">
    <h4 class="q-mb-md">Bangalore Metro</h4>
    
    <div class="row q-col-gutter-md">
      <div class="col-6 col-sm-4 col-md-3" v-for="(tile, index) in tiles" :key="index">
        <q-card class="metro-tile" :class="tile.color" @click="navigateTo(tile.route)">
          <q-card-section class="text-center">
            <q-icon :name="tile.icon" size="3rem" color="white" />
            <div class="text-h6 text-white q-mt-sm">{{ tile.title }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'HomePage',
  data () {
    return {
      tiles: [
        {
          title: 'Find Route',
          icon: 'directions',
          route: '/find-route',
          color: 'bg-primary'
        },
        {
          title: 'List Stations',
          icon: 'list',
          route: '/list-stations',
          color: 'bg-secondary'
        },
        {
          title: 'Metro Map',
          icon: 'map',
          route: '/metro-map',
          color: 'bg-accent'
        },
        {
          title: 'Tickets',
          icon: 'receipt',
          route: '/tickets',
          color: 'bg-positive'
        },
        {
          title: 'Favorites',
          icon: 'star',
          route: '/favorites',
          color: 'bg-negative'
        },
        {
          title: 'About',
          icon: 'info',
          route: '/about',
          color: 'bg-info'
        }
      ]
    }
  },
  methods: {
    navigateTo(route) {
      this.$router.push(route);
    }
  }
}
</script>

<style lang="scss" scoped>
.metro-tile {
  height: 140px;
  cursor: pointer;
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-5px);
  }
}
</style>
`;