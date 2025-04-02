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
        <q-btn color="primary" label="Share Route" icon="share" class="q-mr-md" />
        <q-btn outline color="primary" label="Save Route" icon="bookmark" />
      </div>
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
        routeResult: null
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
          this.$q.notify({
            color: 'negative',
            icon: 'error'
          });
        }
        setTimeout(() => {
          this.$router.push('/find-route');
        }, 2000);
      }
    }
  };
  </script>