<!-- FavoritesPage.vue -->
<template>
    <q-page class="q-pa-md">
      <div class="row q-mb-md items-center">
        <q-btn icon="arrow_back" flat round color="primary" @click="$router.go(-1)" />
        <h4 class="q-ma-none q-ml-sm">Saved Routes</h4>
      </div>
  
      <template v-if="favorites.length > 0">
        <q-list separator>
          <q-item v-for="favorite in favorites" :key="favorite.id" class="q-my-sm">
            <q-item-section>
              <q-item-label class="text-weight-medium">{{ favorite.name }}</q-item-label>
              <q-item-label caption>
                <q-icon name="place" size="xs" color="primary" /> {{ favorite.from }}
                <q-icon name="arrow_forward" size="xs" class="q-mx-xs" />
                <q-icon name="place" size="xs" color="secondary" /> {{ favorite.to }}
              </q-item-label>
              <q-item-label caption>
                Saved on {{ formatDate(favorite.savedAt) }}
              </q-item-label>
            </q-item-section>
  
            <q-item-section side>
              <div class="row items-center">
                <q-btn flat round color="primary" icon="directions" @click="goToRoute(favorite)" />
                <q-btn flat round color="negative" icon="delete" @click="confirmDelete(favorite)" />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </template>
  
      <q-card v-else class="text-center q-pa-lg">
        <q-icon name="bookmark_border" size="4rem" color="grey-5" />
        <div class="text-h6 q-mt-md">No saved routes</div>
        <div class="q-mt-sm text-grey">Your favorite routes will appear here</div>
        <q-btn
          color="primary"
          label="Find a Route"
          icon="search"
          class="q-mt-lg"
          @click="$router.push('/find-route')"
        />
      </q-card>
  
      <!-- Confirmation dialog for delete -->
      <q-dialog v-model="deleteDialog" persistent>
        <q-card>
          <q-card-section class="row items-center">
            <q-avatar icon="warning" color="negative" text-color="white" />
            <span class="q-ml-sm">Are you sure you want to delete this saved route?</span>
          </q-card-section>
  
          <q-card-actions align="right">
            <q-btn flat label="Cancel" color="primary" v-close-popup />
            <q-btn flat label="Delete" color="negative" @click="deleteRoute" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-page>
  </template>
  
  <script>
  export default {
    name: 'FavoritesPage',
    data() {
      return {
        favorites: [],
        deleteDialog: false,
        routeToDelete: null
      };
    },
    mounted() {
      this.loadFavorites();
    },
    methods: {
      loadFavorites() {
        try {
          const savedFavorites = localStorage.getItem('favoriteRoutes');
          if (savedFavorites) {
            this.favorites = JSON.parse(savedFavorites);
            // Sort by most recently added
            this.favorites.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
          }
        } catch (error) {
          console.error('Error loading favorites:', error);
          this.$q.notify({
            color: 'negative',
            message: 'Error loading saved routes',
            icon: 'error'
          });
        }
      },
      
      formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      },
      
      goToRoute(favorite) {
        // Store from and to stations in localStorage to be used by find-route page
        localStorage.setItem('fromStationName', favorite.from);
        localStorage.setItem('toStationName', favorite.to);
        
        // Navigate to find route page which will use these values
        this.$router.push('/find-route');
      },
      
      confirmDelete(favorite) {
        this.routeToDelete = favorite;
        this.deleteDialog = true;
      },
      
      deleteRoute() {
        if (!this.routeToDelete) return;
        
        // Filter out the route to delete
        this.favorites = this.favorites.filter(route => route.id !== this.routeToDelete.id);
        
        // Save back to localStorage
        localStorage.setItem('favoriteRoutes', JSON.stringify(this.favorites));
        
        // Reset and notify
        this.routeToDelete = null;
        this.$q.notify({
          color: 'positive',
          message: 'Route removed from favorites',
          icon: 'delete'
        });
      }
    }
  };
  </script>