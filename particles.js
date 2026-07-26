from textwrap import dedent

js = dedent(r'''
/*
=========================================================
JARVIS PARTICLE ENGINE V2
=========================================================
*/
class JarvisParticles{
constructor(canvasId="particleCanvas"){
this.canvas=document.getElementById(canvasId)||document.createElement("canvas");
if(!document.getElementById(canvasId)){
this.canvas.id=canvasId;
Object.assign(this.canvas.style,{position:"fixed",left:0,top:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:"0"});
document.body.prepend(this.canvas);}
this.ctx=this.canvas.getContext("2d");
this.state="idle";
this.count=1000;
this.resize();
window.addEventListener("resize",()=>this.resize());
this.particles=[];
for(let i=0;i<this.count;i++)this.particles.push(this.makeParticle());
requestAnimationFrame(()=>this.animate());
}
resize(){this.canvas.width=innerWidth;this.canvas.height=innerHeight;this.cx=this.canvas.width/2;this.cy=this.canvas.height/2;}
makeParticle(){return{a:Math.random()*6.28,r:80+Math.random()*420,s:.001+Math.random()*.01,size:.5+Math.random()*2.5,c:["#00A8FF","#4DDFFF","#82F6FF","#3FA9FF"][Math.floor(Math.random()*4)],o:Math.random()*999};}
setState(s){this.state=s;}
animate(){
requestAnimationFrame(()=>this.animate());
const c=this.ctx;
c.clearRect(0,0,this.canvas.width,this.canvas.height);
c.fillStyle="rgba(0,20,40,.05)";
c.fillRect(0,0,this.canvas.width,this.canvas.height);
for(const p of this.particles){
if(this.state==="thinking"){p.r-=0.8;if(p.r<25)p.r=420+Math.random()*120;}
else if(this.state==="speaking")p.r+=Math.sin(Date.now()/120+p.o)*1.2;
else if(this.state==="listening")p.r+=Math.sin(Date.now()/400+p.o)*.4;
else p.r+=Math.sin(Date.now()/1000+p.o)*.08;
p.a+=p.s;
let x=this.cx+Math.cos(p.a)*p.r;
let y=this.cy+Math.sin(p.a)*p.r;
c.beginPath();
c.fillStyle=p.c;
c.shadowBlur=12;
c.shadowColor=p.c;
c.arc(x,y,p.size,0,6.28);
c.fill();
if(this.state==="thinking"){
c.beginPath();
c.strokeStyle="rgba(0,180,255,.06)";
c.moveTo(x,y);c.lineTo(this.cx,this.cy);c.stroke();
}}
let sweep=(Date.now()/18)%360;
c.save();
c.translate(this.cx,this.cy);
c.rotate(sweep*Math.PI/180);
c.fillStyle="rgba(100,220,255,.08)";
c.beginPath();
c.moveTo(0,0);c.arc(0,0,280,0,.25);c.closePath();c.fill();
c.restore();
}}
window.jarvisParticles=new JarvisParticles();
''')

path="/mnt/data/particles.js"
with open(path,"w") as f:f.write(js)
print(path)
