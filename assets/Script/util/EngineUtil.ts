import PageMgr from "../../View/PageMgr"
import PlayerDataSys from "../controller/PlayerDataSys"
import SystemDataSys from "../controller/SystemDataSys"
import PlayerDataMgr from "../data/PlayerDataMgr"
import { GAME_NAME } from "../SystemConfig"
import { MathUtils } from "./MathUtil"

/**
 * 
 * 
 *  工具类
 * 
 */
class EngineUtil {

    private static _isntance: EngineUtil

    public static _getInstance(): EngineUtil {
        if (!EngineUtil._isntance) EngineUtil._isntance = new EngineUtil()
        return EngineUtil._isntance
    }
    public localStorageGetItem(key: string, defaultValue: any) {
        var value = cc.sys.localStorage.getItem(key)
        if (!value || value == "" || value == undefined || value == "nan") {
            return defaultValue
        }
        return value
    }
    public localStorageSetItem(key: string, value: string) {
        cc.sys.localStorage.setItem(key, value)
    }

    // 游戏内吐司
    private toastContent: string = ''
    //颜色
    private color: cc.Color = new cc.Color()

    /**
     * 
     * @param hexStr 色值
     */
    getColor(hexStr: string): cc.Color {
        if (!hexStr.includes('#')) hexStr = '#' + hexStr
        return this.color.fromHEX(hexStr)
    }
    /**
     * 整合log release版本return
     * @param data 
     */
    log(...data: any[]) {
        if (SystemDataSys.online_release) {
            return
        }
        if (cc.sys.isNative) {
            try {
                console.log(GAME_NAME, JSON.stringify(data))
            } catch (error) {
                console.error(GAME_NAME, error)
            }
            return
        }
        console.log(GAME_NAME, data)
    }
    error(...data: any[]) {
        if (SystemDataSys.online_release) {
            return
        }
        if (cc.sys.isNative) {
            try {
                console.error(GAME_NAME, JSON.stringify(data))
            } catch (error) {
                console.error(GAME_NAME, error)
            }
            return
        }
        console.error(GAME_NAME, data)
    }
    //本地存储
    setLocalData(name: string, value: string) {
        cc.sys.localStorage.setItem(name, value)
    }
    //获取本地存储
    getLocalData(name: string): string {
        return cc.sys.localStorage.getItem(name) || ''
    }
    //获取随机唯一id
    getRandId() {
        const res = Number(Math.random().toString().substr(3, 3) + Date.now()).toString(36)
        return res
    }
    //获取时间戳
    getTimeStamp() {
        return Math.floor(Date.now() / 1000)
    }

    public destroyNode(node) {
        if (!cc.isValid(node)) {
            console.error("Tools: destroyNode error, param is invalid");
            return;
        }
        node.removeFromParent(false);
        node.destroy();
    }

    /**
     * 
     * 获取是否是全面屏 根据宽高比例
     * true 全面屏
     */
    isLargeScreen(): boolean {
        const per = cc.winSize.height / cc.winSize.width
        return Number(per.toFixed(2)) > 2
    }

    //屏幕适配
    getScreenYOffset(){
        if( this.isLargeScreen() ){
            return 40;
        }
        return 0;
    }

