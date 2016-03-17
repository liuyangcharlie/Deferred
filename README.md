# 一个JavaScript实现的Deferred库的demo

### 代码说明

是照抄《JavaScript框架设计》（作者：司徒正美）一书第12章的实现

### 运行
* clone到本地
```
git clone git@github.com:liuyangcharlie/Deferred.git
```
* 在`Deferred/`路径下开启http服务，可以使用 `npm` 中的`http-server`便捷的开启http服务（npm install -g http-server; http-server -a 127.0.0.1 -p 8088 -s #port=8088）
* 访问`http://127.0.0.1:8088/deferred.html`，选择按钮运行demo
* 建议开启控制台查看demo，方便打断点调试。
* 代码中有很多注释，可以先简单看下代码再运行demo

#A JavaScript Deferred demo

### Explanation

Almost a completely copy. A copy of Deferred implementation from *JavaScript框架设计*(author:司徒正美) with extra comments.

### How to run

* run `git clone git@github.com:liuyangcharlie/Deferred.git` to clone the repository first.
* change directory to path `Deferred/`, start a http server here. It's easy to use `http-server` in `npm`(npm install -g http-server; http-server -a 127.0.0.1 -p 8088 -s #port=8088)
* visit `http://127.0.0.1:8088/deferred.html`, click to run the demo
* it's better to keep the DevTools(or Firebug if you are using Firfox) on to debug with placing breakpoints
* there are a lot of comments I added in the code, you may roughly read the code first then run the demo
