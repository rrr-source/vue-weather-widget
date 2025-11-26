<template>
  <div class="weather-widget">
    <header class="weather-widget__header">
      <span>Weather Now</span>

      <button
        class="weather-widget__settings-btn"
        type="button"
        @click="toggleSettings"
        aria-label="Open settings"
      >
        <svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.75 13.1882C12.4069 13.1882 13.75 11.8451 13.75 10.1882C13.75 8.53127 12.4069 7.18817 10.75 7.18817C9.0931 7.18817 7.75 8.53127 7.75 10.1882C7.75 11.8451 9.0931 13.1882 10.75 13.1882Z" stroke="#707376" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M0.75 11.0696V9.30957C0.75 8.26957 1.6 7.40957 2.65 7.40957C4.46 7.40957 5.2 6.12957 4.29 4.55957C3.77 3.65957 4.08 2.48957 4.99 1.96957L6.72 0.979573C7.51 0.509573 8.53 0.789573 9 1.57957L9.11 1.76957C10.01 3.33957 11.49 3.33957 12.4 1.76957L12.51 1.57957C12.98 0.789573 14 0.509573 14.79 0.979573L16.52 1.96957C17.43 2.48957 17.74 3.65957 17.22 4.55957C16.31 6.12957 17.05 7.40957 18.86 7.40957C19.9 7.40957 20.76 8.25957 20.76 9.30957V11.0696C20.76 12.1096 19.91 12.9696 18.86 12.9696C17.05 12.9696 16.31 14.2496 17.22 15.8196C17.74 16.7296 17.43 17.8896 16.52 18.4096L14.79 19.3996C14 19.8696 12.98 19.5896 12.51 18.7996L12.4 18.6096C11.5 17.0396 10.02 17.0396 9.11 18.6096L9 18.7996C8.53 19.5896 7.51 19.8696 6.72 19.3996L4.99 18.4096C4.08 17.8896 3.77 16.7196 4.29 15.8196C5.2 14.2496 4.46 12.9696 2.65 12.9696C1.6 12.9696 0.75 12.1096 0.75 11.0696Z" stroke="#707376" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>

      </button>
    </header>

    <SettingsView
      v-if="showSettings"
      :cities="cities"
      @close="showSettings = false"
      @update:cities="updateCities"
    ></SettingsView>

    <div v-else class="weather-widget__city-list">
      <CityCard
        v-for="city in cities"
        :key="city.id"
        :city="city"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import CityCard from './components/CityCard.vue';
import SettingsView from './components/SettingsView.vue';
import type { CityConfig } from './types';
import { getWeather, reverseGeocode } from '../api/openWeather';

const STORAGE_KEY = 'weather_widget_cities';

const DEFAULT_CITIES: CityConfig[] = [
  {
    id: 'london',
    name: 'London',
    country: 'UK',
    lat: 51.5074,
    lon: -0.1278
  },
  {
    id: 'moscow',
    name: 'Moscow',
    country: 'RU',
    lat: 55.7558,
    lon: 37.6176
  }
];

const showSettings = ref(false);
const cities = ref<CityConfig[]>([]);

function saveCities(list: CityConfig[]) {
  cities.value = list;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function toggleSettings() {
  showSettings.value = !showSettings.value;
}

function updateCities(newList: CityConfig[]) {
  saveCities(newList);
}

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      const parsed = JSON.parse(saved) as CityConfig[];
      if (Array.isArray(parsed) && parsed.length) {
        cities.value = parsed;
        return;
      }
    } catch (e) {
      console.warn('Failed to parse saved cities', e);
    }
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          const [place, data] = await Promise.all([
            reverseGeocode(latitude, longitude),
            getWeather(latitude, longitude)
          ]);

          const currentCity: CityConfig = {
            id: `geo-${latitude.toFixed(3)}-${longitude.toFixed(3)}`,
            name: place?.name || data?.name || 'Unknown',
            country: place?.country || data?.sys?.country || '',
            lat: latitude,
            lon: longitude
          };

          saveCities([currentCity]);
        } catch (e) {
          console.error('Failed to load geo weather, fallback to defaults', e);
          saveCities(DEFAULT_CITIES);
        }
      },
      (err) => {
        console.warn('Geolocation denied, fallback to defaults', err);
        saveCities(DEFAULT_CITIES);
      }
    );
  } else {
    saveCities(DEFAULT_CITIES);
  }
});
</script>