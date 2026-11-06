import L from 'leaflet';
import {colors} from '../scenes/shared.js';
export function createMap(host,{center=[-11.945,-77.04],zoom=13}={}){
 const map=L.map(host,{preferCanvas:true,keyboard:true}).setView(center,zoom);
 const tile=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
 let failed=0;tile.on('tileerror',()=>{if(++failed===1){const notice=host.ownerDocument.createElement('div');notice.className='map-offline';notice.textContent='No se pudieron cargar teselas OSM. Revisa la conexión; el grafo sigue siendo demostrativo.';host.append(notice);}});
 const layer=L.layerGroup().addTo(map);let click;
 const observer=new ResizeObserver(()=>map.invalidateSize({pan:false}));observer.observe(host);
 return {center:(at,z)=>map.setView(at,z),fit:points=>map.fitBounds(points.map(p=>[p.lat,p.lng]),{padding:[25,25],maxZoom:15}),onClick(fn){if(click)map.off('click',click);click=e=>fn({lat:e.latlng.lat,lng:e.latlng.lng});map.on('click',click);},set({fleet=[],passenger,selected=[],winner,route=[],roads,onNode,onEdge,points=[]}={}){
 layer.clearLayers();const selectedIds=new Set(selected.map(p=>typeof p==='object'?p.id:p));
 if(roads)for(const [id,edges] of Object.entries(roads.graph)){const a=roads.nodes[id];for(const e of edges)if(+id<+e.to){const b=roads.nodes[e.to];const line=L.polyline([[a.lat,a.lng],[b.lat,b.lng]],{color:'#9b6dc0',weight:2,opacity:.7}).addTo(layer);line.bindTooltip(`Grafo demostrativo ${id} ↔ ${e.to}: ${e.weight.toFixed(3)} km`);line.on('click',event=>{L.DomEvent.stopPropagation(event);onEdge?.(id,e.to,e.weight);});}}
 if(roads&&onNode)for(const n of Object.values(roads.nodes)){const mark=L.circleMarker([n.lat,n.lng],{radius:4,color:'#b026ff',fillOpacity:1}).addTo(layer);mark.bindTooltip(`Nodo sintético ${n.id}`);mark.on('click',e=>{L.DomEvent.stopPropagation(e);onNode(n);});}
 for(const p of fleet){const color=p.id===winner?colors.winner:selectedIds.has(p.id)?colors.candidate:p.available?colors.available:colors.busy;L.circleMarker([p.lat,p.lng],{radius:p.id===winner?8:4,color,fillOpacity:.9,weight:1}).bindTooltip(`Conductor ${p.id} · ${p.available?'disponible':'ocupado'}`).addTo(layer);}
 if(passenger)L.circleMarker([passenger.lat,passenger.lng],{radius:9,color:colors.passenger,fillOpacity:1}).bindTooltip('Pasajero').addTo(layer);
 for(const p of points)L.circleMarker([p.lat,p.lng],{radius:8,color:p.color??colors.passenger,fillOpacity:1}).bindTooltip(p.label??'Punto').addTo(layer);
 if(route.length&&roads)L.polyline(route.map(id=>[roads.nodes[id].lat,roads.nodes[id].lng]),{color:colors.winner,weight:5,dashArray:'7 5'}).bindTooltip('Ruta por grafo demostrativo; no sigue calles reales').addTo(layer);
 },destroy(){observer.disconnect();map.remove();}};
}
