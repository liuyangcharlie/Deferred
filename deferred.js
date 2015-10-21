/*
    @description: Totally a copy. A copy of Deferred implementation from 《JavaScript框架设计》－司徒正美 with comments
    @author: liuyangcharlie
    @start: 09/28/2015
    @end:
*/

// demo中的输出函数，用来输入下面的调试信息
var outputDom = window.output || document.querySelector('#output');

function log (message) {
    console.log(message);
    var pDom = document.createElement('p');
    pDom.innerHTML = message;
    outputDom.appendChild(pDom);
}

// 一个Deferred对象的构造函数
var Deferred = function (canceller) {
    // “回调对儿”队列，用来存放一组回调，e.g.: [success, error]
    this.chain = [];
    // 获得一个Deferred对象在一次运行中一个唯一的id
    this.id = setTimeout("1");
    // 对象初始状态：未被触发(-1)。其他状态：触发成功(0)，触发失败(1)
    this.fired = -1;
    // 是否为暂停状态，0：暂停 1:
    this.paused = 0;
    //
    this.results = [null, null];
    // 传入参数或undefined
    this.canceller = canceller;
    //
    this.silentlyCancelled = false;
    this.chained = false;
};

/* [柯里化](https://zh.wikipedia.org/wiki/%E6%9F%AF%E9%87%8C%E5%8C%96)
    是把接受多个参数的函数变换成接受一个单一参数（最初函数的第一个参数）的函数，并且返回接受余下的参数而且返回结果的新函数的技术
*/
function curry(fn, scope, args) {
    return function () {
        var argv = [].concat.apply(args, arguments);
        return fn.apply(scope, argv);
    }
}

