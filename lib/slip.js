
/*
 * 移动端使用的滑动组件
 * @author: wshp
 * @E-mail: wshp000000@gmail.com
 * @version: 0.0.1
 **/

;(function (window) {
    var navigator = window.navigator,
        msPointerEnabled = navigator.msPointerEnabled;

    /*
     * 移动端的touch事件
     **/
    var TOUCH_EVENTS = {
            start : msPointerEnabled ? 'msPointerDown' : 'touchstart',
            move : msPointerEnabled ? 'msPointerMove' : 'touchmove',
            end : msPointerEnabled ? 'msPointerUp' : 'touchend'
        },

    /*
     * 获取浏览器的样式的私有前缀
     **/
        vendor = (function(){
            var domStyle = document.createElement('div').style,

            // 浏览器的属性私有前缀
                attrPrefix = (function () {
                    var vendors = ['t', 'webkitT', 'MozT', 'OT', 'msT'],
                        i;

                    for ( i in vendors ){
                        console.log( vendors[i] + 'ransform' );
                        if ( domStyle[ vendors[i] + 'ransform' ] !== undefined ) {
                            return vendors[i].substr( 0, vendors[i].length - 1 );
                        }
                    }

                    return false;
                })(),

            // css样式的私有前缀
                cssPrefix = attrPrefix ? '-' + attrPrefix.toLowerCase() + '-' : '',

            // 组合属性名称
                combineAttrName = function ( name ) {
                    if ( attrPrefix === '') return name;

                    return attrPrefix + name.charAt(0).toUpperCase() + name.substr(1);
                },
                transform = combineAttrName('transform'),
                transformOrigin = combineAttrName('transformOrigin'),
                transition = combineAttrName('transition'),
                transitionProperty = combineAttrName('transitionProperty'),
                transitionDuration = combineAttrName('transitionDuration'),
                transitionTimingFunction = combineAttrName('transitionTimingFunction'),
                transitionDelay = combineAttrName('transitionDelay'),
                transitionEndEvent = (function() {
                    if (attrPrefix == 'webkit' || attrPrefix === 'O') {
                        return attrPrefix.toLowerCase() + 'TransitionEnd';
                    }
                    return 'transitionend';
                }());

            domStyle = null;

            return {
                attrPrefix : attrPrefix,
                cssPrefix : cssPrefix,
                transform : transform,
                transformOrigin : transformOrigin,
                transition : transition,
                transitionProperty : transitionProperty,
                transitionDuration : transitionDuration,
                transitionTimingFunction : transitionTimingFunction,
                transitionDelay : transitionDelay,
                transitionEndEvent : transitionEndEvent
            };

        })(),

    /*
     * 数据类型的判断
     **/
        typeJudge = (function (){

            var toString = Object.prototype.toString;

            // 基本数据类型的判断
            function isNumber ( p ) {
                return typeof p === 'number';
            }

            function isString ( p ) {
                return typeof p === 'string';
            }

            function isUndefined ( p ) {
                if( arguments.length === 0 ) return;
                return p === void 1;
            }

            function isNull ( p ) {
                return toString.call(p) === '[object Null]';
            }

            // 引用数据类型的判断
            function isFunction ( p ) {
                return typeof p === 'function';
            }

            function isObject ( p ) {
                return toString.call(p) === '[object Object]';
            }

            function isArray ( p ) {
                return toString.call(p) === '[object Array]';
            }

            return {
                isNumber : isNumber,
                isString : isString,
                isUndefined : isUndefined,
                isNull : isNull,
                isFunction : isFunction,
                isObject : isObject,
                isArray : isArray
            };
        })();


    /*
     * 组件构造函数
     * opts = {
     *     el : 组件的容器(必需的)
     * }
     **/
    function Slip (opts){

        this.init(opts);
    }

    Slip.prototype = {

        constructor : Slip,

        slipTimer : null,

        // 初始化组件
        init : function (opts) {
            this.setParam(opts);
            this.renderDom();
            this.star();
        },

        // 配置参数
        setParam : function (opts) {
            // 组件的容器(必需的)
            this.el = typeJudge.isString(opts.el) ? document.querySelector(opts.el) : opts.el;
            // 所有图片的父容器
            this.picContainer = opts.picContainer ? this.el.querySelector(opts.picContainer) : this.el.children[0];
            // 所有的图片子元素
            this.picItems = this.picContainer.children;
            // 当前展示图片的索引(从1开始)
            this.index = opts.index || 1;
            // 图片的宽度
            this.width = document.body.offsetWidth || 320;
            // 图片展示的时间
            this.time = opts.time || 2000;
            // 图片的个数
            this.picNum = this.picContainer.children.length;
            // 触摸点的位置
            this.touchPosition = {};
        },

        // 渲染DOM节点
        renderDom : function () {
            var that = this,
                picContainer = that.picContainer,
                picItems = that.picItems,
                index = that.index,
                width = that.width,
                imgElements = picContainer.querySelectorAll('img'),
                i = 0,
                len = imgElements.length;

            picContainer.style.width = width + 'px';
            picContainer.style.overflow = 'hidden';

            picItems[index-1].style['z-index'] = 1;

            for ( ; i < len; i++ ){
                imgElements[i].style.width = width + 'px';
            }

            picItems[0].style[vendor.transform] = 'translate3d(0,0,0)';
            picItems[1].style[vendor.transform] = 'translate3d( ' + width + 'px,0,0)';
            

        },

        // 组件开始执行
        star : function () {
            var that = this,
                time = that.time,
                index = that.index,
                slipTimer = that.slipTimer;

            slipTimer = setInterval ( function () {
                that.next();
            }, time );
        },

        // 组件停止执行
        stop : function () {
            var that = this,
                slipTimer = that.slipTimer;

            slipTimer = null;
        },

        // 滑动到第几张图片 (private)
        to : function (index) {
            var that = this,
                picNum = that.picNum,
                trueIndex;

            if( index > picNum ){
                trueIndex = index % picNum;
            }else if ( index <= 0 ){
                trueIndex = index % picNum + picNum;
            }else {
                trueIndex = index;
            }

            that.slide(trueIndex);
            that.index = trueIndex;
        },

        // 滑动的动作
        slide : function (index) {
            var that = this,
                width = that.width,
                picNum = that.picNum,
                picItems = that.picItems,
                trueIndex = index,
                prevIndex,
                nextIndex,
                i = 0,
                len = picItems.length;

            prevIndex = trueIndex -2 < 0 ? picNum - 1 : trueIndex - 2 ;
            nextIndex = trueIndex === picNum ? 0 : trueIndex;

            for ( ; i < len; i++ ){
                picItems[i].style['z-index'] = 0;
            }

            picItems[prevIndex].style['z-index'] = 2;
            picItems[index-1].style['z-index'] = 1;
            picItems[nextIndex].style['z-index'] = 1;

            picItems[prevIndex].style[vendor.transform] = 'translate3d(-' + width +'px,0,0)';
            picItems[trueIndex-1].style[vendor.transform] = 'translate3d(0,0,0)';
            picItems[nextIndex].style[vendor.transform] = 'translate3d(' + width + 'px,0,0)';

            picItems[prevIndex].style[vendor.transition] = 'transform 500ms';
            picItems[trueIndex-1].style[vendor.transition] = 'transform 500ms';
            picItems[nextIndex].style[vendor.transition] = 'transform 0ms';


        },

        // 滑动到下一张
        next : function () {
            var that = this,
                index = that.index;

            that.to(index + 1);
        },

        // 滑动到上一张
        prev : function () {
            var that = this,
                index = that.index;

            that.to(index - 1);
        },

        //添加事件监听
        addEventListener : function () {

        },

        // 事件处理函数
        handlerEvent : function (e) {
            var that = this,
                el = that.el;

            if( e.type === TOUCH_EVENTS.start ){
                that.onTouchStart(e);
            }else if ( e.type === TOUCH_EVENTS.move ) {
                that.onTouchMove(e);
            }else if ( e.type === TOUCH_EVENTS.end ) {
                that.onTouchEnd(e);
            }

        },

        // 移除事件监听
        removeEventListener : function () {

        },

        // 销毁组件
        destory : function () {
            var that = this;

            that.stop();
            that.removeEventListener();
        },

        onTouchStart : function (e) {
            var that = this;

            that.touchPosition = {
                startX : msPointerEnabled ? e.clientX : e.touches[0].clientX ,
                startY : msPointerEnabled ? e.clientY : e.touches[0].clientY
            };
        },

        onTouchMove : function (e) {
            var that = this,
                touchPosition = that.touchPosition,
                picNum = that.picNum,
                picItems = that.picItems,
                trueIndex = that.index,
                prevIndex,
                nextIndex,
                i = 0,
                len = picItems.length;

            prevIndex = trueIndex -2 < 0 ? picNum - 1 : trueIndex - 2 ;
            nextIndex = trueIndex === picNum ? 0 : trueIndex;

            that.touchPosition = {
                endX : msPointerEnabled ? e.clientX : e.touches[0].clientX ,
                endY : msPointerEnabled ? e.clientY : e.touches[0].clientY
            };

            var startX = touchPosition.startX,
                endX = touchPosition.endX,
                moveDistance = endX - startX;


        },

        onTouchEnd : function (e) {
            var that = this,
                width = that.width,
                touchPosition = that.touchPosition,
                startX = touchPosition.startX,
                endX = touchPosition.endX,
                moveDistance = endX - startX;


        }

    };

    window.Slip = Slip;

})(window);
