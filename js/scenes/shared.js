import { makeFleet, makeRoads, geo } from '../simulation/fleet.js';
export const colors={available:'#00d9ff',busy:'#6c617d',passenger:'#ffce66',candidate:'#b026ff',winner:'#50e3ac'};
export function createSession(){return {fleet:makeFleet(),passenger:{x:.5,y:.5,...geo({x:.5,y:.5})},roads:makeRoads(),lastDispatch:null,benchmark:null,testRun:null};}
export function lesson(ctx,id,title,subtitle,html){
 ctx.stage.innerHTML=`<section class="scene lesson" data-lesson="${id}"><div class="lesson-heading"><div class="eyebrow">NEXO / ${String(id).padStart(2,'0')} · EXPLORA EL ALGORITMO</div><h2 tabindex="-1">${title}</h2><p>${subtitle}</p></div><div class="lesson-content">${html}</div></section>`;
 const root=ctx.stage.querySelector('.lesson'),disposals=[];
 return {root,$:s=>root.querySelector(s),all:s=>[...root.querySelectorAll(s)],on(s,event,fn){root.querySelector(s).addEventListener(event,fn);},every(fn,ms=600){const handle=ctx.window.setInterval(()=>{if(!ctx.state.paused)fn();},ms);disposals.push(()=>ctx.window.clearInterval(handle));},dispose(fn){disposals.push(fn);},cleanup(){disposals.reverse().forEach(fn=>fn());}};
}
export const panel=(title,body,cls='')=>`<section class="panel ${cls}"><h3>${title}</h3>${body}</section>`;
export const field=(id,label,value,options='')=>`<label>${label}<input id="${id}" type="number" value="${value}" ${options}></label>`;
export const button=(id,text,cls='')=>`<button id="${id}" class="${cls}">${text}</button>`;
export const fmt=(v,d=2)=>Number.isFinite(v)?v.toLocaleString('es-PE',{maximumFractionDigits:d,minimumFractionDigits:d}):'∞';
export function number(root,id,min,max){const input=root.querySelector(id);if(input.value.trim()==='')throw new Error('Completa todos los campos numéricos.');const n=Number(input.value);if(!Number.isFinite(n)||n<min||n>max)throw new Error(`Valor fuera de rango (${min} a ${max}).`);return n;}
export function guard(view,fn){try{fn();const e=view.$('.error');if(e)e.textContent='';}catch(error){const e=view.$('.error');if(e)e.textContent=error.message;else throw error;}}
export const errorBox='<p class="error" role="alert"></p>';
export function urbanSvg(points,passenger,{tree,region,selected=[],winner,route=[],roads}={}){
 const picked=new Set(selected.map(p=>typeof p==='object'?p.id:p));
 let lines='';for(let i=0;i<=10;i++)lines+=`<path d="M ${i*60} 0 V 400 M 0 ${i*40} H 600" stroke="#352343" stroke-width="1"/>`;
 if(tree)tree.visit(node=>{const b=node.bounds;lines+=`<rect x="${b.x*600}" y="${(1-b.y-b.h)*400}" width="${b.w*600}" height="${b.h*400}" fill="none" stroke="#794b98" stroke-width=".6"/>`;});
 if(region)lines+=`<rect x="${region.x*600}" y="${(1-region.y-region.h)*400}" width="${region.w*600}" height="${region.h*400}" fill="#b026ff18" stroke="#b026ff" stroke-width="2"/>`;
 if(route.length&&roads)lines+=`<polyline points="${route.map(id=>`${roads.nodes[id].x*600},${(1-roads.nodes[id].y)*400}`).join(' ')}" fill="none" stroke="${colors.winner}" stroke-width="4"/>`;
 return `<svg class="urban-svg" viewBox="0 0 600 400" role="img" aria-label="Ciudad simulada: conductores y pasajero"><rect width="600" height="400" fill="#0c0916"/>${lines}${points.map(p=>`<circle data-point="${p.id}" cx="${p.x*600}" cy="${(1-p.y)*400}" r="${p.id===winner?7:picked.has(p.id)?6:4}" fill="${p.id===winner?colors.winner:picked.has(p.id)?colors.candidate:p.available===false?colors.busy:colors.available}"><title>Conductor ${p.id} · ${p.available===false?'ocupado':'disponible'}</title></circle>`).join('')}${passenger?`<g transform="translate(${passenger.x*600},${(1-passenger.y)*400})"><circle r="12" fill="#ffce6620" stroke="#ffce66"/><circle r="5" fill="#ffce66"/><title>Pasajero</title></g>`:''}</svg>`;
}
export const legend='<div class="legend"><span>Disponible</span><span>Candidato</span><span class="passenger-key">Pasajero</span><span class="busy-key">Ocupado</span><span class="winner-key">Asignado</span></div>';
export function svgPosition(event,svg){const r=svg.getBoundingClientRect();if(!r.width||!r.height)return {x:.5,y:.5};const scale=Math.min(r.width/600,r.height/400),width=600*scale,height=400*scale,left=r.left+(r.width-width)/2,top=r.top+(r.height-height)/2;return {x:Math.max(0,Math.min(1,(event.clientX-left)/width)),y:Math.max(0,Math.min(1,1-(event.clientY-top)/height))};}
export function makeMap(ctx,view,selector,options={}){const host=view.$(selector);if(!ctx.services.createMap){host.textContent='Cartografía omitida en el entorno de pruebas DOM.';return {set(){},onClick(){},destroy(){}};}const map=ctx.services.createMap(host,options);view.dispose(()=>map.destroy());return map;}
export function makeChart(ctx,view,selector,config){const chart=ctx.services.createChart?.(view.$(selector),config)??{update(){},destroy(){},data:config.data};view.dispose(()=>chart.destroy());return chart;}
