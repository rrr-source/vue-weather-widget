import { createApp } from 'vue';
import WeatherWidget from './widgets/WeatherWidget.vue';
import './styles/main.scss';

function mountWidgets() {
  const nodes = document.querySelectorAll<HTMLElement>('weather-widget');

  nodes.forEach((node) => {
    if (node.dataset.mounted === 'true') return;

    const app = createApp(WeatherWidget);
    app.mount(node);
    node.dataset.mounted = 'true';
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountWidgets);
} else {
  mountWidgets();
}

export { mountWidgets };