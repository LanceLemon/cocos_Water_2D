import { Vec2 } from "cc"

export interface IWaveInfo {
    waveLength: number    //波长
    amplitude: number    //初始振幅
    frequency: number   //频率
    phase: number       //相位
    pos: Vec2           //振源位置

}
interface IWave extends IWaveInfo {
    get t(): number //时间
    get decay(): number //衰减系数
    get height(): number //当前振子高度
    get speed(): number //波沿着水平方向传播的速度
    get validRange(): number //振子可影响的范围 
    getHeightAt(dis: number)//距离为dis处的波的高度
}

export class Wave implements IWave {
    waveLength: number
    amplitude: number
    frequency: number
    phase: number
    pos: Vec2 = new Vec2()

    get t() {
        return (Date.now() - this._startTime) / 1000
    }
    get decay() {
        if (this.t > Wave.SHAKE_TIME || this.t < 0.) return 0.0
        else return (1. - this.t / Wave.SHAKE_TIME) ** 2
    }
    get height() {
        return this.amplitude * this.decay * Math.sin(this.t * 2 * Math.PI * this.frequency)
    }
    get speed(): number {
        return this.frequency * this.waveLength
    }
    get validRange() {
        return this.speed * Wave.SHAKE_TIME
    }
    getHeightAt(dis: number) {
        if (dis > this.validRange) return 0 //out of range
        else if (this.t < dis / this.speed) return 0 //wave not arrive yet
        else {
            const costTime = dis / this.speed
            return this.amplitude * this.decay * Math.sin((this.t - costTime) * 2 * Math.PI * this.frequency)
        }
    }

    static SHAKE_TIME: number = 4.0 //波的寿命
    _startTime: number//开始振动的时间
    constructor(waveInfo: IWaveInfo) {
        this.waveLength = waveInfo.waveLength
        this.amplitude = waveInfo.amplitude
        this.frequency = waveInfo.frequency
        this.phase = waveInfo.phase
        this.pos.set(waveInfo.pos)

        this._startTime = Date.now()
    }
}