// 重写构造函数的prototype
Deferred.prototype = {
    // 返回对象当前状态，3种状态：未触发(-1)、触发成功(0)、触发失败(1)
    state: function () {
        if (this.fired === -1) {
            // －1：未触发
            // return 'unfired';
            return '未触发';
        } else if (this.fired === 0) {
            // 0：触发成功
            // return 'success';
            return '触发成功';
        } else {
            // return 'failed';
            return '触发失败';
        }
    },

    // 取消触发，类似于ajax的abort
    cancel: function (e) {
        if (this.fired === -1) {
            // 未触发状态时，可以取消触发，其他状态不可以
            if (this.canceller) {
                // 若传入取消的回调参数，则调用回调
                this.canceller(this);
                // 或可简写为：this.canceller && this.canceller(this);
            } else {
                // 没有传入参数，静默取消，只修改一个属性表明
                this.silentlyCancelled = true;
            }
            // ?????
            if (this.fired === -1) {
                if (!e instanceof Error) {
                    e = new Error(e + '');
                }
                this.errback(e);
            }
        } else if ((this.fired === 0) && (this.results[0] instanceof Deferred)) {
            // 若已触发成功，但这个Deferred对象的触发结果依然返回了一个Deferred对象，则仍然可以调用这个结果的取消函数(canceller)
            this.results[0].cancel(e);
        }
    },

    // 这里决定使用哪个队列
    _resback: function (res) {
        // 根据此Deferred对象的触发结果，选择调用onResolve还是onRejected，即执行成功回调还是失败回调
        // 先判断触发后的状态，触发成功(0)或触发失败(1)
        this.fired = ((res instanceof Error ) ? 1 : 0);
        // 根据状态把结果放在不同位置？
        this.results[this.fired] = res;
        if (this.paused === 0) {
            // 没有暂停？
            this._fire();
        }
    },

    // 判定是否触发过
    _check: function () {
        if (this.fired !== -1) {
            // 如果触发过
            if (!this.silentlyCancelled) {
                // 且没有被取消
                throw new Error('此方法已经被调用过');
            }
            // ?????
            this.silentlyCancelled = false;
            return;
        }
    },

    // 触发成功队列，相当于Promise中的resolve()
    callback: function (res) {
        // 判定是否触发过？
        this._check();
        // ???????
        if (res instanceof Deferred) {
            // 如果执行结果仍是一个Deferred对象
            // throw new Error('Deferred instances can only be chained if they are the result of a callback');
            throw new Error('Deferred对象(或者说Deferred的实例)，只有当它们是回调函数的结果时才能以链式的形式调用');
        }
        this._resback(res);
    },

    // 触发错误队列，相当于Promise中的reject()
    errback: function (res) {
        // 判定是否触发过？
        this._check();
        if (res instanceof Deferred) {
            // throw new Error('Deferred instances can only be chained if they are the result of a callback');
            throw new Error('Deferred对象(或者说Deferred的实例)，只有当它们是回调函数的结果时才能以链式的形式调用');
        }
        if (!(res instanceof Error)) {
            // 执行结果应该调用错误回调，但结果不是Error的实例，所以将res包装成Error的实例，作为参数传入错误队列，即失败回调
            res = new Error(res + '');
        }
        this._resback(res);
    },

    // 同时添加成功与失败回调，相当于Promise中的then方法
    addBoth: function (success, error) {
        // 若只传入一个回调参数(error为undefined)，则成功和失败回调共用一个
        error = error || success;
        // 几种添加回调的方法都会汇总调用一个底层接口addCallbacks
        return this.addCallbacks(success, error);
    },

    // 添加成功的回调
    addCallback: function (fn) {
        if (arguments.length > 1) {
            // 将 类数组 数组化
            var args = [].slice.call(arguments, 1);
            // 柯里化
            fn = curry(fn, window, args);
        }
        // 几种添加回调的方法都会汇总调用一个底层接口addCallbacks
        return this.addCallbacks(fn, null);
    },

    // 添加失败回调
    addErrback: function (fn) {
        if (arguments.length > 1) {
            var args = [].slice.call(arguments, 1);
            fn = curry(fn, window, args);
        }
        // 几种添加回调的方法都会汇总调用一个底层接口addCallbacks
        return this.addCallbacks(null, fn);
    },

    // 同时添加成功回调和失败回调，底层接口addCallbacks
    addCallbacks: function (success, error) {
        // ?????
        if (this.chained) {
            // throw new Error('Chained Deferreds can not be re-useed');
            throw new Error('Chained Deferred不能被重用');
        }
        // ????
        if (this.finalized) {
            // throw new Error('Finalized Deferreds can not be re-used');
            throw new Error('Finalized Deferred不能被重用');
        }
        // 回调是成组添加的
        this.chain.push([success, error]);
        if (this.fired >= 0) {
            // 当前Deferred对象状态为已触发时，？
            this._fire();
        }
        return this;
    },

    // 将队列的的回调一次触发
    _fire: function () {
        var chain = this.chain;
        var fired = this.fired;
        var res = this.results[fired];
        var self = this;
        var callback = null;
        while (chain.length > 0 && this.paused === 0) {
            // 取出一对回调(成功＋失败)
            var pair = chain.shift();
            // 拿到与状态对应的回调
            var f = pair[fired];
            // 若没有传入相应回调，继续执行队列中下一对
            if (f === null) {
                continue;
            }
            // 若存在相应回调，执行回调
            try {
                res = f(res);
                // 取得回调的执行状态
                fired = ((res instanceof Error) ? 1 : 0);
                if (res instanceof Deferred) {
                    // 若回调返回(return)的是一个Deferred对象，则等待这个Deferred对象触发，状态明确后，再进行队列中的下一个回调
                    callback = function (res) {
                        self.paused--;
                        self._resback(res);
                    };
                    this.paused++;
                }
            } catch (err) {
                fired = 1;
                if (!(err instanceof Error)) {
                    // 执行失败，但返回值不是Error类型
                    try {
                        err = new Error(err + '');
                    } catch (e) {
                        alert(e);
                    }
                }
                res = err;
            }
        }
        this.fired = fired;
        this.results[fired] = res;
        if (callback && this.paused) {
            // 存在callback，说明有回调的返回值是一个Deferred对象，this.paused表明当前Deferred对象是暂停执行的
            res.addBoth(callback);
            // ?????
            res.chained = true;
        }
    }
};



// test code
function canceller (d) {
    log('cancelled');
    log(d);
}
var deferred = new Deferred(canceller);

// todo: 实现类似jQuery中when函数的功能
