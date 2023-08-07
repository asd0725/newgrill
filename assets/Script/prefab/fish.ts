// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cBody } from "../../collision/Body";
import { Trigger, cObject } from "../../collision/Object";
import EngineUtil from "../util/EngineUtil";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Fish extends cObject {


    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.schedule(()=>{
            this.updatePos()
        },1)
        this.updatePos()
    }
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


    private updatePos(){
        let pos_x = EngineUtil.getRandomNum(-200,200)
        let pos_y = EngineUtil.getRandomNum(-200,200)
        cc.tween(this.node).by(1,{x:pos_x,y:pos_y}).start()
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
