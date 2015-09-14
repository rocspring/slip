/**
 *
 * 例子参见：http://maxzhang.github.io/carousel-widget/dev/examples/slide.html
 * 基于slide组件进行改进，增加了循环播放的功能和自适应屏幕大小的功能
 *
 */
(function(window) {
    var navigator = window.navigator,
        isAndroid = /Android/i.test(navigator.userAgent),
        msPointerEnabled = navigator.msPointerEnabled,
        TOUCH_EVENTS = {
            start: msPointerEnabled ? 'MSPointerDown' : 'touchstart',
            move: msPointerEnabled ? 'MSPointerMove' : 'touchmove',
            end: msPointerEnabled ? 'MSPointerUp' : 'touchend'
        },
        slice = Array.prototype.slice,
        dummyStyle = document.createElement('div').style,
        vendor = (function() {
            var vendors = 't,webkitT,MozT,msT,OT'.split(','),
                t,
                i = 0,
                l = vendors.length;

            for (; i < l; i++) {
                t = vendors[i] + 'ransform';
                if (t in dummyStyle) {
                    return vendors[i].substr(0, vendors[i].length - 1);
                }
            }

            return false;
        })(),
        cssVendor = vendor ? '-' + vendor.toLowerCase() + '-' : '',
        prefixStyle = function(style) {
            if (vendor === '') return style;
            style = style.charAt(0).toUpperCase() + style.substr(1);
            return vendor + style;
        },
        transform = prefixStyle('transform'),
        transitionDuration = prefixStyle('transitionDuration'),
        transitionEndEvent = (function() {
            if (vendor == 'webkit' || vendor === 'O') {
                return vendor.toLowerCase() + 'TransitionEnd';
            }
            return 'transitionend';
        })(),
        noop = function() {},
        addClass = function(elem, value) {
            var classes, cur, clazz, i;
            classes = (value || '').match(/\S+/g) || [];
            cur = elem.nodeType === 1 && (elem.className ? (' ' + elem.className + ' ').replace(/[\t\r\n]/g, ' ') : ' ');
            if (cur) {
                i = 0;
                while ((clazz = classes[i++])) {
                    if (cur.indexOf(' ' + clazz + ' ') < 0) {
                        cur += clazz + ' ';
                    }
                }
                elem.className = cur.trim();
            }
        },
        removeClass = function(elem, value) {
            var classes, cur, clazz, i;
            classes = (value || '').match(/\S+/g) || [];
            cur = elem.nodeType === 1 && (elem.className ? (' ' + elem.className + ' ').replace(/[\t\r\n]/g, ' ') : ' ');
            if (cur) {
                i = 0;
                while ((clazz = classes[i++])) {
                    while (cur.indexOf(' ' + clazz + ' ') >= 0) {
                        cur = cur.replace(' ' + clazz + ' ', ' ');
                    }
                }
                elem.className = cur.trim();
            }
        },
        listenTransition = function(target, duration, callbackFn) {
            var me = this,
                clear = function() {
                    if (target.transitionTimer) clearTimeout(target.transitionTimer);
                    target.transitionTimer = null;
                    target.removeEventListener(transitionEndEvent, handler, false);
                },
                handler = function() {
                    clear();
                    if (callbackFn) callbackFn.call(me);
                };
            clear();
            target.addEventListener(transitionEndEvent, handler, false);
            target.transitionTimer = setTimeout(handler, duration + 100);
        },
        createOrientationChangeProxy = function(fn, scope) {
            var userAgent = window.navigator.userAgent,
                isAndroid = /Android/i.test(userAgent),
                isXiaoMi = /MI\s\d/i.test(userAgent);
                
            return function() {
                clearTimeout(fn.orientationChangedTimer);
                var args = slice.call(arguments, 0),

                    // 对Android横竖屏抓换时使用延迟，在横竖屏转换时，屏幕高宽并不能立即生效
                    // 有的Android少于400ms高宽就能生效，有的就会超过400ms
                    // 小米自带浏览器延迟尤其厉害，原因未知
                    // 搜狗浏览器也有延迟
                    delay = isAndroid ? (isXiaoMi ? 1000 : 400) : 0;

                fn.orientationChangedTimer = setTimeout(function() {
                        fn.apply(scope, args);
                }, delay);
            };
        };

    var Slide = function(config) {
        config = config || {};
        for (var o in config) {
            this[o] = config[o];
        }

        this.el = typeof this.targetSelector === 'string' ? document.querySelector(this.targetSelector) : this.targetSelector;
        if (msPointerEnabled) this.el.style.msTouchAction = 'pan-y';
        this.el.style.overflow = 'hidden';

        this.wrap = this.wrapSelector ? this.el.querySelector(this.wrapSelector) : this.el.children[0];
        // this.wrap.style.cssText = cssVendor + 'transform:translate3d(' + (-this.getItemWidth() * this.activeIndex) + 'px,0px,0px);' + cssVendor + 'transition:' + cssVendor + 'transform 0ms;';
        this.items = slice.call(this.wrap.children, 0);
        this.items.forEach(function(value, index) {
            value.setAttribute('data-index', index);
        });

        if (this.prevSelector) {
            this.prevEl = typeof this.prevSelector === 'string' ? document.querySelector(this.prevSelector) : this.prevSelector;
            this.prevEl.addEventListener('click', this, false);
        }
        if (this.nextSelector) {
            this.nextEl = typeof this.nextSelector === 'string' ? document.querySelector(this.nextSelector) : this.nextSelector;
            this.nextEl.addEventListener('click', this, false);
        }
        if (this.indicatorSelector) {
            this.indicators = typeof this.indicatorSelector === 'string' ? document.querySelectorAll(this.indicatorSelector) : this.indicatorSelector;
            this.indicators = slice.call(this.indicators, 0);
        }

        this._resetInitPosition = createOrientationChangeProxy(function(){
            this.setInitPosition.call(this);
        },this);
        window.addEventListener( 'onorientationchange' in window ? 'orientationchange' : 'resize', this._resetInitPosition, false );

        this.el.addEventListener(TOUCH_EVENTS.start, this, false);

        this.setInitPosition();

        this.to(this.activeIndex, true);

        this.running = false;
        if (this.autoPlay) {
            this.start();
        }
    };

    Slide.prototype = {
        /**
         * @cfg {String} targetSelector 目标元素选取器，items 默认为 targetSelector 的子元素，可以设置itemSelector，查找指定items子元素
         */

        /**
         * @cfg {String} wrapSelector 子元素容器选取器
         */

        /**
         * @cfg {String} prevSelector 向前按钮选取器
         */

        /**
         * @cfg {String} nextSelector 向后按钮选取器
         */

        /**
         * @cfg {String} indicatorSelector 指示器选取器
         */

        /**
         * @cfg {String} indicatorCls 当前activeIndex指示器样式
         */

        /**
         * @cfg {Number} activeIndex 初始显示的元素index，默认0
         */
        activeIndex: 0,

        /**
         * @cfg {Boolean} autoPlay true自动切换，默认true
         */
        autoPlay: true,

        /**
         * @cfg {Number} interval 循环滚动间隔时间，单位ms，默认3000
         */
        interval: 3000,

        /**
         * @cfg {Number} duration 动画持续时间，单位ms，默认300
         */
        duration: 300,

        /**
         * @cfg {iScroll} iscroll 关联一个iscroll对象
         * Carousel Widget 为水平方向滚动，如果被嵌套在一个垂直滚动的 iScroll 组件中，会导致触摸滚动 Carousel的水平滚动 与 iScroll的垂直滚动相冲突，
         * 为了解决这个问题，在水平滑动时，禁用iScroll的垂直滚动，水平滑动结束之后，再启用iScroll。
         */

        /**
         * 开始切换之前回调函数，返回值为false时，终止本次slide操作
         */
        beforeSlide: noop,

        /**
         * 切换完成回调函数
         */
        onSlide: noop,

        // private
        getItemWidth: function() {
            return this.wrap.offsetWidth;
        },

        // private
        getLastIndex: function() {
            return this.items.length - 1;
        },

        // private
        getContext: function(index) {
            var last = this.getLastIndex(),
                prev,
                next;
            if (typeof index === 'undefined') {
                index = this.activeIndex;
            }
            prev = index - 1;
            next = index + 1;
            if (prev < 0) {
                prev = last;
            }
            if (next > last) {
                next = 0;
            }
            return {
                prev: prev,
                next: next,
                active: index
            };
        },


        /**
         *开始设置初始位置，使得各个图片的起始位置在同一个位置
         */
        setInitPosition: function() {
            var me = this,
                itemWidth = me.getItemWidth(),
                items = this.items,
                len = items.length,
                i,j;

            for (i = len - 1; i >= 0; i--) {
                items[i].style['left'] = -itemWidth * i + 'px';
            }

            me._move(len - 1, 0, -itemWidth);
            me._move(0, 0, 0);

            for (j = len - 2; j > 0; j--) {
                me._move(j, 0, itemWidth);
            }
        
        },

        /**
         * 开始自动切换
         */
        start: function() {
            if (!this.running) {
                this.running = true;
                this.clear();
                this.run();
            }
        },

        /**
         * 停止自动切换
         */
        stop: function() {
            this.running = false;
            this.clear();
        },

        // private
        clear: function() {
            clearTimeout(this.slideTimer);
            this.slideTimer = null;
        },

        // private
        run: function() {
            var me = this;
            if (!me.slideTimer) {
                me.slideTimer = setInterval(function() {
                    me.to(me.getContext().next);
                }, me.interval);
            }
        },

        /**
         * 切换到上一个
         */
        prev: function() {
            this.to(this.activeIndex - 1);
        },

        /**
         * 切换到下一个
         */
        next: function() {
            this.to(this.activeIndex + 1);
        },

        // private
        onPrevClick: function(e) {
            if (e) e.preventDefault();
            this.clear();
            this.prev();
            if (this.autoPlay) this.run();
        },

        // private
        onNextClick: function(e) {
            if (e) e.preventDefault();
            this.clear();
            this.next();
            if (this.autoPlay) this.run();
        },

        /**
         * 切换到index
         * @param {Number} toIndex
         * @param {Boolean} silent 无动画效果
         * @param {Boolean} isSlideRight 是否向右滑动
         */
        to: function(toIndex, silent, isSlideRight) {
            var active = this.activeIndex,
                last = this.getLastIndex();
            if (toIndex >= 0 && toIndex <= last && toIndex != active && this.beforeSlide(toIndex) !== false) {
                this.slide(toIndex, silent, isSlideRight);
            } else if (toIndex === last + 1) {
                this.slide(0, silent, isSlideRight);
            } else if (toIndex === -1) {
                this.slide(last, silent, isSlideRight);
            } else {
                this.slide(active, silent, isSlideRight);
            }
        },

        // private
        slide: function(toIndex, silent, isSlideRight) {
            var me = this,
                active = me.activeIndex,
                lastActive = active,
                handler = function() {
                    me.wrap.removeEventListener(transitionEndEvent, handler, false);
                    // me.wrap.style[transitionDuration] = '0ms';
                    if (me.indicators && me.indicatorCls) {
                        if (me.indicators[lastActive]) removeClass(me.indicators[lastActive], me.indicatorCls);
                        if (me.indicators[me.activeIndex]) addClass(me.indicators[me.activeIndex], me.indicatorCls);
                    }
                    // me.onSlide(me.activeIndex);
                };

            if (!silent) listenTransition(me.wrap, me.duration, handler);

            me._slipNext(toIndex, silent, isSlideRight);
            me.onSlide(me.activeIndex);

            // me.wrap.style[transitionDuration] = silent ? '0ms' : me.duration + 'ms';
            // me.wrap.style[transform] = 'translate3d(' + (-me.getItemWidth() * toIndex) + 'px, 0px, 0px)';
            if (silent) handler();
        },

        //private
        _move: function(index, speed, distance) {
            var me = this,
                items = this.items,
                lastIndex = me.getLastIndex();

            if (index < 0 || index > lastIndex) {
                return;
            }

            items[index].style[transitionDuration] = speed + 'ms';
            items[index].style[transform] = 'translate3d(' + distance + 'px, 0px, 0px)';
        },

        // private
        _slipNext: function(toIndex, silent, isSlideRight) {

            var me = this,
                activeIndex = me.activeIndex,
                itemWidth = me.getItemWidth(),
                lastIndex = me.getLastIndex(),
                trueIndex = toIndex,
                items = this.items,
                itemsLen = items.length,
                prevIndex = trueIndex === 0 ? itemsLen - 1 : trueIndex - 1,
                nowIndex = trueIndex,
                nextIndex = trueIndex < itemsLen - 1 ? trueIndex + 1 : 0,
                speed = silent ? 0 : me.duration;

            // 向右滑动
            // 有三种情况:
            // 1.正常的滑动到下一帧 (第一帧滑到第二帧需要特别的写出来)
            // 2.最后一帧滑动到第一帧
            // 3.向左滑动的时候，没有触发滑到上一帧，然后回到touchstart的起始位置
            if ( (toIndex > activeIndex && activeIndex !== lastIndex && activeIndex !== 0) ||
                 (activeIndex === 0 && toIndex === 1) ||
                (toIndex === 0 && activeIndex === lastIndex) ||
                (toIndex === activeIndex && !isSlideRight) ) {
                me._move(prevIndex, speed, -itemWidth);
                me._move(nowIndex, speed, 0);
                me._move(nextIndex, 0, itemWidth);
            } else { // 向左滑动
                me._move(prevIndex, 0, -itemWidth);
                me._move(nowIndex, speed, 0);
                me._move(nextIndex, speed, itemWidth);
            }

            me.activeIndex = toIndex;

        },

        // private
        _slipDistance: function(index, distance) {
            var me = this,
                items = this.items,
                itemsLen = items.length,
                itemWidth = me.getItemWidth(),
                prevIndex = index === 0 ? itemsLen - 1 : index - 1,
                nowIndex = index,
                nextIndex = index < itemsLen - 1 ? index + 1 : 0;

            items[prevIndex].style[transitionDuration] = '0ms';
            items[nowIndex].style[transitionDuration] = '0ms';
            items[nextIndex].style[transitionDuration] = '0ms';

            items[prevIndex].style[transform] = 'translate3d(' + (-itemWidth - distance) + 'px, 0px, 0px)';
            items[nowIndex].style[transform] = 'translate3d(' + (-distance) + 'px, 0px, 0px)';
            items[nextIndex].style[transform] = 'translate3d(' + (itemWidth - distance) + 'px, 0px, 0px)';
        },

        // private
        onTouchStart: function(e) {
            var me = this;
            if (me.prevEl && me.prevEl.contains && me.prevEl.contains(e.target) ||
                me.nextEl && me.nextEl.contains && me.nextEl.contains(e.target)) {
                return;
            }

            clearTimeout(me.androidTouchMoveTimeout);
            me.clear();
            if (isAndroid) {
                me.androidTouchMoveTimeout = setTimeout(function() {
                    me.resetStatus();
                }, 3000);
            }

            me.el.removeEventListener(TOUCH_EVENTS.move, me, false);
            me.el.removeEventListener(TOUCH_EVENTS.end, me, false);
            me.el.addEventListener(TOUCH_EVENTS.move, me, false);
            me.el.addEventListener(TOUCH_EVENTS.end, me, false);
            delete me.horizontal;

            var clientX = msPointerEnabled ? e.clientX : e.touches[0].clientX,
                clientY = msPointerEnabled ? e.clientY : e.touches[0].clientY;

            me.touchCoords = {};
            me.touchCoords.startX = clientX;
            me.touchCoords.startY = clientY;
            me.touchCoords.timeStamp = e.timeStamp;
        },

        // private
        onTouchMove: function(e) {
            var me = this;

            clearTimeout(me.touchMoveTimeout);
            if (msPointerEnabled) {
                // IE10 for Windows Phone 8 的 pointerevent， 触发 MSPointerDown 之后，
                // 如果触控移动轨迹不符合 -ms-touch-action 规则，则不会触发 MSPointerUp 事件。
                me.touchMoveTimeout = setTimeout(function() {
                    me.resetStatus();
                }, 3000);
            }
            if (!me.touchCoords) {
                return;
            }

            me.touchCoords.stopX = msPointerEnabled ? e.clientX : e.touches[0].clientX;
            me.touchCoords.stopY = msPointerEnabled ? e.clientY : e.touches[0].clientY;

            var offsetX = me.touchCoords.startX - me.touchCoords.stopX,
                absX = Math.abs(offsetX),
                absY = Math.abs(me.touchCoords.startY - me.touchCoords.stopY);

            if (typeof me.horizontal !== 'undefined') {
                if (offsetX !== 0) {
                    e.preventDefault();
                }
            } else {
                if (absX > absY) {
                    me.horizontal = true;
                    if (offsetX !== 0) {
                        e.preventDefault();
                    }
                    if (me.iscroll && me.iscroll.enabled) {
                        me.iscroll.disable();
                    }
                    clearTimeout(me.androidTouchMoveTimeout);
                } else {
                    delete me.touchCoords;
                    me.horizontal = false;
                    return;
                }
            }

            var itemWidth = me.getItemWidth(),
                translateX = me.activeIndex * itemWidth,
                active = me.activeIndex,
                last = me.getLastIndex();

            /*if ((active === 0 && offsetX < 0) || (active == last && offsetX > 0)) {
                translateX += Math.ceil(offsetX / Math.log(Math.abs(offsetX)));
            } else {
                translateX += offsetX;
            }*/
            if (absX < itemWidth) {
                // me.wrap.style[transform] = 'translate3d(' + -translateX + 'px, 0px, 0px)';
                me._slipDistance(active, offsetX);
            }
        },

        // private
        onTouchEnd: function(e) {
            clearTimeout(this.androidTouchMoveTimeout);
            clearTimeout(this.touchMoveTimeout);
            this.el.removeEventListener(TOUCH_EVENTS.move, this, false);
            this.el.removeEventListener(TOUCH_EVENTS.end, this, false);

            if (this.touchCoords) {
                var me = this,
                    itemWidth = this.getItemWidth(),
                    absX = Math.abs(this.touchCoords.startX - this.touchCoords.stopX),
                    isSlideRight = this.touchCoords.startX > this.touchCoords.stopX ? true : false, //判断是否向左滑动
                    active = this.activeIndex,
                    transIndex;

                if (!isNaN(absX) && absX !== 0) {
                    if (absX > itemWidth) {
                        absX = itemWidth;
                    }
                    if (absX >= 80 || (e.timeStamp - this.touchCoords.timeStamp < 200)) {
                        if (this.touchCoords.startX > this.touchCoords.stopX) {
                            transIndex = active + 1;
                        } else {
                            transIndex = active - 1;
                        }
                    } else {
                        transIndex = active;
                    }

                    this.to(transIndex, false, isSlideRight);

                    delete this.touchCoords;
                }
            }

            this.resetStatus();
        },

        resetStatus: function() {
            if (this.iscroll) this.iscroll.enable();
            if (this.autoPlay) this.run();
        },

        refresh: function() {
            var last = this.getLastIndex();
            this.items = slice.call(this.wrap.children, 0);
            if (this.activeIndex > last) {
                this.to(last, true);
            }
        },

        handleEvent: function(e) {
            switch (e.type) {
                case TOUCH_EVENTS.start:
                    this.onTouchStart(e);
                    break;
                case TOUCH_EVENTS.move:
                    this.onTouchMove(e);
                    break;
                case TOUCH_EVENTS.end:
                    this.onTouchEnd(e);
                    break;
                case 'click':
                    if (e.currentTarget == this.prevEl) {
                        this.onPrevClick(e);
                    } else if (e.currentTarget == this.nextEl) {
                        this.onNextClick(e);
                    }
                    break;
            }
        },

        /**
         * 销毁
         */
        destroy: function() {
            this.destroyed = true;
            this.stop();
            if (this.prevEl) {
                this.prevEl.removeEventListener('click', this, false);
                this.prevEl = null;
            }
            if (this.nextEl) {
                this.nextEl.removeEventListener('click', this, false);
                this.nextEl = null;
            }
            this.indicators = null;
            this.el.removeEventListener(TOUCH_EVENTS.start, this, false);
            this.el.removeEventListener(TOUCH_EVENTS.move, this, false);
            this.el.removeEventListener(TOUCH_EVENTS.end, this, false);
            window.removeEventListener( 'onorientationchange' in window ? 'orientationchange' : 'resize', this._resetInitPosition, false );
            this.el = this.wrap = this.items = null;
            this.iscroll = null;
        }
    };

    dummyStyle = null;

    if (typeof define === "function" && (define.amd || seajs)) {
        define('slidewidget', [], function() {
            return Slide;
        });
    }

    window.Slide = Slide;

})(window);