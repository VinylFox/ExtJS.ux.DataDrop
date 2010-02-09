Ext.apply(Ext, {
    num: function(v, defaultValue){
        v = Number(Ext.isEmpty(v) || Ext.isBoolean(v) ? NaN : v);
        return isNaN(v) ? defaultValue : v;
    },
    isBoolean: function(v){
        return typeof v === 'boolean';
    }
});

Ext.onReady(function(){

    Ext.get('masking').forwardMouseEvents();
    
    Ext.get('elone').on('click', function(e){
        var el = e.getTarget();
        if (el) {
            Ext.get(el).setStyle({
                'background-color': '#0f0'
            });
        }
    });
    
    Ext.get('eltwo').on({
        mouseover: function(e){
            var el = e.getTarget();
            if (el) {
                Ext.get(el).setStyle({
                    'border': 'solid 1px #000'
                });
            }
        },
        mouseout: function(e){
            var el = e.getTarget();
            if (el) {
                Ext.get(el).setStyle({
                    'border': 'none'
                });
            }
        }
    });
    
});
