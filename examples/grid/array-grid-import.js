Ext.require([
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.util.*',
    'Ext.state.*'
]);

Ext.onReady(function() {
    Ext.QuickTips.init();
    
    // setup the state provider, all state information will be saved to a cookie
    Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));

    // sample static data for the store
    var myData = [
        ['3m Co',                               'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',71.72, 0.02,  0.03,  '9/1 12:00am'],
        ['Alcoa Inc',                           'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',29.01, 0.42,  1.47,  '9/1 12:00am'],
        ['Altria Group Inc',                    'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',83.81, 0.28,  0.34,  '9/1 12:00am'],
        ['American Express Company',            'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',52.55, 0.01,  0.02,  '9/1 12:00am'],
        ['American International Group, Inc.',  'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',64.13, 0.31,  0.49,  '9/1 12:00am'],
        ['AT&T Inc.',                           'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',31.61, -0.48, -1.54, '9/1 12:00am'],
        ['Boeing Co.',                          'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',75.43, 0.53,  0.71,  '9/1 12:00am'],
        ['Caterpillar Inc.',                    'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',67.27, 0.92,  1.39,  '9/1 12:00am'],
        ['Citigroup, Inc.',                     'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',49.37, 0.02,  0.04,  '9/1 12:00am'],
        ['E.I. du Pont de Nemours and Company', 'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',40.48, 0.51,  1.28,  '9/1 12:00am'],
        ['Exxon Mobil Corp',                    'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',68.1,  -0.43, -0.64, '9/1 12:00am'],
        ['General Electric Company',            'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',34.14, -0.08, -0.23, '9/1 12:00am'],
        ['General Motors Corporation',          'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',30.27, 1.09,  3.74,  '9/1 12:00am'],
        ['Hewlett-Packard Co.',                 'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',36.53, -0.03, -0.08, '9/1 12:00am'],
        ['Honeywell Intl Inc',                  'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',38.77, 0.05,  0.13,  '9/1 12:00am'],
        ['Intel Corporation',                   'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',19.88, 0.31,  1.58,  '9/1 12:00am'],
        ['International Business Machines',     'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',81.41, 0.44,  0.54,  '9/1 12:00am'],
        ['Johnson & Johnson',                   'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',64.72, 0.06,  0.09,  '9/1 12:00am'],
        ['JP Morgan & Chase & Co',              'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',45.73, 0.07,  0.15,  '9/1 12:00am'],
        ['McDonald\'s Corporation',             'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',36.76, 0.86,  2.40,  '9/1 12:00am'],
        ['Merck & Co., Inc.',                   'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',40.96, 0.41,  1.01,  '9/1 12:00am'],
        ['Microsoft Corporation',               'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',25.84, 0.14,  0.54,  '9/1 12:00am'],
        ['Pfizer Inc',                          'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',27.96, 0.4,   1.45,  '9/1 12:00am'],
        ['The Coca-Cola Company',               'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',45.07, 0.26,  0.58,  '9/1 12:00am'],
        ['The Home Depot, Inc.',                'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',34.64, 0.35,  1.02,  '9/1 12:00am'],
        ['The Procter & Gamble Company',        'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',61.91, 0.01,  0.02,  '9/1 12:00am'],
        ['United Technologies Corporation',     'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',63.26, 0.55,  0.88,  '9/1 12:00am'],
        ['Verizon Communications',              'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',35.57, 0.39,  1.11,  '9/1 12:00am'],
        ['Wal-Mart Stores, Inc.',               'http://www.3m.com','http://www.logostage.com/logos/3m.jpg',45.45, 0.73,  1.63,  '9/1 12:00am']
    ];

    /**
     * Custom function used for column renderer
     * @param {Object} val
     */
    function change(val) {
        if (val > 0) {
            return '<span style="color:green;">' + val + '</span>';
        } else if (val < 0) {
            return '<span style="color:red;">' + val + '</span>';
        }
        return val;
    }

    /**
     * Custom function used for column renderer
     * @param {Object} val
     */
    function pctChange(val) {
        if (val > 0) {
            return '<span style="color:green;">' + val + '%</span>';
        } else if (val < 0) {
            return '<span style="color:red;">' + val + '%</span>';
        }
        return val;
    }

    function link(val,meta,rec) {
        return '<a href="' + val + '" style="cursor:pointer;">' + rec.get('company') + '</a>';
    }

    function image(val,meta,rec) {
        return '<img src="' + val + '" height="22" alt="' + rec.get('company') + '">';
    }

    // create the data store
    var store = Ext.create('Ext.data.ArrayStore', {
        fields: [
           {name: 'company'},
           {name: 'website'},
           {name: 'logo'},
           {name: 'price',      type: 'float'},
           {name: 'change',     type: 'float'},
           {name: 'pctChange',  type: 'float'},
           {name: 'lastChange', type: 'date', dateFormat: 'n/j h:ia'}
        ],
        data: myData
    });

    // create the Grid
    var grid = Ext.create('Ext.grid.Panel', {
        store: store,
        stateful: true,
        stateId: 'stateGrid',
        columns: [
            {
                text     : 'Company',
                flex     : 1,
                sortable : false,
                dataIndex: 'company'
            },
            {
                text     : 'Web Site',
                flex     : 1,
                sortable : false,
                dataIndex: 'website',
                renderer : link
            },
            {
                text     : 'Logo',
                flex     : 1,
                sortable : false,
                dataIndex: 'logo',
                renderer : image
            },
            {
                text     : 'Price',
                width    : 75,
                sortable : true,
                renderer : 'usMoney',
                dataIndex: 'price'
            },
            {
                text     : 'Change',
                width    : 75,
                sortable : true,
                renderer : change,
                dataIndex: 'change'
            },
            {
                text     : '% Change',
                width    : 75,
                sortable : true,
                renderer : pctChange,
                dataIndex: 'pctChange'
            },
            {
                text     : 'Last Updated',
                width    : 85,
                sortable : true,
                renderer : Ext.util.Format.dateRenderer('m/d/Y'),
                dataIndex: 'lastChange'
            },
            {
                xtype: 'actioncolumn',
                width: 50,
                items: [{
                    icon   : '../shared/icons/fam/delete.gif',  // Use a URL in the icon config
                    tooltip: 'Sell stock',
                    handler: function(grid, rowIndex, colIndex) {
                        var rec = store.getAt(rowIndex);
                        alert("Sell " + rec.get('company'));
                    }
                }, {
                    getClass: function(v, meta, rec) {          // Or return a class from a function
                        if (rec.get('change') < 0) {
                            this.items[1].tooltip = 'Hold stock';
                            return 'alert-col';
                        } else {
                            this.items[1].tooltip = 'Buy stock';
                            return 'buy-col';
                        }
                    },
                    handler: function(grid, rowIndex, colIndex) {
                        var rec = store.getAt(rowIndex);
                        alert((rec.get('change') < 0 ? "Hold " : "Buy ") + rec.get('company'));
                    }
                }]
            }
        ],
        selModel: {
            selType: 'rowmodel'
        },
        height: 350,
        width: 600,
        title: 'Array Grid for Importing',
        renderTo: 'grid-example',
        viewConfig: {
            stripeRows: true
        },
        plugins: [{
            ptype: 'datadrop'
        }]
    });

});
