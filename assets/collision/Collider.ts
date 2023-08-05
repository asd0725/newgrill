import { cBody } from "./Body";
import { Dirty, Trigger, cObject } from "./Object";
import { ShapeSupport } from "./Shape";



export class cCollider {

    //body 缓存池
    private id: number = 0;
    private pools: Array<cBody> = [];

    //collider 全局单例
    private static _inst: cCollider = null;
    static get inst() {
        if (this._inst == null) {
            this._inst = new cCollider();
        }
        return this._inst;
    }

    private axis: number = -1;
    private frameID: number = 0;
    private bodys: Array<cBody> = [];
    private isDirty: boolean = false;
    private pairs: Map<number, any> = new Map();


    // 创建 body
    create(obj: cObject) {

        let body = this.pools.pop();
        if (!body) {
            body = new cBody(obj);
            body.id = this.id++;
            return body;
        }

        body.object = obj;
        return body;
    }


  
      //插入 body, force 强制更新数据
      insert(body: cBody, force: boolean = false) {

        if (!body) return;

        if (!body.inCollider) {
            //不在列表,重新插入
            this.bodys.push(body);
            body.inCollider = true;
        }

        //复位状态
        body.isRemove = false;
        body.isRetrieve = false;

        //强制刷新body数据
        if (force && body.object) {
            body.object.isDirty = Dirty.RTS;
        }
    }

    //删除 body: 提前标记删除 ，retrieve: 是否回收body
    remove(body: cBody, retrieve: boolean = false) {

        if (!body) return;
        
        //标记移除body, 
        body.isRemove = true; //下一帧update中执行移除
        body.isRetrieve = retrieve; //是否回收复用body?
    }

    reset() { //重置回收bodys

        this.axis = -1;
        this.frameID = 0;
        this.isDirty = true;

        //回收bodys
        let bodys = this.bodys;
        for (let i = bodys.length - 1; i >= 0; i--) {
            let body = bodys[i];
            this.pools.push(body);
            body.clear();
        }
        bodys.length = 0;

    }

    clear() { //退出释放bodys

        this.id = 0;
        this.axis = -1;
        this.frameID = 0;
        this.isDirty = true;
        this.pools.length = 0;

        //清空bodys
        let bodys = this.bodys;
        for (let i = bodys.length - 1; i >= 0; i--) {
            bodys[i].clear();
        }
        bodys.length = 0;
    }


    update(dt: number) {
        this.reBuild();
        this.triggers();
    }

    //相交碰撞测试
    private triggers(): void { //resultCB: (a: Body, b: Body) => void

        let axis = this.axis,
            n = (axis >> 2) & 0x3,
            m = (axis >> 4) & 0x3;


        let pairs = this.pairs;
        let bodys = this.bodys;
        let frameID = ++this.frameID;
        let i = 0, j = 0, N = bodys.length;
        for (i = 0; i < N; i++) {

            let bi = bodys[i];
            if (bi.isRemove) continue;

            let A = bi.aabb,
                an = A[n],
                am = A[m],
                mask = bi.mask,
                group = bi.group,
                upper = bi.upper,
                objA = bi.object;

            for (j = i + 1; j < N; j++) {

                let bj = bodys[j];
                if (bj.isRemove) continue;

                if (upper <= bj.lower) {
                    break;
                }

                let B = bj.aabb, objB = bj.object;
                let a2b = mask & bj.group, b2a = bj.mask & group;

                //掩码分组过滤  和 AABB 剔除
                if ((a2b || b2a) && !(an > B[n + 3] || B[n] > A[n + 3] || am > B[m + 3] || B[m] > A[m + 3])) {

                    //形状精确碰撞检测
                    let at = objA.shape.type;
                    let bt = objB.shape.type;
                    if (at > bt) {
                        if (!ShapeSupport[bt | at](bj, bi))
                            continue; //没有发生精确碰撞
                    } else {
                        if (!ShapeSupport[at | bt](bi, bj))
                            continue; //没有发生精确碰撞
                    }

                    let trigger = 0,
                        aid = bi.id, bid = bj.id,
                        id = aid < bid ? aid << 16 | bid : bid << 16 | aid;

                    let data = pairs.get(id);
                    if (data != undefined) {
                        trigger = Trigger.stay;
                        data.frameID = frameID;
                    } else {
                        trigger = Trigger.enter;
                        pairs.set(id, { key: id, a: bi, b: bj, frameID: frameID });
                    }

                    //trigger 回调
                    if (a2b && objA.trigger && !bi.isRemove) {
                        objA.onTrigger(bj, trigger);
                    }

                    if (b2a && objB.trigger && !bj.isRemove) {
                        objB.onTrigger(bi, trigger);
                    }
                }
            }
        }

        let deletes = [];
        let length = pairs.size;
        let entries = pairs.values();
        for (i = 0; i < length; i++) {
            let value = entries.next().value;
            if (value.frameID != frameID) {

                let bi = value.a;
                let bj = value.b;
                let objA = bi.object;
                let objB = bj.object;

                if(objA && !bi.isRemove)
                    objA.onTrigger(bj, Trigger.exit);
                
                if(objB && !bj.isRemove)
                    objB.onTrigger(bi, Trigger.exit);
            
                deletes.push(value.key);
            }
        }

        length = deletes.length;
        for (let i = 0; i < length; i++) {
            pairs.delete(deletes[i]);
        }
        deletes.length = 0;

    }


