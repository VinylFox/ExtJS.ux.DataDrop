Ext.ns('Ext.ux.grid');
/**
 * @author Shea Frederick - http://www.vinylfox.com
 * @contributor Nigel (Animal) White, Andrea Giammarchi & Florian Cargoet
 * @class Ext.ux.grid.DataDrop
 * @singleton
 * <p>A plugin that allows data to be dragged into a grid from spreadsheet applications (tabular data).</p>
 * <p>Requires the Override.js file which adds mouse event forwarding capability to ExtJS</p>
 * <p>Sample Usage</p>
 * <pre><code>
 {
     xtype: 'grid',
     ...,
     plugins: [Ext.ux.grid.DataDrop],
     ...
 }
 * </code></pre>
 */
Ext.ux.grid.DataDrop = (function(){

    var lineEndRE = /\r\n|\r|\n/,
        sepRe = /\s*\t\s*/;

    //  After the GridView has been rendered, insert a static transparent textarea over it.
    function onViewRender(){
        var v = this.view;
        if (v.mainBody) {
            this.textEl = Ext.DomHelper.insertAfter(v.scroller, {
                tag: 'textarea',
                id: Ext.id(),
                value: '',
                style: {
                    'font-size': '1px',
                    border: '0px none',
                    overflow: 'hidden',
                    color: '#fff',
                    position: 'absolute',
                    top: v.mainHd.getHeight() + 'px',
                    left: '0px',
                    'background-color': '#fff',
                    margin: 0,
                    cursor: 'default'
                }
            }, true);
            this.textEl.setOpacity(0.1);
            this.textEl.forwardMouseEvents();
            this.textEl.on({
                mouseover: function(){
                    Ext.TaskMgr.start(this.changeValueTask);
                },
                mouseout: function(){
                    Ext.TaskMgr.stop(this.changeValueTask);
                },
                scope: this
            });
            resizeDropArea.call(this);
        }
    }
    
    //  on GridPanel resize, keep scroller height correct to accomodate textarea.
    function resizeDropArea(){
        if (this.textEl) {
            var v = this.view,
                sc = v.scroller,
                scs = sc.getSize,
                s = {
                    width: sc.dom.clientWidth || (scs.width - v.getScrollOffset() + 2),
                    height: sc.dom.clientHeight || scs.height
                };
            this.textEl.setSize(s);
        }
    }
    
    //  on change of data in textarea, create a Record from the tab-delimited contents.
    function dataDropped(e, el){
        var nv = el.value;
        el.blur();
        if (nv !== '') {
          if (this.fireEvent('beforedatadrop',this,nv,el)){
            var store = this.getStore(), Record = store.recordType;
            el.value = '';
            var rows = nv.split(lineEndRE), cols = this.getColumnModel().getColumnsBy(function(c){
                return !c.hidden;
            }), fields = Record.prototype.fields, recs = [];
            this.fireEvent('datadrop',this,rows);
            if (cols.length && rows.length) {
                for (var i = 0; i < rows.length; i++) {
                    var vals = rows[i].split(sepRe), data = {};
                    if (vals.join('').replace(' ', '') !== '') {
                        for (var k = 0; k < vals.length; k++) {
                            var fldName = cols[k].dataIndex;
                            var fld = fields.item(fldName);
                            data[fldName] = fld ? fld.convert(vals[k]) : vals[k];
                        }
                        var newRec = new Record(data);
                        recs.push(newRec);
                        if (!Ext.ux.grid.DataDrop.addBulk){
                          store.add(newRec);
                          if (Ext.ux.grid.DataDrop.highlightNewRows){
                            var idx = store.indexOf(newRec);
                            this.view.focusRow(idx);
                            Ext.get(this.view.getRow(idx)).highlight();
                          }
                        }
                    }
                }
                if (Ext.ux.grid.DataDrop.addBulk && recs && recs.length){
                  store.add(recs);
                  if (Ext.ux.grid.DataDrop.highlightNewRows){
                    for (var i = 0; i < recs.length; i++){
                      var idx = store.indexOf(recs[i]);
                      this.view.focusRow(idx);
                      Ext.get(this.view.getRow(idx)).highlight();
                    }
                  }
                }
                this.fireEvent('afterdatadrop',this,recs);
                resizeDropArea.call(this);
            }
          }else{
            el.value = '';
          }
        }
    }
    
    return {
        init: function(cmp){
            cmp.addEvents({
              'beforedatadrop': true,
              'datadrop': true,
              'afterdatadrop': true
            });
            Ext.apply(cmp, {
                changeValueTask: {
                    run: function(){
                        dataDropped.call(this, null, this.textEl.dom);
                    },
                    interval: 100,
                    scope: cmp
                },
                onResize: cmp.onResize.createSequence(resizeDropArea)
            });
            cmp.getView().afterRender = cmp.getView().afterRender.createSequence(onViewRender, cmp);
        }
    };
})();

/**
 * @cfg addBulk {boolean} set true to add all records at once, isntead of individually. 
 */
Ext.ux.grid.DataDrop.addBulk = true;
/**
 * @cfg highlightNewRows {boolean} set true to highlight rows upon insertion. 
 */
Ext.ux.grid.DataDrop.highlightNewRows = true;