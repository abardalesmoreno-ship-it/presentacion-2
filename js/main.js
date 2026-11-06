import '../css/main.css';
import '../css/components.css';
import '../css/animations.css';
import '../css/responsive.css';
import '../css/scenes.css';
import 'leaflet/dist/leaflet.css';
import 'katex/dist/katex.min.css';
import { services } from './runtime.js';
import { createCity } from './simulation/city.js';
import { mountApp } from './app.js';

mountApp({ document, window, createCity, services });
