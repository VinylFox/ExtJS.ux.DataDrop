Ext.ns('Ext.ux.grid');
/**
 * @author Shea Frederick - http://www.vinylfox.com
 * @class Ext.ux.grid.DataDrop
 * @extends Ext.AbstractPlugin
 *
 * <p>A plugin that allows data to be dragged into a grid from spreadsheet applications (tabular data).</p>
 * <p>Requires the Override.js file which adds mouse event forwarding capability to ExtJS</p>
 * <p>Sample Usage</p>
 * <pre><code>
 {
     xtype: 'grid',
     ...,
     plugins: [{ptype:'datadrop'}],
     ...
 }
 * </code></pre>
 * 
 * @alias plugin.datadrop
 * @ptype datadrop
 */
Ext.define('Ext.ux.grid.DataDrop', {
    extend: 'Ext.util.Observable',
    alias: 'plugin.datadrop',
    lineEndRE: /\r\n|\r|\n/,
    sepRe: /\s*\t\s*/,
    /**
     * @cfg addBulk {boolean} set true to add all records at once, isntead of individually. 
     */
    addBulk: false,
    /**
     * @cfg highlightNewRows {boolean} set true to highlight rows upon insertion. 
     */
    highlightNewRows: false,
    
    init: function(cmp) {
        this.cmp = cmp;
        this.view = this.cmp.view;
        this.store = this.cmp.store;
        this.cmp.addEvents({
            /**
             * @event beforedatadrop
             * Fires when data is dropped into the grid but has not yet been processed into records. Can return 
             * false to cancel processing.
             * @param {Ext.ux.grid.DataDrop} this
             * @param {String} nv the raw data that has been dropped onto the grid.
             */
            'beforedatadrop': true,
            /**
             * @event datadrop
             * Fires when the data has been processed and turned into rows but before they have been turned into 
             * records and inserted into the store. Can return false to cancel insertion into the store. This 
             * event is only fired if the data dropped was successfully turned into rows and columns.
             * @param {Ext.ux.grid.DataDrop} this
             * @param {Array} rows the rows of data as an array of objects (not Records yet).
             */
            'datadrop': true,
            /**
             * @event afterdatadrop
             * Fires after the data has been processed and inserted into the store.
             * @param {Ext.ux.grid.DataDrop} this
             * @param {Array} recs an array of the records of data that were inserted into the store.
             */
            'afterdatadrop': true
        });
        this.changeValueTask = {
            run: this.dataDropped,
            interval: 100,
            scope: this
        };
        this.view.on('viewready',this.onViewRender,this,{defer:200});
    },
    
    onViewRender: function(){
        var v = this.view;
        if (v.el) {
            this.id = Ext.id();
            this.textEl = this.createTextEl(v);
            this.textEl.setOpacity(0.001);
            this.textEl.suspendEvents = false;
            this.textEl.forwardMouseEvents();
            this.textEl.on({
                mouseover: function(){
                    Ext.TaskManager.start(this.changeValueTask);
                },
                mouseout: function(){
                    Ext.TaskManager.stop(this.changeValueTask);
                },
                scroll: function(ev){
                    this.view.el.scrollTo('top',ev.target.scrollTop,false);
                },
                scope: this
            });
                        
            this.view.el.on('scroll', function(ev){
                this.textEl.scrollTo('top',ev.target.scrollTop,false);
            }, this);
           
            this.resizeDropArea();
           
            Ext.getBody().on('paste', function(){
                this.dataDropped();
            }, this);
        }
    },
        
    // create the text element that is used to capture items dragged in from excel.
    createTextEl: function(v){
        var textEl = Ext.DomHelper.insertAfter(v.el, {
            tag: 'textarea',
            id: this.id+'-textel',
            html: this.getTextFiller(),
            style: {
                'font-size': '17px',
                border: '0px none',
                overflow: 'scroll',
                //color: '#fff',
                position: 'absolute',
                top: '0px',
                left: '0px',
                //'background-color': '#fff',
                margin: 0,
                cursor: 'default'
            }
        }, true);
        textEl.focus(100);
        return textEl;
    },
    
    // returns enough pipes to fill up the text area so the scroll event will fire within it and we can transfer that event to the grid scroll.
    getTextFiller: function(){
        var filler = '', fillLen = this.store.getCount(), i = 0;
        for (;i < fillLen; i++){
            filler = filler + '|\n';
        }
        return filler;
    },
    
    //  on GridPanel resize, keep text el height correct to cover grid view area.
    resizeDropArea: function(){
        if (this.textEl) {
            var v = this.view,
                sc = v.el,
                scs = sc.getSize(),
                s = {
                    width: scs.width - 18,
                    height: scs.height
                };
            this.textEl.setSize(s);
        }
    },
    
    //  on change of data in textarea, create a Record from the tab-delimited contents.
    dataDropped: function(){
        var nv = this.textEl.getValue().replace(/\|\n/g,'');
        this.textEl.show();
        this.textEl.blur();
        if (nv !== '') {
          nv = nv.replace(/\|/g,'');
          if (this.fireEvent('beforedatadrop',this,nv)){
            var store = this.store, Record = store.model;
            this.textEl.dom.value = '';
            this.textEl.update('');
            var rows = nv.split(this.lineEndRE), columns = this.view.getGridColumns(), fields = Record.prototype.fields, recs = [], cols = [];
            Ext.each(columns, function(col){
                if (!col.hidden){
                    cols.push(col);
                }
            });
            if (cols.length && rows.length && this.fireEvent('datadrop',this,rows) !== false) {
                for (var i = 0; i < rows.length; i++) {
                    var vals = rows[i].split(this.sepRe), data = {};
                    if (vals.length == 1){
                        vals
                    }else{
                        if (vals.join('').replace(' ', '') !== '') {
                            for (var k = 0; k < vals.length; k++) {
                                var fldName = cols[k].dataIndex;
                                var fld = fields.map[fldName];
                                data[fldName] = fld ? fld.convert(vals[k]) : vals[k];
                            }
                            var newRec = new Record(data);
                            recs.push(newRec);
                            if (!this.addBulk){
                              store.add(newRec);
                              if (this.highlightNewRows){
                                var idx = store.indexOf(newRec);
                                this.view.focusRow(idx);
                                Ext.get(this.view.getNode(idx)).highlight();
                              }
                            }
                        }
                    }
                }
                if (this.addBulk && recs && recs.length){
                  store.add(recs);
                  if (this.highlightNewRows){
                    for (var i = 0; i < recs.length; i++){
                      var idx = store.indexOf(recs[i]);
                      this.view.focusRow(idx);
                      Ext.get(this.view.getNode(idx)).highlight();
                    }
                  }
                }
                this.fireEvent('afterdatadrop',this,recs);
                this.resizeDropArea();
            }
            this.textEl.update(this.getTextFiller());
          }else{
            this.textEl.dom.value = '';
          }
        }
    }
});

