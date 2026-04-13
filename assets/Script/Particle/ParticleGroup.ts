import { Vec2 } from "cc";
import { vParticle } from "./Particle";

export class vPGroup {
    particles: vParticle[] = [];
    cRow: number = 1;
    cCol: number = 1;
    static gravity: Vec2 = new Vec2(0, -16000);

    addParticles(particle: vParticle) {
        this.particles.push(particle);
    }

    freezeRow(rowIndex: number) {
        this.particles.forEach((p, index: number) => {
            if (index % this.cCol == rowIndex) p.freeze();
        });
    }

    unfreezeRow(rowIndex: number) {
        this.particles.forEach((p, index: number) => {
            if (index % this.cCol == rowIndex) p.unfreeze();
        });
    }
}

