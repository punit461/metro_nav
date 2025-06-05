<template>
  <q-page class="flex flex-center">
    <div class="image-container" ref="container">
      <q-card class="full-width q-pa-md">
        <q-card-section>
          <div class="text-h6">Namma Metro Map</div>
        </q-card-section>

        <q-card-section class="q-pa-none">
          <div
            class="zoom-wrapper"
            :style="{
              transform: `scale(${scale}) translate(${translate.x}px, ${translate.y}px)`,
            }"
            @wheel.prevent="onWheel"
            @mousedown="onMouseDown"
            @mousemove="onMouseMove"
            @mouseup="onMouseUp"
            @mouseleave="onMouseUp"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
          >
            <img :src="imageSource" @load="loading = false" @error="onError" class="map-image" />
          </div>
        </q-card-section>

        <q-inner-loading :showing="loading">
          <q-spinner-dots size="50px" color="primary" />
        </q-inner-loading>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, reactive } from 'vue'

export default defineComponent({
  name: 'MetroMapPage',

  setup() {
    const loading = ref(true)
    const imageSource = '/Metro_Map_2025_Namma_Metro.png'
    const scale = ref(1)
    const translate = reactive({ x: 0, y: 0 })

    let isDragging = false
    let start = { x: 0, y: 0 }
    let lastTouchDistance = null

    const onError = () => {
      loading.value = false
      console.error('Failed to load image.')
    }

    const onWheel = (event) => {
      event.preventDefault()
      const delta = event.deltaY < 0 ? 0.1 : -0.1
      scale.value = Math.min(Math.max(scale.value + delta, 0.5), 3)
    }

    const onMouseDown = (event) => {
      isDragging = true
      start.x = event.clientX - translate.x
      start.y = event.clientY - translate.y
    }

    const onMouseMove = (event) => {
      if (isDragging) {
        translate.x = event.clientX - start.x
        translate.y = event.clientY - start.y
      }
    }

    const onMouseUp = () => {
      isDragging = false
    }

    const getTouchDistance = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      return Math.sqrt(dx * dx + dy * dy)
    }

    const onTouchStart = (event) => {
      if (event.touches.length === 2) {
        lastTouchDistance = getTouchDistance(event.touches)
      } else if (event.touches.length === 1) {
        start.x = event.touches[0].clientX - translate.x
        start.y = event.touches[0].clientY - translate.y
        isDragging = true
      }
    }

    const onTouchMove = (event) => {
      if (event.touches.length === 2) {
        const newDist = getTouchDistance(event.touches)
        if (lastTouchDistance) {
          const delta = (newDist - lastTouchDistance) / 200
          scale.value = Math.min(Math.max(scale.value + delta, 0.5), 3)
        }
        lastTouchDistance = newDist
      } else if (event.touches.length === 1 && isDragging) {
        translate.x = event.touches[0].clientX - start.x
        translate.y = event.touches[0].clientY - start.y
      }
    }

    const onTouchEnd = () => {
      isDragging = false
      lastTouchDistance = null
    }

    return {
      loading,
      imageSource,
      scale,
      translate,
      onWheel,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onError,
    }
  },
})
</script>

<style scoped>
.image-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  touch-action: none;
}

.zoom-wrapper {
  transition: transform 0.1s ease;
  transform-origin: center center;
  cursor: grab;
}

.map-image {
  width: 100%;
  height: auto;
  user-select: none;
  pointer-events: none;
}
</style>
