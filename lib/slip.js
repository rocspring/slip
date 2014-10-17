
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

            //浏览器的属性私有前缀
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

            //css样式的私有前缀
                cssPrefix = attrPrefix ? '-' + attrPrefix.toLowerCase() + '-' : '',

            //组合属性名称
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


    function Slip (opts){

    }

    Slip.prototype = {

        constructor : Slip,

        // 初始化组件
        init : function () {

        },

        setParam : function () {

        }
    };

})(window);