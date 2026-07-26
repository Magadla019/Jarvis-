from textwrap import dedent

code = dedent(r'''
/*
=========================================================
JARVIS EFFECTS ENGINE V2
=========================================================
*/

class JarvisEffects {
    constructor(canvasId="effectsCanvas"){
        this.canvas=document.getElementById(canvasId)||document.createElement("canvas");
        if(!document.getElementById(canvasId)){
            this.canvas.id=canvasId;
            Object.assign(this.canvas.style,{
                position:"fixed",
                left:"0",
                top:"0",
                width:"100%",
                height:"100%",
                pointerEvents:"none",
                zIndex:"1"
            });
            document.body.prepend(this.canvas);
        }

        this.ctx=this.canvas.getContext("2d");
        this.state="idle";
        this.resize();
        window.addEventListener("resize",()=>this.resize());
        requestAnimationFrame(()=>this.animate());
    }

    resize(){
        this.canvas.width=innerWidth;
        this.canvas.height=innerHeight;
        this.cx=this.canvas.width/2;
        this.cy=this.canvas.height/2;
    }

    setState(state){
        this.state=state;
    }

    animate(){
        requestAnimationFrame(()=>this.animate());

        const c=this.ctx;
        c.clearRect(0,0,this.canvas.width,this.canvas.height);

        // Blue Fog
        const g=c.createRadialGradient(this.cx,this.cy,50,this.cx,this.cy,450);
        g.addColorStop(0,"rgba(0,180,255,.10)");
        g.addColorStop(.5,"rgba(0,120,255,.05)");
        g.addColorStop(1,"rgba(0,0,0,0)");
        c.fillStyle=g;
        c.fillRect(0,0,this.canvas.width,this.canvas.height);

        // Radar Sweep
        c.save();
        c.translate(this.cx,this.cy);
        c.rotate((Date.now()/1800)*Math.PI);
        c.fillStyle="rgba(120,230,255,.08)";
        c.beginPath();
        c.moveTo(0,0);
        c.arc(0,0,320,0,.22);
        c.closePath();
        c.fill();
        c.restore();

        // Plasma Ring
        c.beginPath();
        c.strokeStyle="rgba(0,210,255,.35)";
        c.lineWidth=this.state==="speaking"?5:2;
        c.arc(this.cx,this.cy,120+Math.sin(Date.now()/200)*3,0,Math.PI*2);
        c.stroke();

        // Electric Arcs
        if(this.state==="thinking"||this.state==="speaking"){
            for(let i=0;i<8;i++){
                const a=Math.random()*Math.PI*2;
                const r1=95;
                const r2=140+Math.random()*40;
                c.beginPath();
                c.moveTo(this.cx+Math.cos(a)*r1,this.cy+Math.sin(a)*r1);
                c.lineTo(this.cx+Math.cos(a)*r2,this.cy+Math.sin(a)*r2);
                c.strokeStyle="rgba(120,240,255,.45)";
                c.lineWidth=1;
                c.stroke();
            }
        }
    }
}

window.jarvisEffects=new JarvisEffects();
''')

path="/mnt/data/effects.js"
with open(path,"w") as f:
    f.write(code)

print(path)
