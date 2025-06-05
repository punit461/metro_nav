<!-- AboutPage.vue -->
<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md items-center">
      <q-btn icon="arrow_back" flat round color="primary" @click="$router.go(-1)" />
      <h4 class="q-ma-none q-ml-sm">About</h4>
    </div>

    <q-card class="q-pa-md">
      <div class="text-center q-mb-lg">
        <q-icon name="directions_subway" color="primary" size="4rem" />
        <h5 class="q-mt-md q-mb-xs">Namma Metro Navigation</h5>
        <div class="text-subtitle1 text-grey-7">Version 1.0.0</div>
      </div>

      <q-separator class="q-my-md" />

      <div class="q-px-md">
        <h6>About This App</h6>
        <p>Namma Metro Navigation helps you navigate the city's metro system with ease.</p>
        <p>
          Whether you're a daily commuter or a tourist, this app is your go-to guide for navigating
          the metro system.
        </p>

        <h6 class="q-mt-lg">Features</h6>
        <q-list dense>
          <q-item>
            <q-item-section avatar>
              <q-icon color="primary" name="search" />
            </q-item-section>
            <q-item-section>Find the fastest route between any two stations</q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon color="primary" name="bookmark" />
            </q-item-section>
            <q-item-section>Save your favorite routes for quick access</q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon color="primary" name="share" />
            </q-item-section>
            <q-item-section>Share routes with friends and family</q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon color="primary" name="access_time" />
            </q-item-section>
            <q-item-section
              >Get accurate travel time estimates (Fare, Time, InterChanges)</q-item-section
            >
          </q-item>
        </q-list>

        <h6 class="q-mt-lg">How to Use</h6>
        <p>Press <b>Find Route</b> button to find the fastest route between two stations.</p>
        <p>Enter your starting station and destination.</p>
        <p>The app will calculate the fastest path, including any necessary line changes.</p>
        <p>
          You can save your frequent routes or share them with others directly from the route
          details page.
        </p>

        <h6 class="q-mt-lg">Metro System Information</h6>
        <p>
          This app covers all operational metro lines and stations in the Bangalore city's Metro
          transit system. Station information and travel times are regularly updated to provide the
          most accurate journey planning.
        </p>

        <q-separator class="q-my-lg" />

        <h6>About Developer</h6>
        <p class="q-mb-lg">
          Hi I'm Punit, I developed this App to ease finding metro route namma metro needed a
          navigator app which could tell you exact route details.
        </p>
        Hope it helps the user, hit me up on email for all your queries and feedback.
        <p></p>

        <q-separator class="q-my-lg" />

        <h6>Contact & Support</h6>
        <p class="q-mb-lg">
          Have questions, feedback, or encountered an issue? We'd love to hear from you!
        </p>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <q-card flat bordered class="text-center q-pa-md">
              <q-icon name="email" size="2rem" color="primary" />
              <div class="text-subtitle1 q-mt-sm">Email Support</div>
              <a
                href="mailto:punit461bharadwaj@gmail.com"
                style="text-decoration: none; color: inherit"
              >
                punit461bharadwaj@gmail.com
              </a>
            </q-card>
          </div>
          <!-- <div class="col-12 col-sm-6">
              <q-card flat bordered class="text-center q-pa-md">
                <q-icon name="help" size="2rem" color="primary" />
                <div class="text-subtitle1 q-mt-sm">Help Center</div>
                <div class="text-grey-7">Visit our help center</div>
              </q-card>
            </div> -->
        </div>
      </div>

      <q-separator class="q-my-lg" />

      <div class="text-center text-grey-7 text-caption">
        <div>© {{ currentYear }} Namma Metro Navigation</div>
        <div class="q-mt-xs">All rights reserved</div>
      </div>
    </q-card>
  </q-page>
</template>

<script>
export default {
  name: 'AboutPage',
  data() {
    return {
      currentYear: new Date().getFullYear(),
    }
  },
}
</script>

<style scoped>
h6 {
  font-weight: 500;
  margin-bottom: 8px;
}
</style>
