<template>
  <section class="settings">
    <header class="settings__header">
      <h2 class="settings__title">Settings</h2>
      <button type="button" class="settings__close" @click="$emit('close')">
        ✕
      </button>
    </header>

    <div class="settings__list">
      <div
        v-for="(city, index) in localCities"
        :key="city.id"
        class="settings__item"
        draggable="true"
        @dragstart="onDragStart(index)"
        @dragover.prevent
        @drop="onDrop(index)"
      >
        <span class="settings__drag">≡</span>
        <span class="settings__label">
          {{ city.name }}, {{ city.country }}
        </span>
        <button
          type="button"
          class="settings__remove"
          @click="removeCity(city.id)"
        >
          🗑️
        </button>
      </div>

      <p v-if="!localCities.length" class="settings__empty">
        No cities yet. Add one below 👇
      </p>
    </div>

    <form class="settings__add" @submit.prevent="handleAddCity">
      <label class="settings__add-label">
        Add location:
        <input
          v-model="newCity"
          type="text"
          placeholder="Tashkent"
        />
      </label>

      <button type="submit" class="settings__add-btn">
        Add
      </button>
    </form>

    <p v-if="errorMessage" class="settings__error">
      {{ errorMessage }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { CityConfig } from '../types';
import { findCity } from '../../api/openWeather';

interface Props {
  cities: CityConfig[];
}

const props = defineProps<Props>();

const emits = defineEmits<{
  (e: 'close'): void;
  (e: 'update:cities', cities: CityConfig[]): void;
}>();

const localCities = ref<CityConfig[]>([]);
const newCity = ref('');
const errorMessage = ref('');
const dragIndex = ref<number | null>(null);

watch(
  () => props.cities,
  (val) => {
    localCities.value = Array.isArray(val) ? [...val] : [];
  },
  { immediate: true, deep: true }
);

function emitUpdate() {
  emits('update:cities', [...localCities.value]);
}

function removeCity(id: string) {
  localCities.value = localCities.value.filter((c) => c.id !== id);
  emitUpdate();
}

async function handleAddCity() {
  errorMessage.value = '';

  const query = newCity.value.trim();
  if (!query) {
    errorMessage.value = 'Please enter a city name.';
    return;
  }

  try {
    const place = await findCity(query);

    if (!place) {
      errorMessage.value = 'City not found. Try another name.';
      return;
    }

    const id = `city-${place.lat}-${place.lon}-${Date.now()}`;

    const exists = localCities.value.some(
      (c) =>
        Math.abs(c.lat - place.lat) < 0.001 &&
        Math.abs(c.lon - place.lon) < 0.001
    );

    if (exists) {
      errorMessage.value = 'This city is already in the list.';
      return;
    }

    const newConfig: CityConfig = {
      id,
      name: place.name,
      country: place.country || '',
      lat: place.lat,
      lon: place.lon
    };

    localCities.value.push(newConfig);
    newCity.value = '';
    emitUpdate();
  } catch (e) {
    console.error('Failed to add city', e);
    errorMessage.value = 'Failed to add city. Please try again.';
  }
}

function onDragStart(index: number) {
  dragIndex.value = index;
}

function onDrop(targetIndex: number) {
  if (dragIndex.value === null || dragIndex.value === targetIndex) return;

  const list = [...localCities.value];
  const [moved] = list.splice(dragIndex.value, 1);
  list.splice(targetIndex, 0, moved);

  localCities.value = list;
  dragIndex.value = null;
  emitUpdate();
}
</script>

<style scoped lang="scss">
.settings {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
  }

  &__close {
    border: none;
    background: transparent;
    cursor: pointer;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    background: #f4f4f4;
    border-radius: 6px;
  }

  &__drag {
    cursor: grab;
  }

  &__label {
    font-size: 13px;
  }

  &__remove {
    margin-left: auto;
    border: none;
    background: transparent;
    cursor: pointer;
  }

  &__add {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    margin-top: 4px;
  }

  &__add-label {
    font-size: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  input {
    border-radius: 4px;
    border: 1px solid #ccc;
    padding: 4px 6px;
    font-size: 12px;
    width: 100%;
  }

  &__add-btn {
    padding: 6px 12px;
    font-size: 12px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    background: #222;
    color: #fff;
    white-space: nowrap;
  }

  &__error {
    margin-top: 6px;
    font-size: 11px;
    color: #c0392b;
  }

  &__empty {
    font-size: 12px;
    color: #666;
    font-style: italic;
  }
}
</style>
