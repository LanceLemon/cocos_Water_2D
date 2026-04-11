import { _decorator, BoxCollider2D, Collider2D, Component, Contact2DType, Node, RigidBody2D, IPhysics2DContact, UITransform, Vec3, Vec2, clamp } from 'cc';
import { WaterRender } from './WaterRender';
import { IWaveInfo } from './Wave';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('WaterCollider')
@requireComponent([RigidBody2D, BoxCollider2D, UITransform, WaterRender])
export class WaterCollider extends Component {
    rigid: RigidBody2D
    collider: BoxCollider2D
    transform: UITransform
    render: WaterRender
    protected onLoad(): void {
        this.rigid = this.node.getComponent(RigidBody2D)
        this.collider = this.node.getComponent(BoxCollider2D)
        this.transform = this.node.getComponent(UITransform)
        this.render = this.node.getComponent(WaterRender)
    }

    protected onEnable(): void {
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this)
        this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this)
        console.log('water aabb', this.collider.worldAABB)
    }

    protected onDisable(): void {
        this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this)
    }

    _flotage: Set<BoxCollider2D> = new Set()
    addFlotage(collider: BoxCollider2D) {
        this._flotage.add(collider)
        // collider.body.linearDamping = 0.5
        // collider.body.angularDamping = 0.8
    }
    deleteFlotage(collider: BoxCollider2D) {
        this._flotage.delete(collider)
    }
    onBeginContact(selfCollider: BoxCollider2D, otherCollider: BoxCollider2D, contact: IPhysics2DContact) {
        this.addFlotage(otherCollider)
        otherCollider.worldPoints.forEach((p) => {
            this.creatWaveAt(p, otherCollider)
        })
    }
    onEndContact(selfCollider: BoxCollider2D, otherCollider: BoxCollider2D, contact: IPhysics2DContact) {
        this.deleteFlotage(otherCollider)
    }

    protected update(dt: number): void {
        this._flotage.forEach((f) => {
            if (f == null || f == undefined) return

            f.worldPoints.forEach((p) => {
                this.applyFloatForceAt(p, f);
                this.creatWaveAt(p, f);
            })

        })
    }

    _tempLinearVelocity: Vec2 = new Vec2()
    private creatWaveAt(p: Readonly<Vec2>, f: BoxCollider2D) {
        f.body.getLinearVelocityFromWorldPoint(p, this._tempLinearVelocity);
        const velocity_Y: number = this._tempLinearVelocity.y

        if (Math.abs(velocity_Y) < 10) return

        // const V = f.worldAABB.size.height * f.worldAABB.size.width
        const waveLength = clamp(2 * Math.abs(velocity_Y), 10, 640)
        const amplitude = 0.0625 * -velocity_Y
        const waveInfo: IWaveInfo = {
            waveLength: waveLength,
            amplitude: amplitude,
            frequency: 1,
            phase: 0,
            pos: this._tempPos
        };


        this.render.creatWave(waveInfo);
    }

    _tempV3: Vec3 = new Vec3()
    _tempImpulse: Vec2 = new Vec2()
    _tempPos: Vec2 = new Vec2()
    private applyFloatForceAt(p: Readonly<Vec2>, flotage: BoxCollider2D) {
        this._tempV3.set(p.x, p.y);
        this.transform.convertToNodeSpaceAR(this._tempV3, this._tempV3);
        this._tempPos.set(this._tempV3.x, this._tempV3.y);
        const floatForce = this.getFloatForceAt(this._tempV3);
        this._tempImpulse.set(0, floatForce);
        flotage.body.applyLinearImpulse(this._tempImpulse, p, true)
    }

    getDepthAt(localPos: Vec3): number {
        return this.collider.worldAABB.height - localPos.y
    }

    getFloatForceAt(localPos: Vec3): number {
        const depth = this.getDepthAt(localPos)
        if (depth < 0) return 0

        const force = this.collider.density * this.rigid.gravityScale * depth
        return force
    }
}

