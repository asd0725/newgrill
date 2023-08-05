import { Dirty, cObject } from "./Object";
import { cShape } from "./Shape";

const Mat3 = cc.Mat3;
const Quat = cc.Quat;
const Vec3 = cc.Vec3;

const IsIdentity = function (quat: cc.Quat) {

    if (quat.x != 0 ||
        quat.y != 0 ||
        quat.z != 0 ||
        quat.w != 1)
        return false;

    return true;
}


export class cBody {

    id: number = 0;
    mask: number = 0;
    group: number = 0;
    shape: cShape = null;
    object: cObject = null;

    //脏区更新标记
    isDirty: number = 1|2|4;


    //缓存
    lower: number = 0;
    upper: number = 0;
    aabb: Array<number> = [0, 0, 0, 0, 0, 0];

    //状态
    isRemove: boolean = false;
    isRetrieve: boolean = false;
    isIdentity: boolean = false;
    inCollider: boolean = false;

    //缓存
    raidus: number = 0;
    center: cc.Vec3 = new Vec3();
    rotMat3: cc.Mat3 = new Mat3();
    halfSize: cc.Vec3 = new Vec3();

    constructor(obj: cObject) {
        this.object = obj;
    }

    updateBound(force: Dirty = Dirty.NON) {

        let object = this.object; //force 强制全局刷新
        let isDirty = force|object.isDirty;

        if (isDirty > 0) {

            const shape = this.shape;
            if (isDirty & Dirty.R) {
                //旋转更新aabb
                this.isIdentity = IsIdentity(this.getRotation());
                shape.updateAABB(this.getRotMat3(), this.isIdentity);
            }

            const AABB = this.aabb;// world aabb
            const aabb = shape.aabb; //local aabb
            const s = this.getScale(); //world scale
            const p = this.getPosition(); //world postion

            //兼容负放大倍数Math.abs(scale)
            const sx = s.x >= 0 ? s.x : -s.x;
            const sy = s.y >= 0 ? s.y : -s.y;
            const sz = s.z >= 0 ? s.z : -s.z;

            AABB[0] = aabb[0] * sx + p.x;
            AABB[1] = aabb[1] * sy + p.y;
            AABB[2] = aabb[2] * sz + p.z;

            AABB[3] = aabb[3] * sx + p.x;
            AABB[4] = aabb[4] * sy + p.y;
            AABB[5] = aabb[5] * sz + p.z;


            object.isDirty = Dirty.NON; //object 脏区清空
            this.isDirty = 1|2|4; //body 脏区标记

            return true;
        }

        return false;
    }

    clear() {

        // this.id = 0;
        this.shape = null;
        this.object.body = null;
        this.object = null;
        this.inCollider = false;
        this.isRemove = false;

    }


    //body 坐标统一使用世界数据进行计算
    getScale() { return this.object.worldScale; } // world scale 
    getPosition() { return this.object.worldPosition; } //wold position
    getRotation() { return this.object.worldRotation; } //world rotation quat


    getRotMat3() {
        //world rotate mat3
        //return this.rotMat3;
        return this.object.worldRotatioMat3;
    }

    getCenter() {

        if (this.isDirty & 1) {
            this.isDirty &= (~1);

            const aabb = this.aabb;
            const center = this.center;
            center.x = (aabb[0] + aabb[3]) * 0.5;
            center.y = (aabb[1] + aabb[4]) * 0.5;
            center.z = (aabb[2] + aabb[5]) * 0.5;
        }

        return this.center; //world center
    }

    getRaidus() {

        if (this.isDirty & 2) {
            this.isDirty &= (~2);

            //兼容负放大倍数
            const s = this.getScale();
            const sx = s.x >= 0 ? s.x : -s.x;
            const sy = s.y >= 0 ? s.y : -s.y;
            const sz = s.z >= 0 ? s.z : -s.z;

            const raidus = this.shape.radius;
            const scale = Math.max(sx, sy, sz);
            this.raidus = scale * raidus;
        }

        return this.raidus; //world raidus
    }

    getHalfSize() {

        if (this.isDirty & 4) {
            this.isDirty &= (~4);

            //兼容负放大倍数
            const s = this.getScale();
            const sx = s.x >= 0 ? s.x : -s.x;
            const sy = s.y >= 0 ? s.y : -s.y;
            const sz = s.z >= 0 ? s.z : -s.z;

            const world = this.halfSize;
            const local = this.shape.halfSize;

            world.x = sx * local.x;
            world.y = sy * local.y;
            world.z = sz * local.z;
        }

        return this.halfSize; //world halfsize
    }
}
