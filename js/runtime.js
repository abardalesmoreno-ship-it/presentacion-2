import {createMap} from './maps/leaflet.js';
import Chart from 'chart.js/auto';
import katex from 'katex';
import {createFleetView} from './simulation/fleet-3d.js';
Chart.defaults.color='#c5b6d6';
Chart.defaults.borderColor='#ffffff16';
export const services={createMap,createFleetView,createChart:(canvas,config)=>new Chart(canvas,config),formula:(host,formula)=>katex.render(formula,host,{throwOnError:false,displayMode:true}),download(name,content){const url=URL.createObjectURL(new Blob([content],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}};
