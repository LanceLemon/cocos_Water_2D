import { Vec2 } from "cc";

export class vParticle {
    id: number
    pos: Vec2 = new Vec2();
    static mass = 1;
    static maxSpeed: number = 1600;
    static damping: number = 0.988;
    _velocity: Vec2 = new Vec2(0, 0);
    _force: Vec2 = new Vec2(0, 0);
    isStable: boolean = false;
    get velocity(): Vec2 {
        return this._velocity;
    }
    constructor(id: number, pos: Vec2) {
        this.pos.set(pos)
        this.id = id
    }
    // 添加一个单独的方法来限制速度
    limitVelocity() {
        const speed = this._velocity.length();
        if (speed > vParticle.maxSpeed) {
            this._velocity.normalize().multiplyScalar(vParticle.maxSpeed);
        }
    }
    resetForce() {
        this._force.set(0, 0);
    }
    resetVelocity() {
        this._velocity.set(0, 0);
    }

    addForce(otherF: Vec2) {
        Vec2.add(this._force, this._force, otherF);
    }

    updateVelocity(dt: number) {
        if (this.isStable) {
            this.resetVelocity();
            return;
        }

        this._velocity.x += (this._force.x / vParticle.mass) * dt;
        this._velocity.y += (this._force.y / vParticle.mass) * dt;
        this.limitVelocity();
        this.resetForce();
    }

    updatePos(dt: number) {
        this.updateVelocity(dt);
        this.pos.x += this._velocity.x * dt;
        this.pos.y += this._velocity.y * dt;
        this.velocity.multiplyScalar(vParticle.damping);
    }

    setPos(newPos: Vec2) {
        this.resetVelocity();
        this.resetForce();
        this.pos.set(newPos);
    }
    freeze() {
        this.isStable = true;
    }
    unfreeze() {
        this.isStable = false;
    }
    //
    // startTime: number;
    // startVelocity: Vec2 = new Vec2()
    // startPos: Vec2 = new Vec2()
    // elasticity: number = 32;
    // amplitude: number = 32
    // gamma: number
    // c: Vec2 = new Vec2()
    // nextPos: Vec2 = new Vec2()
    // T: number
    // A: Vec2 = new Vec2();
    // B: Vec2 = new Vec2();
    //
    // startWaveAsSpring(startVelocity: Vec2) {
    //
    //     this.startTime = Date.now()
    //     this.startVelocity.set(startVelocity)
    //     this.startPos.set(this.pos)
    //     
    //     this.gamma = 0.5 * Math.sqrt(4 * this.elasticity - vParticle.damping ** 2)
    //     const v1 = new Vec2()
    //     Vec2.multiplyScalar(v1, this.startPos, vParticle.damping / (2 * this.gamma))
    //     const v2 = new Vec2()
    //     Vec2.multiplyScalar(v2, this.startVelocity, 1 / this.gamma)
    //
    //     this.T = 2 * Math.PI / this.gamma
    //
    // }


}
