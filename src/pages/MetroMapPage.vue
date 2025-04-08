<template>
    <q-page class="flex flex-center">
      <div class="pdf-container" style="width: 100%; height: 100vh;">
        <q-card class="full-width q-pa-md">
          <q-card-section>
            <div class="text-h6">Namma Metro Map</div>
          </q-card-section>
          
          <q-card-section>
            <vue-pdf-embed
              :source="pdfSource"
              :width="width"
              @rendered="onRendered"
              @loading="loading = true"
              @loaded="loading = false"
            />
          </q-card-section>
  
          <q-inner-loading :showing="loading">
            <q-spinner-dots size="50px" color="primary" />
          </q-inner-loading>
        </q-card>
      </div>
    </q-page>
  </template>
  
  <script>
  import { defineComponent, ref, onMounted } from 'vue'
  import VuePdfEmbed from 'vue-pdf-embed'
  
  export default defineComponent({
    name: 'MetroMapPage',
    
    components: {
      VuePdfEmbed
    },
  
    setup () {
      const loading = ref(true)
      const width = ref(0)
      const pdfSource = '/Metro_Map_2025_Namma_Metro.pdf'
  
      onMounted(() => {
        // Set width based on container size
        const container = document.querySelector('.pdf-container')
        if (container) {
          width.value = container.clientWidth - 48 // Subtract padding
        }
  
        // Update width on window resize
        window.addEventListener('resize', () => {
          const container = document.querySelector('.pdf-container')
          if (container) {
            width.value = container.clientWidth - 48
          }
        })
      })
  
      const onRendered = () => {
        console.log('PDF rendered successfully')
      }
  
      return {
        loading,
        width,
        pdfSource,
        onRendered
      }
    }
  })
  </script>
  
  <style scoped>
  .pdf-container {
    max-width: 1200px;
    margin: 0 auto;
  }
  </style>