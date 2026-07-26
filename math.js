from textwrap import dedent

code = dedent(r'''
/*
=========================================================
JARVIS MATH UTILITIES
=========================================================
*/

class JarvisMath {

    static clamp(value, min, max){
        return Math.min(Math.max(value, min), max);
    }

    static lerp(a, b, t){
        return a + (b - a) * t;
    }

    static distance(x1, y1, x2, y2){
        return Math.hypot(x2 - x1, y2 - y1);
    }

    static angle(x1, y1, x2, y2){
        return Math.atan2(y2 - y1, x2 - x1);
    }

    static random(min, max){
        return Math.random() * (max - min) + min;
    }

    static randomInt(min, max){
        return Math.floor(this.random(min, max + 1));
    }

    static radians(degrees){
        return degrees * Math.PI / 180;
    }

    static degrees(radians){
        return radians * 180 / Math.PI;
    }

    static map(value, inMin, inMax, outMin, outMax){
        return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
    }

    static smooth(current, target, speed=0.08){
        return current + (target - current) * speed;
    }

    static orbit(cx, cy, radius, angle){
        return {
            x: cx + Math.cos(angle) * radius,
            y: cy + Math.sin(angle) * radius
        };
    }

}

window.JarvisMath = JarvisMath;
''')

path="/mnt/data/math.js"
with open(path,"w") as f:
    f.write(code)

print(path)
