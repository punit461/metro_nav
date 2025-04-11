<!-- RouteDetailsPage.vue -->
<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md items-center">
      <q-btn icon="arrow_back" flat round color="primary" @click="$router.push('/find-route')" />
      <h4 class="q-ma-none q-ml-sm">Route Details</h4>
    </div>
    
    <metro-route-result v-if="routeResult" :result="routeResult" />
    
    <q-card v-if="!routeResult" class="text-center q-pa-lg">
      <q-spinner-dots color="primary" size="40px" />
      <div class="q-mt-md text-body1">Loading route details...</div>
    </q-card>
    
    <div class="row justify-center q-mt-lg">
      <q-btn color="primary" label="Share Route" icon="share" class="q-mr-md" @click="shareRoute" />
      <q-btn outline color="primary" label="Save Route" icon="bookmark" @click="saveToFavorites" />
    </div>

    <!-- Dialog for favorites -->
    <q-dialog v-model="favoriteDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Save to Favorites</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="favoriteName" label="Name this route" autofocus />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="confirmSaveToFavorites" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import MetroRouteResult from 'components/MetroRouteResult.vue';

export default {
  name: 'RouteDetailsPage',
  components: {
    MetroRouteResult
  },
  data() {
    return {
      routeResult: null,
      favoriteDialog: false,
      favoriteName: ''
    };
  },
  created() {
    // Get route result from localStorage
    try {
      const savedRoute = localStorage.getItem('currentRouteResult');
      if (savedRoute) {
        this.routeResult = JSON.parse(savedRoute);
      } else {
        throw new Error('No route found');
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        this.$q.notify({
          color: 'negative',
          message: 'No route information found. Please search again.',
          icon: 'warning',
          timeout: 500 // Notification disappears after 500ms
        });
        setTimeout(() => {
          this.$router.push('/find-route');
        }, 500); // Reduced delay for redirection
      } else {
        this.$q.notify({
          color: 'negative',
          icon: 'error'
        });
      }
      setTimeout(() => {
        this.$router.push('/find-route');
      }, 2000);
    }
  },
  methods: {
    // Helper methods to calculate totals if not available directly
    calculateTotalTime() {
      if (!this.routeResult || !this.routeResult.steps) return '?';
      
      // Sum the time from all steps
      return this.routeResult.steps.reduce((total, step) => {
        return total + (step.time || 0);
      }, 0);
    },
    
    calculateTotalDistance() {
      if (!this.routeResult || !this.routeResult.steps) return '?';
      
      // Sum the distance from all steps if available
      let totalDistance = this.routeResult.steps.reduce((total, step) => {
        return total + (step.distance || 0);
      }, 0);
      
      // Format to one decimal place
      return totalDistance.toFixed(1);
    },
    shareRoute() {
      if (!this.routeResult) return;
      
      // Extract source and destination using the same logic
      let fromStation = '';
      let toStation = '';
      
      if (this.routeResult.source && this.routeResult.destination) {
        fromStation = this.routeResult.source;
        toStation = this.routeResult.destination;
      } else if (this.routeResult.from && this.routeResult.to) {
        fromStation = this.routeResult.from;
        toStation = this.routeResult.to;
      } else if (this.routeResult.steps && this.routeResult.steps.length > 0) {
        const firstStep = this.routeResult.steps[0];
        const lastStep = this.routeResult.steps[this.routeResult.steps.length - 1];
        
        if (firstStep && firstStep.from) {
          fromStation = firstStep.from;
        }
        
        if (lastStep && lastStep.to) {
          toStation = lastStep.to;
        }
      }
      
      // Create a text representation of the route
      let routeText = `Metro Route: ${fromStation || 'Origin'} to ${toStation || 'Destination'}\n\n`;
      
      // Add total time and distance with null checks
      const totalTime = this.routeResult.totalTime || this.calculateTotalTime();
      const totalDistance = this.routeResult.totalDistance || this.calculateTotalDistance();
      
      routeText += `Total Journey: ${totalTime} minutes (${totalDistance} km)\n\n`;
      
      // Add route details
      routeText += "Journey Details:\n";
      
      this.routeResult.steps.forEach((step, index) => {
        if (step.type === 'travel') {
          routeText += `${index + 1}. Take ${step.line} line from ${step.from} to ${step.to} (${step.stations.length - 1} stations, ${step.time} mins)\n`;
        } else if (step.type === 'interchange') {
          routeText += `${index + 1}. Change from ${step.fromLine} to ${step.toLine} at ${step.station} (${step.time} mins)\n`;
        }
      });
      
      // Use Web Share API if available
      if (navigator.share) {
        navigator.share({
          title: 'Metro Route Details',
          text: routeText
        }).catch((error) => {
          console.log(error)
          this.fallbackShare(routeText);
        });
      } else {
        this.fallbackShare(routeText);
      }
    },
    
    fallbackShare(text) {
      // Create a temporary textarea element
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed'; // Avoid scrolling to bottom
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      try {
        // Copy text to clipboard
        const successful = document.execCommand('copy');
        if (successful) {
          this.$q.notify({
            color: 'positive',
            message: 'Route copied to clipboard',
            icon: 'content_copy'
          });
        } else {
          throw new Error('Copy failed');
        }
      } catch (err) {
        console.log(err)
        this.$q.notify({
          color: 'negative',
          message: 'Failed to copy route information',
          icon: 'error'
        });
      }
      
      document.body.removeChild(textarea);
    },
    
    saveToFavorites() {
      if (!this.routeResult) return;
      
      // Set default name for the route - check the structure of routeResult to access the correct properties
      let fromStation = '';
      let toStation = '';
      
      // Check various possible structures to find the station names
      if (this.routeResult.source && this.routeResult.destination) {
        fromStation = this.routeResult.source;
        toStation = this.routeResult.destination;
      } else if (this.routeResult.from && this.routeResult.to) {
        fromStation = this.routeResult.from;
        toStation = this.routeResult.to;
      } else if (this.routeResult.steps && this.routeResult.steps.length > 0) {
        // Try to extract from first and last steps
        const firstStep = this.routeResult.steps[0];
        const lastStep = this.routeResult.steps[this.routeResult.steps.length - 1];
        
        if (firstStep && firstStep.from) {
          fromStation = firstStep.from;
        }
        
        if (lastStep && lastStep.to) {
          toStation = lastStep.to;
        }
      }
      
      // Set the name with fallbacks
      this.favoriteName = `${fromStation || 'Origin'} to ${toStation || 'Destination'}`;
      
      // Open dialog to confirm and name the favorite
      this.favoriteDialog = true;
    },
    
    confirmSaveToFavorites() {
      if (!this.routeResult || !this.favoriteName.trim()) return;
      
      // Extract from and to stations using the same logic as in saveToFavorites
      let fromStation = '';
      let toStation = '';
      
      if (this.routeResult.source && this.routeResult.destination) {
        fromStation = this.routeResult.source;
        toStation = this.routeResult.destination;
      } else if (this.routeResult.from && this.routeResult.to) {
        fromStation = this.routeResult.from;
        toStation = this.routeResult.to;
      } else if (this.routeResult.steps && this.routeResult.steps.length > 0) {
        const firstStep = this.routeResult.steps[0];
        const lastStep = this.routeResult.steps[this.routeResult.steps.length - 1];
        
        if (firstStep && firstStep.from) {
          fromStation = firstStep.from;
        }
        
        if (lastStep && lastStep.to) {
          toStation = lastStep.to;
        }
      }
      
      // Create favorite route object with fallbacks
      const favoriteRoute = {
        id: Date.now().toString(), // Generate a unique ID
        name: this.favoriteName.trim(),
        from: fromStation || 'Origin',
        to: toStation || 'Destination',
        savedAt: new Date().toISOString()
      };
      
      // Get existing favorites or initialize empty array
      let favorites = [];
      try {
        const savedFavorites = localStorage.getItem('favoriteRoutes');
        if (savedFavorites) {
          favorites = JSON.parse(savedFavorites);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
      
      // Add new favorite to the array
      favorites.push(favoriteRoute);
      
      // Save back to localStorage
      localStorage.setItem('favoriteRoutes', JSON.stringify(favorites));
      
      // Show success notification
      this.$q.notify({
        color: 'positive',
        message: 'Route saved to favorites',
        icon: 'bookmark'
      });
    }
  }
};
</script>