import { Vec2 } from "cc";
import { vParticle } from "./Particle";

/**
 * 粒子弹簧
 * 注意:只表现为单方向的力,没有对应的反作用力
 */
export class ParticleSpring {
    start: vParticle = null;
    end: vParticle = null;
    restLength: number = 0;
    springConstant: number = 512;
    _force: Vec2 = new Vec2(0, 0);
    _deltaP: Vec2 = new Vec2(0, 0);

    constructor(
        me: vParticle,
        other: vParticle,
        length: number,
        springConstant: number,
    ) {
        this.start = me;
        this.end = other;
        this.restLength = length;
        this.springConstant = springConstant;
    }

    getSpringForce(): Vec2 {
        this._force.set(0, 0);
        Vec2.subtract(this._deltaP, this.end.pos, this.start.pos);
        const dis = this._deltaP.length();
        const deltaL = dis - this.restLength;
        const strength = deltaL * this.springConstant;
        this._deltaP.normalize();
        Vec2.multiplyScalar(this._force, this._deltaP, strength);

        return this._force;
    }
}
