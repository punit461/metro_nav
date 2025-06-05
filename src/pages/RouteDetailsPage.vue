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
import MetroRouteResult from 'components/MetroRouteResult.vue'

export default {
  name: 'RouteDetailsPage',
  components: {
    MetroRouteResult,
  },
  data() {
    return {
      routeResult: null,
      favoriteDialog: false,
      favoriteName: '',
    }
  },
  created() {
    // Get route result from localStorage
    try {
      const savedRoute = localStorage.getItem('currentRouteResult')
      if (savedRoute) {
        this.routeResult = JSON.parse(savedRoute)
      } else {
        throw new Error('No route found')
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        this.$q.notify({
          color: 'negative',
          message: 'No route information found. Please search again.',
          icon: 'warning',
          timeout: 500, // Notification disappears after 500ms
        })
        setTimeout(() => {
          this.$router.push('/find-route')
        }, 500) // Reduced delay for redirection
      } else {
        this.$q.notify({
          color: 'negative',
          icon: 'error',
        })
      }
      setTimeout(() => {
        this.$router.push('/find-route')
      }, 2000)
    }
  },
  methods: {
    // Helper methods to calculate totals if not available directly
    calculateTotalTime() {
      if (!this.routeResult || !this.routeResult.steps) return '?'

      // Sum the time from all steps
      return this.routeResult.steps.reduce((total, step) => {
        return total + (step.time || 0)
      }, 0)
    },

    calculateTotalDistance() {
      if (!this.routeResult || !this.routeResult.steps) return '?'

      // Sum the distance from all steps if available
      let totalDistance = this.routeResult.steps.reduce((total, step) => {
        return total + (step.distance || 0)
      }, 0)

      // Format to one decimal place
      return totalDistance.toFixed(1)
    },
    shareRoute() {
      if (!this.routeResult) {
        this.$q.notify({
          color: 'negative',
          message: 'No route details available to share',
          icon: 'error',
        })
        return
      }

      // Create a text representation of the route
      let routeText = ''

      // Add route header with path information
      if (this.routeResult.path && Array.isArray(this.routeResult.path)) {
        const fromStation = this.routeResult.path[0]
        const toStation = this.routeResult.path[this.routeResult.path.length - 1]
        routeText += `Metro Route: ${fromStation || 'Origin'} to ${toStation || 'Destination'}\n\n`
      } else {
        routeText += 'Metro Route Details\n\n'
      }

      // Add distance and estimated time
      if (this.routeResult.distance) {
        routeText += `Total Distance: ${this.routeResult.distance.toFixed(1)} km\n`
        // Estimate time (assuming 2 minutes per km)
        const estimatedTime = Math.ceil(this.routeResult.distance * 2)
        routeText += `Estimated Time: ${estimatedTime} minutes\n\n`
      }

      // Add path details
      if (this.routeResult.path && Array.isArray(this.routeResult.path)) {
        routeText += 'Journey Details:\n'
        this.routeResult.path.forEach((station, index) => {
          if (index < this.routeResult.path.length - 1) {
            const currentLine = this.routeResult.lines[index]
            routeText += `${index + 1}. ${station} → ${this.routeResult.path[index + 1]} (${currentLine} Line)\n`
          }
        })
      }

      // Use Web Share API if available
      if (navigator.share) {
        navigator
          .share({
            title: 'Metro Route Details',
            text: routeText,
          })
          .catch((error) => {
            console.error('Share failed:', error)
            this.fallbackShare(routeText)
          })
      } else {
        this.fallbackShare(routeText)
      }
    },

    fallbackShare(text) {
      // Create a temporary textarea element
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed' // Avoid scrolling to bottom
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()

      try {
        // Copy text to clipboard
        const successful = document.execCommand('copy')
        if (successful) {
          this.$q.notify({
            color: 'positive',
            message: 'Route copied to clipboard',
            icon: 'content_copy',
          })
        } else {
          throw new Error('Copy failed')
        }
      } catch (err) {
        console.log(err)
        this.$q.notify({
          color: 'negative',
          message: 'Failed to copy route information',
          icon: 'error',
        })
      }

      document.body.removeChild(textarea)
    },

    saveToFavorites() {
      if (!this.routeResult || !this.routeResult.path) return

      const fromStation = this.routeResult.path[0]
      const toStation = this.routeResult.path[this.routeResult.path.length - 1]

      // Set the name with actual station names
      this.favoriteName = `${fromStation} to ${toStation}`

      // Open dialog to confirm and name the favorite
      this.favoriteDialog = true
    },

    confirmSaveToFavorites() {
      if (!this.routeResult || !this.favoriteName.trim() || !this.routeResult.path) return

      const fromStation = this.routeResult.path[0]
      const toStation = this.routeResult.path[this.routeResult.path.length - 1]

      // Create favorite route object
      const favoriteRoute = {
        id: Date.now().toString(),
        name: this.favoriteName.trim(),
        from: fromStation,
        to: toStation,
        savedAt: new Date().toISOString(),
        distance: this.routeResult.distance,
        path: this.routeResult.path,
        lines: this.routeResult.lines,
      }

      // Get existing favorites or initialize empty array
      let favorites = []
      try {
        const savedFavorites = localStorage.getItem('favoriteRoutes')
        if (savedFavorites) {
          favorites = JSON.parse(savedFavorites)
        }
      } catch (error) {
        console.error('Error loading favorites:', error)
      }

      // Add new favorite to the array
      favorites.push(favoriteRoute)

      // Save back to localStorage
      localStorage.setItem('favoriteRoutes', JSON.stringify(favorites))

      // Show success notification
      this.$q.notify({
        color: 'positive',
        message: 'Route saved to favorites',
        icon: 'bookmark',
      })
    },
  },
}
</script>