    /**
     * 
     * 获取元素距离底部的距离
     * 
     */
    getBottomPosY() {
        let y = -cc.winSize.height / 2
        if (this.isLargeScreen()) y += 30
        return y
    }
    /**
     * 
     * 获取元素距顶部的距离
     * 
     */
    getTopPosY() {
        let y = cc.winSize.height / 2
        if (this.isLargeScreen()) y -= 65
        return y
    }
    //加载远程资源
    loadRemoteAsset(url: string) {
        return new Promise((resolve, reject) => {
            cc.assetManager.loadRemote(url, (e, res: cc.Asset) => {
                if (e) {
                    console.error(`加载远程资源错误url:${url}`, e)
                    reject()
                    return;
                }
                resolve(res)
            })
        })
    }
    //加载远程图片
    loadRemoteImg(url: string) {
        return new Promise((resolve, reject) => {
            cc.assetManager.loadRemote(url, { ext: '.png' }, (e, res: cc.Asset) => {
                if (e) {
                    console.error(`加载远程图片资源错误url:${url}`, e)
                    reject()
                    return;
                }
                resolve(res)
            })
        })
    }
    //加载resource资源
    loadResourceAsset(url: string): Promise<cc.Asset | null> {
        return new Promise((resolve, reject) => {
            cc.resources.load(url, (e, res: cc.Asset) => {
                if (e) {
                    console.error(`加载resource错误url:${url}`, e)
                    reject(e)
                    return;
                }
                resolve(res)
            })
        })
    }
    //秒数 to 00:00
    formatTime(seconds: number) {
        let min: any = Math.floor((seconds / 60) << 0)
        let sec: any = Math.floor(seconds % 60)
        if (min < 10) min = '0' + min
        if (sec < 10) sec = '0' + sec
        return `${min}:${sec}`
    }
    //时间戳 to YYYY-MM-DD
    /**
     * 
     * @param timestamp 时间戳
     * @param del 分隔符
     */
    formatDate(timestamp: number, del: string = `-`) {
        const date = new Date(timestamp)
        const year = date.getFullYear()
        const mon = date.getMonth() + 1
        const day = date.getDate()
        return `${year}${del}${mon}${del}${day}`
    }
    /**
     * 获取随机数,包含下限值和上限值
     * @param min 
     * @param max 
     * @returns 
     */
    getRandomNum(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }
    /**
    * 获取随机数,包含下限值，不包括上限值
    * @param min
    * @param max
    * @returns
    */
    getRandomNumber(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    //获取进度条宽度
    getProgressWidth(persent: number, min: number, max: number): { width: number, persent: number } {
        let width = persent < 0.5 ? Math.ceil(persent * max) : Math.floor(persent * max);
        if (width != 0 && width < min) width = min
        if (width > max) width = max
        let num = Math.floor(persent * 100)
        if (isNaN(num)) num = 1
        return { width, persent: num }
    }
    //获取以目标点为圆心某个半径上的位置 R半径 angle:角度
    getPosByRot(R: number, angle: number): cc.Vec2 {
        var x = R * Math.cos(2 * Math.PI / 360 * (90 - angle))
        var y = R * Math.sin(2 * Math.PI / 360 * (90 - angle))
        return cc.v2(x, y)
    }

    /**查找节点*/
    GetChildByName(obj, name, bRecursive) {
        let node = obj.node ? obj.node : obj;
        let child = null;
        if (node && name) {
            child = node.getChildByName(name);
            if (bRecursive) {
                if (!child) {
                    let children = node.children;
                    let childrenCount = node.childrenCount;
                    for (let i = 0; i < childrenCount; ++i) {
                        child = this.GetChildByName(children[i], name, bRecursive);
                        if (child) {
                            break;
                        }
                    }
                }
            }
        }
        return child;
    }


    private currSeed: number = new Date().getTime();;
    /**随机数 包含min 不包含max*/
    range(min: number, max: number) {
        max = max || 1;
        min = min || 0;
        // this.currSeed = new Date().getTime();
        this.currSeed = (this.currSeed * 9301 + 49297) % 233280;
        let rnd = this.currSeed / 233280.0;
        let tmp = min + rnd * (max - min);
        return parseInt(tmp.toString())
    }


    /**转换坐标 */
    public convertNodePosition(node1: cc.Node, node2: cc.Node) {
        if (node1 && node1.parent && node2 && node2.parent) {
            return node1.parent.convertToNodeSpaceAR(node2.parent.convertToWorldSpaceAR(node2.position))
        }
    }
    /**
    * 获取A相对B的局部坐标
    * @param {*} nodeA 
    * @param {*} nodeB 
    */
    public getNodeAToNodeBPoint(nodeA: cc.Node, nodeB: cc.Node) {
        if (nodeA && nodeB && nodeB.parent) {
            var nodeAWorldPoint = nodeA.convertToWorldSpaceAR(cc.Vec2.ZERO);
            var AToBPos = nodeB.parent.convertToNodeSpaceAR(nodeAWorldPoint);
            return { x: AToBPos.x, y: AToBPos.y};   
        } 
        return { x: 0, y: 0};
    }

    /**
    * 
    * @param vWeight 权重的数组：例如【1,1,1,1,1】
    * @returns //注意：返回的为权重数组下标
    */
    GetPrize(vWeight: number[]): number {
        //计算权重之和  prev 是前一次累加后的数值，currVal 是本次待加的数值
        let weightSum = vWeight.reduce((prev, currVal) => {
            return prev + currVal;
        }, 0);
        let random = Math.ceil(Math.random() * weightSum);
        // console.log("random ---->" + random);
        let count = 0;
        for (let i = 0; i < vWeight.length; i++) {
            count += vWeight[i];
            if (random <= count) {
                return i;
            }
        }
    }

    private manageToast: cc.Prefab = null;
    private manageShows: number = 0;
    public showManageViewToast(text: string = '', toastTime: number = 0.8, overlap: boolean = true, pos:cc.Vec3=cc.v3()) {
        if (!text) { return }
        if (this.manageShows > 0 && !overlap) { return }
        if (this.manageToast) {
            const manageToast = cc.instantiate(this.manageToast);
            PageMgr.setToastNode(manageToast);
            manageToast.position = pos;
            const content = manageToast.getChildByName('content');
            const textLbl = content.getChildByName('text').getComponent(cc.Label);
            textLbl.string = text;
            manageToast.zIndex = 999;
            this.manageShows++;
            manageToast.runAction(cc.sequence(cc.moveBy(toastTime, 0, 100), cc.delayTime(1), cc.fadeOut(0.3), cc.callFunc(() => {
                manageToast.parent = null;
                manageToast.destroy();
                this.manageShows--;
            })))
        } else {
            cc.loader.loadRes('prefabs/ManageToast', cc.Prefab, (err, pre) => {
                if (err) { return }
                this.manageToast = pre;
                this.showManageViewToast(text, toastTime, overlap, pos);
            })
        }
    }

    /** 生成n个[min, max)之间的不重复的随机整数 */
    randomsInt(min: number, max: number, n: number) {
        if (n > max - min) {
            n = max - min;
        }
        let arr: number[] = Array.from({ length: max - min }, (v, k) => k + min);// arr = [min, max];
        for (let i = 0; i < n; i++) {// 洗牌算法(随机乱置算法), 仅打乱[0, n);
            let j = Math.floor(Math.random() * (arr.length - i) + i);// j = [i, arr.length)之间的随机整数
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        arr.length = n;// 取前n项
        return arr;
    }

    /**打乱数组顺序 */
    shuffle(arr) {
        let i: number = arr.length;
        while (i) {
            let j: number = Math.floor(Math.random() * i--);
            [arr[j], arr[i]] = [arr[i], arr[j]];
        }
        return arr;
    }

    /**截取玩家昵称 */
    subUserName(nickName: string, length: number = 8) {
        if (nickName != "" && nickName.length > length) {
            return nickName.substring(0, length);
        }
        return nickName;
    }
    /**
 * 深拷贝
 * @param o1 新对象
 * @param o2 要ccopy的对象
 */
    deepClone(o1, o2) {
        for (let k in o2) {
            if (typeof o2[k] === 'object') {
                o1[k] = {};
                this.deepClone(o1[k], o2[k]);
            } else {
                o1[k] = o2[k];
            }
        }
    }
    /**
     * 随机从数组中取出几个元素
     * @param arr 
     * @param count 
     * @returns 
     */
    getRandomArrayElements(arr: any[], count: number) {
        if (count > arr.length) {
            console.error('数量大于数组数');
            return arr;
        }
        if (count = arr.length) {
            return arr;
        }
        var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
        while (i-- > min) {
            index = Math.floor((i + 1) * Math.random());
            temp = shuffled[index];
            shuffled[index] = shuffled[i];
            shuffled[i] = temp;
        }
        return shuffled.slice(min);
    }

    getRandomArrayElements2(arr, length) {
        if (length > arr.length) {
            console.error('数量大于数组数');
            return arr;
        }
        var newArr = []; // 组成的新数组初始化
        for (var i = 0; i < length; i++) {
            var index = Math.floor(Math.random() * arr.length);
            var item = arr[index];
            newArr.push(item)
            arr.splice(index, 1)
        }
        return newArr.reverse()
    }
    /**数组打乱顺序2 */
    shuffleArr2(arr) {
        let new_arr = arr.map(i => ({ v: i, r: Math.random() }));
        new_arr.sort((a, b) => a.r - b.r);
        arr.splice(0, arr.length, ...new_arr.map(i => i.v));
        return arr;
    }

    //获取红包币现金数量(用来显示的)
    public getCashBalance(cash_balance?: number): string {

        if (cash_balance == 0) {
            return cash_balance.toString();
        }
        // if (!cash_balance) cash_balance = PlayerDataSys.cash_balance;

        let num = Math.floor(cash_balance * 100);
        let cashNum = num / 100 / 100;
        let _iNum = parseInt(cashNum.toString());
        let str_iNum = _iNum.toString();
        let _dNum = parseInt((MathUtils.getInstance().accMul(cashNum, 100) - _iNum * 100).toString());
        let str_dNum = _dNum.toString();
        if (str_dNum.length == 1) {
            str_dNum = '0' + str_dNum;
        }
        if (str_dNum == '00') {
            return str_iNum;
        }
        //例如：0.90 显示 0.9
        if (str_dNum.length == 2) {
            //最后一位是0特殊处理
            if (str_dNum[1] == "0") {
                str_dNum  = str_dNum[0];
            }
        }
        return str_iNum + `.` + str_dNum;
    }

    public static thousandsNum(num: string, spacer: string = '.') {
        var result = '', counter = 0;
        num = (num || 0).toString();
        for (var i = num.length - 1; i >= 0; i--) {
            counter++;
            result = num.charAt(i) + result;
            if (!(counter % 3) && i != 0) { result = spacer + result; }
        }
        return result;
    }

    //加载本地json文件
    public addLocalJson(path, callback) {
        cc.loader.loadRes(path, function (err, res) {
            if (err) {
                console.log("addLocalJson=====", err);
                return;
            }
            if (res) {
                let json = res.json;
                callback && callback(json);
            }
        })
    }

    //播放骨骼动画
    public playSpine(spine, animName, loop, callback?: Function) {
        if (!spine) {
            cc.error("spine不存在======");
            return;
        }
        if (!animName) {
            cc.error("动画名称不存在======");
            return;
        }
        let track = spine.setAnimation(0, animName, loop);
        if (track) {
            spine.setCompleteListener((trackEntry, loopCount) => {
                callback && callback();
            });
        } else { 
            cc.error('动画不存在======"', animName)
        }
    }

    /**
     * 保留小数n位，不进行四舍五入
     * num你传递过来的数字
     * decimal你保留的几位,默认保留小数后两位
     */

    formatDecimal(num, decimal = 2) {
        num = num.toString();
        const index = num.indexOf('.');
        if (index !== -1) {
            num = num.substring(0, decimal + index + 1);
        } else {
            num = num.substring(0);
        }
        //截取后保留两位小数
        return parseFloat(num).toFixed(decimal);
    }

    typingAni(label: cc.RichText, str: string, interval: number,callback) {
        const regex = /<.+?\/?>/g; // 匹配尖括号标签
        const matchArr = str.match(regex);
        const specialChar = "│";
        const replaceStr = str.replace(regex, specialChar); // 标签数组
        const textArr: string[] = replaceStr.split(specialChar); // 文字数组
        const strArr: string[] = []; // 存放处理过的文字数组
        let paraNum = 0; // 待替换参数个数
        for (let text of textArr) {
            // 非空字符替换成类似 $[0-n] 参数
            if (text !== "") {
                text = `$[${paraNum}]`;
                paraNum += 1;
            }
            strArr.push(text);
        }
        let templetStr: string = strArr.join(specialChar); // 数组转成待替换字符串
        for (let index = 0; index < textArr.length; index++) {
            // 转换代替换字符串之后, 删除文字数组多余空字符
            if (textArr[index] === "") {
                textArr.splice(index, 1);
                index = index - 1;
            }
        }
        while (templetStr.search(specialChar) !== -1) {
            // 数组转成的字符串原本 '特殊字符' 位置都是富文本标签的位置, 替换回标签
            if (matchArr[0]) {
                templetStr = templetStr.replace(specialChar, matchArr[0].toString());
                matchArr.splice(0, 1);
            } else {
                templetStr = templetStr.replace(specialChar,             "");// 空字符串替换,防止死循环
                console.warn("matchArr not enough");
            }
        }
        const lastStrArr: string[] = []; // 转换后富文本数组
        const arrayParm: string[] = new Array(paraNum).fill(""); // 替换参数数组
        for (let i = 0; i < textArr.length; i++) {
            for (const text of textArr[i]) {
                arrayParm[i] = arrayParm[i] + text;
                let replaceStr1 = templetStr;
                for (let index = 0; index < paraNum; index++) {
                    replaceStr1 = replaceStr1.replace(`$[${index}]`, arrayParm[index]);
                }
                lastStrArr.push(replaceStr1);
            }
        }
        let lastStrIndex = 0;
        const func = () => {
            if (lastStrIndex >= lastStrArr.length) {
                callback && callback();
                //console.log("播放完了");
                return;
            }
            label.string = lastStrArr[lastStrIndex];
            lastStrIndex += 1;
            setTimeout(() => {
                func();
            }, interval);
        };
        setTimeout(() => {
            func();
        }, interval);
    }

    /**克隆(用于打印当时的引用的数据) */
    clone(obj) { 
        //是原生就return
        if (cc.sys.isNative) {
            return;
        }
        var o;  
        if (typeof obj == "object") {  
            if (obj === null) {  
                o = null;  
            } else {  
                if (obj instanceof Array) {  
                    o = [];  
                    for (var i = 0, len = obj.length; i < len; i++) {  
                        o.push(this.clone(obj[i]));  
                    }  
                } else {  
                    o = {};  
                    for (var j in obj) {  
                        o[j] = this.clone(obj[j]);  
                    }  
                }  
            }  
        } else {  
            o = obj;  
        }  
        return o;  
    }

    isEmpty(e) {
        switch (e) {
            case null:
            case undefined:
              return true;
            default:
              return false;
          }
    }

    //获取 场景 spine挂点
    generateAllNodes (skeleton: sp.Skeleton, index) {
        // 取得挂点工具
        let attachUtil = skeleton['attachUtil'];
        attachUtil.generateAllAttachedNodes();
        // 因为同名骨骼可能不止一个，所以需要返回数组
        if(attachUtil._attachedNodeArray){
            for(let i = 0; i < attachUtil._attachedNodeArray.length; i++){
                const info = attachUtil._attachedNodeArray[i];
                if(`ATTACHED_NODE:ui${index}` == info.name){
                    return info;
                }
            }
        }
        return null;
    }
}
export default EngineUtil._getInstance()