/**
 * @author Nigel (Animal) White
 * @contributor Shea Frederick - http://www.vinylfox.com
 * <p>Override to allow mouse event forwarding through masking layers - .</p>
 */
Ext.override(Ext.Element, (function(){
    var doc = document,
        SCROLLLEFT = 'scrollLeft',
        SCROLLTOP = 'scrollTop',
        HTMLEvts = /^(resize|load|unload|abort|error)$/,
        mouseEvts = /^(click|dblclick|mousedown|mouseup|mouseover|contextmenu|mousenter|mouseleave)$/,
        UIEvts = /^(focus|blur|select|change|reset|keypress|keydown|keyup)$/,
        onPref = /^on/;

    function getScroll() {
        var dd = doc.documentElement, 
            db = doc.body;
        if(dd && (dd[SCROLLTOP] || dd[SCROLLLEFT])){
            return [dd[SCROLLLEFT], dd[SCROLLTOP]];
        }else if(db){
            return [db[SCROLLLEFT], db[SCROLLTOP]];
        }else{
            return [0, 0];
        }
    }

    return {
        /**
         * Fires an event through this Element.
         * @param e {String} Event name. eg: 'mousedown'.
         * @param initializer {Function
         */
        fireEvent: Ext.isIE ? function(e, evtInitializer) {
            var evt;
            e = e.toLowerCase();
            if (!onPref.test(e)) {
                e = 'on' + e;
            }
            if (Ext.isFunction(evtInitializer)) {
                evt = document.createEventObject();
                evtInitializer(evt);
            } else {
                evt =  evtInitializer;
            }
            this.dom.fireEvent(e, evt);
        } : function(e, evtInitializer) {
            var evt;
            e = e.toLowerCase();
            e.replace(onPref, '');
            if (mouseEvts.test(e)) {
                var b = {};
                if (Ext.isFunction(this.getBox)) {
                    b = this.getBox();
                } else {
                    b.width = this.getWidth();
                    b.height = this.getHeight();
                    b.x = this.getX();
                    b.y = this.getY();
                }
                var x = b.x + b.width / 2,
                    y = b.y + b.height / 2;
                evt = document.createEvent("MouseEvents");
                evt.initMouseEvent(e, true, true, window, (e=='dblclick')?2:1, x, y, x, y, false, false, false, false, 0, null);
            } else if (UIEvts.test(e)) {
                evt = document.createEvent("UIEvents");
                evt.initUIEvent(e, true, true, window, 0);
            } else if (HTMLEvts.test(e)) {
                evt = document.createEvent("HTMLEvents");
                evt.initEvent(e, true, true);
            }
            if (evt) {
                if (Ext.isFunction(evtInitializer)) {
                    evtInitializer(evt);
                }
                this.dom.dispatchEvent(evt);
            }
        },

        /**
         * Forwards mouse events from a floating mask element to the underlying document.
         */
        forwardMouseEvents: function(evt) {
            var me = this,
                xy, t, lastT,
                evts = [ 'mousemove', 'mousedown', 'mouseup', 'dblclick'];

            me.on('mouseout', function() {
                if (lastT) {
                    Ext.fly(lastT).fireEvent('mouseout');
                    lastT = null;
                }
            });

            for (var i = 0, l = evts.length; i < l; i++) {
                this.on(evts[i], function(e) {
                    var s = (Ext.isGecko) ? getScroll() : [0, 0],
                        be = e.browserEvent,
                        x = Ext.num(be.pageX, be.clientX) - s[0],
                        y = Ext.num(be.pageY, be.clientY) - s[1],
                        et = be.type,
                        t;

                    if (!me.forwardingSuspended && me.isVisible()) {
                        e.stopPropagation();
                        me.forwardingSuspended = true;
                        me.hide();
                        t = Ext.get(document.elementFromPoint(x, y));
                        me.show();
                        if (!t) {
                            if (lastT){
                                lastT.fireEvent('mouseout');
                            }
                            lastT = t;
                            delete me.forwardingSuspended;
                            return;
                        }
                        if (t === lastT) {
                            if (et == 'mouseup') {
                                t.fireEvent('click');
                            }
                        } else {
                            if (lastT) {
                                lastT.fireEvent('mouseout');
                            }
                            t.fireEvent('mouseover');
                        }
                        if (et !== 'mousemove') {
                            if (t.dom.fireEvent) {
                                t.fireEvent(et, be);
                            } else {
                                e = document.createEvent("MouseEvents");
                                e.initMouseEvent(et, true, true, window, be.detail, be.screenX, be.screenY, be.clientX, be.clientY,
                                    be.ctrlKey, be.altKey, be.shiftKey, be.metaKey, be.button, null);
                                t.dom.dispatchEvent(e);
                            }
                        }
                        lastT = t;
                        delete me.forwardingSuspended;
                    }
                });
            }
        }
    };
})());