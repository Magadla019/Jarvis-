from textwrap import dedent

code = dedent(r'''
/*
=========================================================
JARVIS HUD ENGINE
=========================================================
*/

class JarvisHUD {
    constructor(canvasId="hudCanvas"){
        this.canvas=document.getElementById(canvasId)||document.createElement("canvas");
        if(!document.getElementById(canvasId)){
            this.canvas.id=canvasId;
            Object.assign(this.canvas.style,{
                position:"fixed",
                inset:"0",
                width:"100%",
                height:"100%",
                pointerEvents:"none",
                zIndex:"2"
            });
            document.body.appendChild(this.canvas);
        }

        this.ctx=this.canvas.getContext("2d");
        this.state="idle";
        this.resize();
        window.addEventListener("resize",()=>this.resize());
        requestAnimationFrame(()=>this.draw());
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

    ring(r,lw,color,rot=0,dash=[]){
        const c=this.ctx;
        c.save();
        c.translate(this.cx,this.cy);
        c.rotate(rot);
        c.beginPath();
        c.setLineDash(dash);
        c.strokeStyle=color;
        c.lineWidth=lw;
        c.arc(0,0,r,0,Math.PI*2);
        c.stroke();
        c.restore();
    }

    draw(){
        requestAnimationFrame(()=>this.draw());

        const c=this.ctx;
        c.clearRect(0,0,this.canvas.width,this.canvas.height);

        const t=Date.now()/1000;

        this.ring(110,1,"rgba(0,170,255,.4)",t*0.2,[6,8]);
        this.ring(135,2,"rgba(80,220,255,.55)",-t*0.35,[20,10]);
        this.ring(165,1,"rgba(0,255,255,.25)",t*0.15,[3,12]);

        if(this.state==="thinking"||this.state==="speaking"){
            for(let i=0;i<12;i++){
                const a=(Math.PI*2/12)*i+t;
                c.beginPath();
                c.moveTo(this.cx+Math.cos(a)*110,this.cy+Math.sin(a)*110);
                c.lineTo(this.cx+Math.cos(a)*165,this.cy+Math.sin(a)*165);
                c.strokeStyle="rgba(0,200,255,.18)";
                c.stroke();
            }
        }

        if(this.state==="thinking"){
            c.save();
            c.translate(this.cx,this.cy);
            c.rotate(t*2);
            c.fillStyle="rgba(100,240,255,.12)";
            c.beginPath();
            c.moveTo(0,0);
            c.arc(0,0,180,0,0.22);
            c.closePath();
            c.fill();
            c.restore();
        }
    }
}

window.jarvisHUD=new JarvisHUD();
''')

path="/mnt/data/hud.js"
with open(path,"w") as f:
    f.write(code)

print(path)
