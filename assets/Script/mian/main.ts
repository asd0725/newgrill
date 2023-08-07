// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cObject } from "../../collision/Object";
import Fish from "../prefab/fish";
import EngineUtil from "../util/EngineUtil";

const {ccclass, property} = cc._decorator;
const tempPos = new cc.Vec3();
@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    objects: cc.Node = null; //enemy 显示挂载点

    @property(cc.Integer)
    max: number = 20; //多敌人同屏数

    @property
    cyclTime: number = 0.03; //刷怪cd周期

    // LIFE-CYCLE CALLBACKS:

    @property(cc.Prefab)
    private fishPre : cc.Prefab = null

    // onLoad () {}

    start () {
        const phi2 = 1.3247179572447458;
        const a1 = 1.0 / (phi2 * phi2);
        const a2 = 1.0 / phi2;

        //定时刷怪
        let i = 1;
        this.schedule(() => {

            if (this.objects.children.length < this.max) {
                // let x = (0.5 + a2 * i) % 1;
                // let y = (0.5 + a1 * i) % 1;
                this.createEnemy();
                i++;
            }

        }, this.cyclTime);
    }

    createEnemy() {

        let enemy: cObject = null;

        //随机产生两种
        if (Math.random() > 0.05){
            enemy = Fish.get(this.fishPre);
        }

        enemy.insert(this.objects);


        //以主角为中心进行刷怪
        // let center = Player.inst.getPosition();
        // tempPos.x = (x - 0.5) * this.raidus + center.x;
        // tempPos.y = (y - 0.5) * this.raidus + center.y;
        // tempPos.z = 0; //更新位置
        let pos_x = EngineUtil.getRandomNum(-100,100)
        let pos_y = EngineUtil.getRandomNum(-100,100)
        tempPos.x = pos_x
        tempPos.y = pos_y
        tempPos.z = 0
        enemy.setPosition(tempPos);

        enemy.init(); //初始化
    }

    // update (dt) {}
}
