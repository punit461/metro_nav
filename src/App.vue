export const AppVue = `
<template>
  <div id="q-app">
    <q-layout view="lHh Lpr lFf">
      <q-header elevated class="bg-primary text-white">
        <q-toolbar>
          <q-btn
            flat
            dense
            round
            @click="leftDrawerOpen = !leftDrawerOpen"
            icon="menu"
            aria-label="Menu"
          />

          <q-toolbar-title>
            Bangalore Metro Navigator
          </q-toolbar-title>
        </q-toolbar>
      </q-header>

      <q-drawer
        v-model="leftDrawerOpen"
        show-if-above
        bordered
        content-class="bg-grey-1"
      >
        <q-list>
          <q-item-label header class="text-grey-8">
            Metro Options
          </q-item-label>
          
          <q-item clickable to="/">
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section>
              Home
            </q-item-section>
          </q-item>
          
          <q-item clickable to="/find-route">
            <q-item-section avatar>
              <q-icon name="directions" />
            </q-item-section>
            <q-item-section>
              Find Route
            </q-item-section>
          </q-item>
          
          <q-item clickable to="/tickets">
            <q-item-section avatar>
              <q-icon name="receipt" />
            </q-item-section>
            <q-item-section>
              Tickets
            </q-item-section>
          </q-item>
          
          <q-item clickable to="/fare-calculator">
            <q-item-section avatar>
              <q-icon name="calculate" />
            </q-item-section>
            <q-item-section>
              Fare Calculator
            </q-item-section>
          </q-item>
        </q-list>
      </q-drawer>

      <q-page-container>
        <router-view />
      </q-page-container>
    </q-layout>
  </div>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      leftDrawerOpen: false
    }
  }
}
</script>
`;