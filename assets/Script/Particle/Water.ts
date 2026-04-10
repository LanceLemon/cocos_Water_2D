import {
    _decorator,
    Color,
    Component,
    Graphics,
    Node,
    UITransform,
    Vec2,
    EventTouch,
    __private,
    Event,
    Vec3,
} from "cc";
import { EDITOR, PREVIEW } from "cc/env";
import { vPGroup } from "./ParticleGroup";
import { vParticle } from "./Particle";
import { VertSprite } from "../VertSprite/VertSprite";
import { IWaveInfo, Wave } from "./Wave";
const { ccclass, property } = _decorator;

export class PetalEvent extends Event {
    constructor(name: string, petalnode: Node) {
        super(name, true);
        this.petal = petalnode;
        console.log(`petalEvent ${name}, petal`, petalnode.uuid);
    }
    petal: Node = null;
}

@ccclass("Water")
export class Water extends Component {
    _verts: { x: number; y: number }[] = [];
    _particleGroup: vPGroup = new vPGroup();

    @property(UITransform)
    targetUIT: UITransform = null!;

    @property(VertSprite)
    vertSp: VertSprite = null!;

    @property(Graphics)
    g: Graphics = null!;

    protected onLoad(): void { }

    protected onEnable(): void {
    }

    protected onDisable(): void {
    }


    start() {
        this._verts = this.vertSp?.vertices;
        const cRow = this.vertSp?.vertRows;
        const cCol = this.vertSp?.vertCols;
        this.creatParticleGroup(
            this._verts,
            cRow,
            cCol,
            8,
            this._particleGroup,
        );

        console.log(this._verts);
        this.scheduleOnce(() => this.vertSp?.markForUpdateRenderData());

        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this)
    }

    _touchUIPos: Vec2 = new Vec2()
    _tempVec3: Vec3 = new Vec3()
    onTouchStart(e: EventTouch) {
        e.getUILocation(this._touchUIPos)
        this._tempVec3.set(this._touchUIPos.x, this._touchUIPos.y)
        this.targetUIT.convertToNodeSpaceAR(this._tempVec3, this._tempVec3)
        this._touchUIPos.set(this._tempVec3.x, this._tempVec3.y)
        console.log('touch at', this._touchUIPos)

        this._touchUIPos.y = this.targetUIT.contentSize.y

        const waveInfo: IWaveInfo = {
            waveLength: 64,
            amplitude: 8,
            frequency: 4,
            phase: 0,
            pos: this._touchUIPos
        }


        this.creatWave(waveInfo)
    }

    update(deltaTime: number) {
        // if (PREVIEW || EDITOR) this.draw();
        this.vertSp?.markForUpdateRenderData();
    }


    private updateVerticles() {
        if (
            this.vertSp == null ||
            this.vertSp == undefined ||
            !this.vertSp.isValid
        )
            return;
        this._particleGroup.particles.forEach((p) => {
            const index = p.id
            this.vertSp.vertices[index] = { x: p.pos.x, y: p.pos.y };
        });
    }


    protected lateUpdate(dt: number): void {
        this.updateSurface()
        this.updateVerticles();
        this.updateWaves()
    }
    _surface: vParticle[] = []
    creatParticleGroup(
        verts: { x: number; y: number }[],
        cRow: number,
        cCol: number,
        r: number,
        group: vPGroup,
    ) {
        const contentSize = this.targetUIT.contentSize;
        const dy = contentSize.x / (cRow - 1);
        const dx = contentSize.y / (cCol - 1);
        this._particleGroup.cRow = cRow;
        this._particleGroup.cCol = cCol;
        let id = 0
        for (let row = 0; row < cRow; row++) {
            for (let col = 0; col < cCol; col++) {
                const x = col * dx;
                const y = row * dy;
                //渲染顶点
                verts.push({ x: x, y: y });
                //物理粒子
                const newP = new vParticle(id++, new Vec2(x, y));
                this._particleGroup.addParticles(newP);

                if (row == 1) this._surface.push(newP)
            }
        }
        console.log(this._surface)
        //两极静止领域
        this._particleGroup.freezeRow(0);
    }


    _waves: Wave[] = []
    creatWave(waveInfo: IWaveInfo) {
        const wave = new Wave(waveInfo)
        this._waves.push(wave)
    }
    updateWaves() {
        this._waves = this._waves.filter((w) => w.t < Wave.SHAKE_TIME)
    }

    getWaveHeightOfParticle(particle: vParticle): number {
        let height: number = 0
        this._waves.forEach((w) => {
            const dis = Vec2.distance(w.pos, particle.pos)
            // console.log('particle pos', particle.pos)
            // console.log('wave origin', w.pos)
            // console.log('dis ', dis)
            height += w.getHeightAt(dis)
        })

        return height
    }

    updateSurface() {
        this._surface.forEach((p) => {
            const h = this.getWaveHeightOfParticle(p)
            p.pos.y = 512 + h
        })
    }
    //debug
    private draw() {
        this.g?.clear();
        this.drawVerts();
    }

    private drawVerts() {
        this.g.fillColor = Color.BLUE;
        this._verts.forEach((vert) => {
            const { x, y } = vert;
            this.g.circle(x, y, 4);
        });
        this.g.fill();
    }


}
