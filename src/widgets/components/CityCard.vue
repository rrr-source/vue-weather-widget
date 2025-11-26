<template>
  <article class="city-card">
    <div class="city-card__top">
      <div class="city-card__left">
        <div class="city-card__icon" v-if="iconUrl">
          <img :src="iconUrl" :alt="desc || 'Weather icon'" />
        </div>
        <div>
          <div class="city-card__location">
            {{ city.name }}, {{ city.country }}
          </div>
          <div class="city-card__meta-text" v-if="!hasError">
            {{ desc || 'Loading...' }}
          </div>
          <div class="city-card__meta-text city-card__meta-text--error" v-else>
            Unable to load weather data.
          </div>
        </div>
      </div>

      <div class="city-card__right">
        <div class="city-card__temp">
          {{ temp !== null ? Math.round(temp) + '°C' : hasError ? '—' : '…' }}
        </div>
        <div class="city-card__feels" v-if="!hasError && feels !== null">
          Feels like {{ feels }}°C
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { CityConfig } from '../types';
import { getWeather } from '../../api/openWeather';

interface Props {
  city: CityConfig;
}

const props = defineProps<Props>();

const temp = ref<number | null>(null);
const feels = ref<number | null>(null);
const desc = ref('');
const iconCode = ref<string | null>(null);
const hasError = ref(false);

const iconUrl = computed(() =>
  iconCode.value
    ? `https://openweathermap.org/img/wn/${iconCode.value}@2x.png`
    : ''
);

onMounted(async () => {
  try {
    const data = await getWeather(props.city.lat, props.city.lon);

    if (!data || !data.main) {
      console.warn('Weather API response is not ok:', data);
      hasError.value = true;
      return;
    }

    temp.value = Math.round(data.main.temp);
    feels.value = Math.round(data.main.feels_like);
    desc.value = data.weather?.[0]?.description || '';
    iconCode.value = data.weather?.[0]?.icon || null;
  } catch (e) {
    console.error('Failed to load weather', e);
    hasError.value = true;
  }
});
</script>

<style scoped lang="scss">
.city-card {
  &__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  &__icon {
    border: 1px solid #d3d4d9;
    border-radius: 8px;
    width: 40px;
    height: 40px;
    flex-shrink: 0;

    img {
      width: 40px;
      height: 40px;
      display: block;
    }
  }

  &__location {
    font-size: 1em;
    font-weight: 600;
  }

  &__meta-text {
    font-size: 11px;
    color: #6b7280;
    text-transform: capitalize;

    &--error {
      color: #b91c1c;
    }
  }

  &__right {
    text-align: right;
  }

  &__temp {
    font-size: 26px;
    font-weight: 700;
  }

  &__feels {
    font-size: 11px;
    color: #6b7280;
    margin-top: 3px;
  }
}
</style>
