# Vue Weather Widget

Small embeddable weather widget built with **Vue 3**, **TypeScript**, **SCSS**, and **Webpack**.

The widget can be added to any HTML page using a simple snippet:

```html
<weather-widget></weather-widget>
<script src="path/to/weather-widget.js"></script>
```

# Project Structure

public/
index.html               # Demo page for development

src/
api/
openWeather.ts         # OpenWeather API helpers

styles/
main.scss              # Widget styles

widgets/
WeatherWidget.vue      # Root widget
types.ts               # Shared interfaces
components/
CityCard.vue         # Display a city’s weather
SettingsView.vue     # Add/remove/reorder cities UI

index.ts                 # UMD entry (mounts <weather-widget>)

webpack.config.js          # Webpack configuration
tsconfig.json              # TypeScript configuration
package.json               # Scripts & dependencies

# Setup & Development
npm install

npm run dev

npm run build

# Embedding the Widget Into Any Website
dist/weather-widget.js

```
<div>
  <weather-widget></weather-widget>
</div>

<script src="https://yourcdn.com/weather-widget.js"></script>
```


