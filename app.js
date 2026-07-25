from textwrap import dedent

code = dedent(r'''
/*
=========================================================
JARVIS APP ENGINE v2
=========================================================
*/

class JarvisApp {

    constructor() {
        this.state = "idle";
        this.orb = document.getElementById("orb");

        this.init();
    }

    init() {
        this.setState("idle");

        if (this.orb) {
            this.orb.addEventListener("click", () => this.toggleDemo());
        }
    }

    setState(state) {
        this.state = state;

        if (this.orb) {
            this.orb.className = "orb " + state;
        }

        if (window.jarvisParticles) {
            window.jarvisParticles.setState(state);
        }

        if (window.jarvisEffects) {
            window.jarvisEffects.setState(state);
        }

        if (window.jarvisHUD) {
            window.jarvisHUD.setState(state);
        }

        const label = document.getElementById("stateLabel");
        if (label) {
            label.textContent = state.toUpperCase();
        }
    }

    async toggleDemo() {
        this.setState("listening");
        await this.wait(1500);

        this.setState("thinking");
        await this.wait(2500);

        this.setState("speaking");
        await this.wait(2000);

        this.setState("idle");
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

window.addEventListener("DOMContentLoaded", () => {
    window.jarvisApp = new JarvisApp();
});
''')

path="/mnt/data/app.js"
with open(path,"w") as f:
    f.write(code)

print(path)
