// ==UserScript==
// @name         Timing Click
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  倒计时自动点击，电商抢东西专用
// @author       Cherokeeli
// @match        *://*.taobao.com/*
// @match        *://*.jd.com/*
// @require      https://code.jquery.com/jquery-latest.js
// @run-at       document-idle
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_xmlhttpRequest

// ==/UserScript==

(function() {
    'use strict';
    var $ = $ || window.$;
    var _$ = $.noConflict(true);

    var mainCss = `#ql-panel #counterClickTime {
position:relative;
z-index:999;
height: 20px !important;
width: 150px !important;
font-size: 1em !important;
padding: 5px !important;
border: none !important;
margin: 0 !important;
}

#ql-panel #counterClickSelector {
position:relative;
z-index:999;
height: 20px !important;
width: 150px !important;
font-size: 1em !important;
padding: 5px !important;
border: none !important;
margin: 0 !important;
}

#ql-panel #listenButton {
position:relative;
z-index:999;
width: 100% !important;
border: none !important;
color: red !important;
font-size: 1em !important;
margin: 0 !important;
background-color: #fff;
}

#ql-panel #triggerButton {
height:50px;
width:50px;
position:relative;
z-index:9999;
background-position:center;
background-size:100%;
background-image:url(https://raw.githubusercontent.com/Cherokeeli/monkey-lib/master/timing-click/image/1.pic.png);
}

#ql-panel {
position:fixed;
z-index:9999;
}

#ql-panel #hidePanel {
position:absolute;
z-index:9999;
display:none;
border: solid 1px rgb(238,238,238) !important;
box-shadow: 0 0 5px rgb(213,210,210) !important;
}`;

    /*拖动*/
    class DragObj {
        constructor(dom) {
            this.mouse = {
                x: 0,
                y: 0
            };
            this.obj = {
                x: 0,
                y: 0
            };
            this.isClicked = false;
            if(dom) {
                this.dom = dom;
            } else {
                throw new Error('不存在的dom节点');
            }
        }

        init(options={}) {
            document.addEventListener('mousedown', this.down.bind(this));
            document.addEventListener('mousemove', this.move.bind(this));
            document.addEventListener('mouseup', this.end.bind(this));
            if(typeof options.click ==='function') {
                this.clickCb = options.click;
            }
            if(typeof options.exclude === 'object') {
                this.excludeDom = options.exclude;
            }
            if(typeof options.include === 'object') {
                this.includeDom = options.include;
            }
        }

        down(event) {
            if(this.includeDom.contains(event.target)) {
                this.isClicked = true;
                this.mouse.x = event.clientX;
                this.mouse.y = event.clientY;
                this.obj.x = this.dom.offsetLeft;
                this.obj.y = this.dom.offsetTop;
            }
        }

        move(event) {
            if(this.isClicked) {
                let moveX = event.clientX - this.mouse.x;
                let moveY = event.clientY - this.mouse.y;
                this.dom.style.left = `${this.obj.x+moveX}px`;
                this.dom.style.top = `${this.obj.y+moveY}px`;
            }
        }

        end(event) {
            this.isClicked = false;
            if(this.clickCb && (event.clientX === this.mouse.x && event.clientY===this.mouse.y)) {
                if(!this.excludeDom.contains(event.target) && this.includeDom.contains(event.target)) {
                    this.clickCb(event);
                }
            }
        }
    }

    GM_addStyle(mainCss);

    let timeInput = _$('<input id="counterClickTime" placeholder="输入开抢时间" type="datetime-local" />');
    let selectorInput = _$('<input id="counterClickSelector" placeholder="输入抢按钮选择器" type="text" />');
    let listenButton = _$('<button id="listenButton">准备开抢</button>');
    let triggerButton = _$('<div id="triggerButton"></div>');
    let panel = _$('<div id="ql-panel"></div>');
    let hidePanel = _$('<div id="hidePanel"></div>');

    hidePanel.append(timeInput);
    hidePanel.append(selectorInput);
    hidePanel.append(listenButton);

    panel.append(triggerButton);
    panel.append(hidePanel);

    _$(document.body).prepend(panel);

    (new DragObj(panel[0])).init({
        click: function(event) {
            hidePanel.toggle('slow');
        },
        exclude: hidePanel[0],
        include: panel[0]
    });

    function fireEvent(dom, eventName) {
        let event = new MouseEvent(eventName);
        return dom.dispatchEvent(event);
    }

    function createWorkerFromExternalURL(url, callback) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function (response) {
                var script, dataURL, worker = null;
                if (response.status === 200) {
                    script = response.responseText;
                    dataURL = 'data:text/javascript;base64,' + btoa(script);
                    worker = new unsafeWindow.Worker(dataURL);
                }
                callback(worker);
            },
            onerror: function () {
                callback(null);
            }
        });
    }

    /*开始抢*/
    listenButton.click(function(e) {
        let time = timeInput.val();
        let targetTime = Date.parse(new Date(time));
        let currentTime = Date.now();
        let timeout = targetTime-currentTime;
        console.log(timeout, selectorInput.val());
        createWorkerFromExternalURL('https://raw.githubusercontent.com/Cherokeeli/monkey-lib/master/timing-click/count-worker.js', function (worker) {
            if (!worker) throw Error('Create webworker failed');
            let btn = listenButton[0];
            worker.onmessage = function (event) {
                if (event.data === -1) {
                    btn.disabled = false;
                    _$(selectorInput.val()).trigger('click');
                    fireEvent(document.querySelector(selectorInput.val()), 'click');
                } else {
                    btn.disabled = true;
                    btn.innerHTML = `距离开抢还有${Math.ceil(event.data / 1000)}秒`;
                }
            };
            worker.postMessage(timeout);
        });
    });
})();