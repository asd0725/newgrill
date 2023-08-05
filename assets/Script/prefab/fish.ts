// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cBody } from "../../collision/Body";
import { Trigger, cObject } from "../../collision/Object";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Fish extends cObject {


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    //缓存池管理
    static pools: Array<Fish> = [];
    static get(prefab: cc.Prefab) {
        let ghost = this.pools.pop();
        if (!ghost) {
            let node = cc.instantiate(prefab);
            ghost = node.getComponent(Fish);
        }

        return ghost;
    }

    static put(ghost: Fish) {
        //压入缓存池管理节点
        this.pools.push(ghost);
        //移除node不回收body
        ghost.remove(false);
    }


    start () {

    }


    onTrigger(b: cBody,trigger:Trigger) {
        if(trigger == Trigger.exit) return;


        //碰撞自我加收
        Fish.put(this);

        //播放死亡特效
        //.........
    }

    // update (dt) {}
}
