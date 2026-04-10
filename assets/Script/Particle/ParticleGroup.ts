import { Vec2 } from "cc";
import { vParticle } from "./Particle";
import { ParticleSpring } from "./Spring";

export class vPGroup {
    particles: vParticle[] = [];
    springs: ParticleSpring[] = [];
    cRow: number = 1;
    cCol: number = 1;
    static gravity: Vec2 = new Vec2(0, -16000);

    addParticles(particle: vParticle) {
        this.particles.push(particle);
    }
    addSpring(start: vParticle, end: vParticle, springConstant: number) {
        const restLength = Vec2.distance(start.pos, end.pos);
        const spring1 = new ParticleSpring(
            start,
            end,
            restLength,
            springConstant,
        );
        this.springs.push(spring1);
    }

    _tempV: Vec2 = new Vec2();
    dragAt(pos: Vec2, dir: Vec2) {
        if (this.isArrive) return;

        this.particles.forEach((p) => {
            const dis = Vec2.distance(p.pos, pos);
            const force = 24000000 / Math.max(dis, 0.01);
            Vec2.multiplyScalar(this._tempV, dir, force);

            p.addForce(this._tempV);
        });
    }


    moveByForce(dt: number) {
        this.springs.forEach((spring) => {
            spring.start.addForce(spring.getSpringForce());
            spring.start.addForce(vPGroup.gravity);
        });
        this.particles.forEach((p) => {
            p.updatePos(dt);
        });
    }

    isConnecting: boolean = false;
    isArrive: boolean = false;
    checkState(callback?: () => void): boolean {
        if (this.isArrive) return;
        let freezeCount = 0;
        this.particles.forEach((p, index) => {
            if (index % this.cCol < this.cRow - 3) return;
            if (p.isStable == true) freezeCount++;
        });

        // 当有粒子处于冻结状态时，进入连接状态
        if (freezeCount > 0) this.isConnecting = true;
        if (freezeCount > 10) this.isArrive = true;

        // 当到达目标时，调用解冻方法，使根部脱离,并且休眠
        if (this.isArrive) {
            this.unfreezeRow(0);
            callback?.();
        }

        return this.isConnecting;
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

