/*
 * @file demos.js
 * @description 暂时有四个demo：syncDemo1, asyncDemo1, asyncDemo2, asyncDemo3
 */

// 为button绑定点击事件
var btns = document.getElementsByTagName('button');
var handlers = [syncDemo1, asyncDemo1, asyncDemo2, asyncDemo3];
for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener('click', handlers[i]);
}

// 一个同步队列的例子
function syncDemo1 () {
    printDivideLine();
    function canceller (d) {
        log('cancelled');
        log(d);
    }
    // 创建Deferred实例
    var deferred = new Deferred(canceller);

    // 向队列中添加回调，支持链式调用
    deferred.addBoth(success_1, error_1)
        .addBoth(success_2, error_2)
        .addBoth(success_3, error_3)
        .addCallback(printDivideLine);

    // 触发deferred
    deferred.callback('这个例子是Deferred应用同步操作中');



    // 定义回调函数
    function success_1(res) {
        console.log(res);
        log('已触发，结果是成功的，队列中成功回调1被执行' + res);
        return res + 'success_1执行完毕，返回 ';
    }
    function error_1(res) {
        log('已触发，结果是失败的，队列中失败回调1被执行' + res);
        return res + 'error_1执行完毕，返回 ';
    }
    function success_2(res) {
        log('已触发，结果是成功的，队列中成功回调2被执行' + res);
        return res + 'success_2执行完毕，返回 ';
    }
    function error_2(res) {
        log('已触发，结果是失败的，队列中失败回调2被执行' + res);
        return res + 'error_2执行完毕，返回 ';
    }
    function success_3(res) {
        log('已触发，结果是成功的，队列中成功回调3被执行' + res);
        return res + 'success_3执行完毕，返回 ';
    }
    function error_3(res) {
        log('已触发，结果是失败的，队列中失败回调3被执行' + res);
        return res + 'error_3执行完毕，返回 ';
    }
}
// 同步队列例子 end


// 一个异步队列的例子（setTimeout）
function asyncDemo1 () {
    printDivideLine();
    function newSetTimeout () {
        var d = new Deferred;
        log('setTimeout开始');
        window.setTimeout(function () {
            // 触发
            d.callback();
        }, 2000);

        return d;
    }
    var timerDeferred = newSetTimeout();
    timerDeferred.addBoth(success_1, error_1)
        .addCallback(printDivideLine);



    // 定义回调函数
    function success_1(res) {
        log('已触发，结果是成功的，队列中成功回调1被执行' + res);
        // return new Deferred();
    }
    function error_1(res) {
        log('已触发，结果是失败的，队列中失败回调1被执行' + res);
        // return;
    }
}
// 一个异步队列的例子（setTimeout）end


// 可以根据上面newSetTimeout的实现，封装其他异步请求的API
// 封装异步操作步骤：
// 创建一个Deferred的实例，
// 在异步操作的回调中触发这个实例(成功，对于上面的Deferred对象的实现，调用callback()；
// 或失败，对于本Deferred的实现，调用errback())，
// 封装好异步操作的回调后，最后只需要返回一个Deferred对象，用来添加真正的回调函数

// 下面以异步的Ajax调用为例：
function asyncDemo2 () {
    printDivideLine();
    function newAjax () {
        var xhr = new window.XMLHttpRequest;
        var d = new Deferred;
        // xhr.onload = function (res) {
        //     d.callback(res);
        // };
        // xhr.onerror = function (res) {
        //     d.errback(res);
        // };
        // 上面这两种写法低版本的IE浏览器(IE7, IE8)不支持

        if (xhr) {
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        d.callback(xhr.responseText);
                    } else {
                        d.errback(xhr);
                    }
                }
            };
            var url = '/test.json';
            xhr.open('GET', url, true);
            xhr.send();
        }

        return d;
    }
    var xhrDeferred = newAjax();
    xhrDeferred.addBoth(success_1, error_1)
        .addBoth(success_2, error_2)
        .addBoth(success_3, error_3)
        .addCallback(printDivideLine);



    // 定义回调函数
    function success_1(res) {
        console.log(res);
        log('已触发，结果是成功的，队列中成功回调1被执行' + res);
        return res + 'success_1执行完毕，返回 ';
    }
    function error_1(res) {
        log('已触发，结果是失败的，队列中失败回调1被执行' + res);
        return res + 'error_1执行完毕，返回 ';
    }
    function success_2(res) {
        log('已触发，结果是成功的，队列中成功回调2被执行' + res);
        return res + 'success_2执行完毕，返回 ';
    }
    function error_2(res) {
        log('已触发，结果是失败的，队列中失败回调2被执行' + res);
        return res + 'error_2执行完毕，返回 ';
    }
    function success_3(res) {
        log('已触发，结果是成功的，队列中成功回调3被执行' + res);
        return res + 'success_3执行完毕，返回 ';
    }
    function error_3(res) {
        log('已触发，结果是失败的，队列中失败回调3被执行' + res);
        return res + 'error_3执行完毕，返回 ';
    }

}
// Deferred应用于异步的Ajax end


// 如果不使用Deferred，上面使用Deferred对象的写法等价于：
function asyncDemo3 () {
    printDivideLine();
    function oldAjax (cb1) {
        var xhr = new window.XMLHttpRequest;
        if (xhr) {
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        cb1(xhr.responseText, function (res, cb) {
                            log(res);
                            cb && cb(undefined, function (res, cb2) {
                                log(res);
                                cb2 && cb2(undefined, function (res, cb3) {
                                    log(res);
                                    cb3 && cb3();
                                });
                            });
                        });
                    }
                }
            };
        }
        var url = '/test.json';
        xhr.open('GET', url, true);
        xhr.send();
    }

    var xhrDeferred = oldAjax(cb1);



    function cb1 (res, cb2) {
        log(res);
        cb2 && cb2(undefined, cb3);
    }
    function cb2 (res, cb3) {
        log(res);
        cb3 && cb3(undefined);
    }
    function cb3 (res, cb4) {
        cb4 && cb4(res,cb4);
        printDivideLine();
    }
}


// todo: 实现类似jQuery中when函数的功能
// 对于两个异步事件，
// function whenDemo () {}

// 输出分隔线
function printDivideLine () {
    log('-----------');
}