    private reBuild(): void {

        let change = false;
        let axis = this.preBuildAxis();
        if ((axis & 0x3) != (this.axis & 0x3) || this.axis < 0) {
            this.axis = axis;
            change = true;
        }

        if (change || this.isDirty) {

            this.isDirty = false;

            let bodys = this.bodys;
            axis = this.axis & 0x3;
            for (let i = 0, N = bodys.length; i !== N; i++) {
                let bi = bodys[i];
                let aabb = bi.aabb;
                bi.lower = aabb[axis];
                bi.upper = aabb[axis + 3];
            }

            if (!change)
                this.sort(bodys);
            else
                bodys.sort((a: cBody, b: cBody) => a.lower - b.lower);

        }
    }


    private sort(a: Array<cBody>): void {

        let i = 0, j = 0, l = 0;
        for (i = 1, l = a.length; i < l; i++) {
            let v = a[i];
            let lower = v.lower;
            for (j = i - 1; j >= 0; j--) {
                let w = a[j];
                if (w.lower <= lower) {
                    break;
                }
                a[j + 1] = w;
            }

            if (j + 1 != i) {
                a[j + 1] = v;
            }
        }
    }


    private preBuildAxis(): number {

        let axis = 0,
            sumX = 0, sumX2 = 0,
            sumY = 0, sumY2 = 0,
            sumZ = 0, sumZ2 = 0,
            x = 0.0, y = 0.0, z = 0.0;

        let bodys = this.bodys;
        let N = bodys.length;

        let length = 0;
        let isDirty = false;
        for (let i = 0; i < N; i++) {

            let body = bodys[i];

            //删除body
            if (body.isRemove) {
                //是否回收body
                if (body.isRetrieve) {
                    this.pools.push(body);
                    body.clear();
                }
                //已从collider移除
                body.inCollider = false;
                continue;
            }

            //调整后面body位置
            if ((++length) <= i) {
                bodys[length - 1] = body;
            }

            //更新同步body的AABB数据
            if (body.updateBound()) isDirty = true;

            let s = body.aabb,
                sx = (s[3] - s[0]),
                sy = (s[4] - s[1]),
                sz = (s[5] - s[2]);
            x += sx * sx, y += sy * sy; z += sz * sz;

            let cX = (s[3] + s[0]) * 0.5;
            sumX += cX, sumX2 += cX * cX;

            let cY = (s[4] + s[1]) * 0.5;
            sumY += cY, sumY2 += cY * cY;

            let cZ = (s[5] + s[2]) * 0.5;
            sumZ += cZ, sumZ2 += cZ * cZ;
        }

        //更新body当前长度
        this.bodys.length = length;

        //body位置发生更新
        this.isDirty = isDirty;

        //计算评估新的 axis
        let invN = 1.0 / length;
        x = x > 0 ? length / x : 0;
        y = y > 0 ? length / y : 0;
        z = z > 0 ? length / z : 0;

        let X = (sumX2 - sumX * sumX * invN) * x;
        let Y = (sumY2 - sumY * sumY * invN) * y;
        let Z = (sumZ2 - sumZ * sumZ * invN) * z;

        if (X == 0) X = x; if (Y == 0) Y = y; if (Z == 0) Z = z;

        if (X > Y) {
            if (X > Z) {
                axis = 0;
                axis |= (Y > Z ? (1 << 2) | (2 << 4) : (1 << 4) | (2 << 2));//yz:zy;
            } else {
                axis = 2;
                axis |= (X > Y ? (0 << 2) | (1 << 4) : (0 << 4) | (1 << 2));//xy:yx;
            }
        } else if (Y > Z) {
            axis = 1;
            axis |= (X > Z ? (0 << 2) | (2 << 4) : (0 << 4) | (2 << 2));//xz:zx;
        } else {
            axis = 2;
            axis |= (X > Y ? (0 << 2) | (1 << 4) : (0 << 4) | (1 << 2));//xy:yx;
        }


        return axis;
    }

}

