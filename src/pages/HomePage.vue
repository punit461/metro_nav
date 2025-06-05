export const HomePageVue = `
<template>
  <q-page class="q-pa-md">
    <h4 class="q-mb-md"></h4>

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
    <!-- Add a container for the ad -->
    <div class="ad-container"></div>
  </q-page>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      tiles: [
        {
          title: 'Find Route',
          icon: 'directions',
          route: '/find-route',
          color: 'bg-primary',
        },
        {
          title: 'List Stations',
          icon: 'list',
          route: '/list-stations',
          color: 'bg-secondary',
        },
        {
          title: 'View Metro Map',
          icon: 'map',
          route: '/metro-map',
          color: 'bg-accent',
        },
        {
          title: 'Get Tickets',
          icon: 'receipt',
          route: '/tickets',
          color: 'bg-positive',
        },
        {
          title: 'Nearest Stations',
          icon: 'my_location',
          route: '/nearest-stations',
          color: 'bg-negative',
        },
        {
          title: 'List Favorites',
          icon: 'star',
          route: '/favorites',
          color: 'bg-warning',
        },
        {
          title: 'About',
          icon: 'info',
          route: '/about',
          color: 'bg-info',
        },
      ],
      admobId: {
        banner: 'ca-app-pub-7089675560767740/4562700538',
        app: 'ca-app-pub-7089675560767740~7633144050',
      },
    }
  },
  methods: {
    navigateTo(route) {
      this.$router.push(route)
    },
    showBannerAd() {
      if (window.admob) {
        window.admob.banner.config({
          id: this.admobId.banner,
          isTesting: false,
          autoShow: true,
        })
        window.admob.banner.prepare()
      }
    },
  },
  mounted() {
    // Initialize AdMob when the component is mounted
    document.addEventListener(
      'deviceready',
      () => {
        this.showBannerAd()
      },
      false,
    )
  },
  beforeUnmount() {
    // Remove the banner when component is destroyed
    if (window.admob) {
      window.admob.banner.remove()
    }
  },
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

.ad-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50px; // Standard banner height
  z-index: 1000;
}
</style>
`;
