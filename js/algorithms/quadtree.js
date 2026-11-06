export class Quadtree {
 constructor(bounds={x:0,y:0,w:1,h:1},capacity=4,depth=0){if(capacity<1||bounds.w<=0||bounds.h<=0)throw new RangeError('Región inválida');this.bounds=bounds;this.capacity=capacity;this.depth=depth;this.points=[];this.children=null;}
 contains(p){const b=this.bounds;return p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h;}
 insert(p){if(!this.contains(p))return false;if(!this.children&&(this.points.length<this.capacity||this.depth>=18)){this.points.push(p);return true;}if(!this.children){const {x,y,w,h}=this.bounds;this.children=[[x,y],[x+w/2,y],[x,y+h/2],[x+w/2,y+h/2]].map(([a,b])=>new Quadtree({x:a,y:b,w:w/2,h:h/2},this.capacity,this.depth+1));const old=this.points;this.points=[];old.forEach(q=>this.children.some(c=>c.insert(q)));}return this.children.some(c=>c.insert(p));}
 query(r,found=[],stats=null){if(stats)stats.visitedNodes++;const b=this.bounds;if(r.x>b.x+b.w||r.x+r.w<b.x||r.y>b.y+b.h||r.y+r.h<b.y)return found;for(const p of this.points){if(stats)stats.examinedPoints++;if(p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h)found.push(p);}this.children?.forEach(c=>c.query(r,found,stats));return found;}
 queryWithStats(r){const stats={visitedNodes:0,examinedPoints:0};return {points:this.query(r,[],stats),...stats};}
 remove(id){const i=this.points.findIndex(p=>p.id===id);if(i>=0){this.points.splice(i,1);return true;}return this.children?.some(c=>c.remove(id))??false;}
 update(id,position){if(!this.contains(position))return false;const old=this.query(this.bounds).find(p=>p.id===id);if(!old)return false;this.remove(id);return this.insert({...old,...position,id});}
 visit(fn){fn(this);this.children?.forEach(c=>c.visit(fn));}
}
