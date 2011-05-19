
(function($) {
  
        
   $.fn.couchview = function(options) {

   var config =  $.extend({}, $.fn.couchview.defaults, options);
    var grids= {};
 
     return this.each(function() {
            var $this = $(this);
            var id = $this.attr('id');
            var opts = $.meta ?  $.extend({}, config, $this.data()) : config;
            grids[id] =  new Grid($this, opts);
			var grid = grids[id];
            $.fn.couchview.header(grid, $this, opts, {});
            grid.load();
			$.fn.couchview.pager(grid, $this, opts, {});
        }); 
        
       };
      
   
	function validate(type, value) {
			switch( type ) { 
					case "Number":
						return Number(value);
					case "Boolean":
						return new Boolean(value);
					default:
						return value;
				}
	}
   
   
   function Grid (obj, options) {
        this.obj = obj;
        this.options = options;
		this.host = options.host;
		this.db = options.db;
		this.doc = options.doc;
		this.view = options.view;
        this.limit = options.limit;
		this.loader = options.loader
	
        this.offset = 0;
        this.total_rows =0;
        this.rows=[];
        this.data = {},
        this.descending = false;
        var grid = this;
        this.load = function () {
			this.loader(this.host, this.db, this.doc, this.view, this.offset, this.limit, this.descending, function (data) {
				grid.limit = data['rows'].length;
				grid.offset = data['offset'];
				grid.total_rows = data['total_rows'];
				$.fn.couchview.table(grid, obj, options, data);
				obj.find('.pager-page').html(grid.offset/grid.limit+1);
				obj.find('.pager-page-total').html(Math.ceil(grid.total_rows/grid.limit));
                obj.find('.edit').editable(function(value, settings) {
                var _id = $(this).attr("_id");
				 var id = $(this).attr("id");
				var selector = "#"+obj.attr("id")+" [_id="+_id+"]";
				var doc = new Object();
				
                $(selector).each(function(index,element) {
					var field = $(this).attr("id");
					if (id == field)
						doc[field] = validate($(this).attr("field_type"), value);
					else
						doc[field] =  validate($(this).attr("field_type"),$(this).html());
                }
                );
				doc._id = _id;
				doc._rev = $(this).attr("_rev");
				//alert(JSON.stringify(doc));
				
				var uri = grid.host + "/" +grid.db+ "/" +doc._id;
				//alert(uri);
				$.ajax({
					type: 'PUT',
					url: uri,
					dataType: "json",
					contentType: "application/json", 
					data: JSON.stringify(doc),
					success: function(data, textStatus, request) {
							// alert("saved"+textStatus);
							 //alert(JSON.stringify(data));
							 $(selector).each(function() {
								$(this).attr("_rev", data.rev);
							 });
							
					},
					error : function(XMLHttpRequest, textStatus, errorThrown) {
							alert('failed:'+textStatus, +', '+errorThrown);
							obj.html('failed:'+textStatus, +', '+errorThrown);
							obj.find('.status').html("Loaded:"+ textStatus+" - "+ request)
						}
				});
				
                //
                //    doc[$(this).attr("id")] = value;
                //    doc = db.save(doc);
                //    $(this).attr("_rev", doc._rev);
                return(value);
            
                });
                 
			});
			//obj.find('.status').html("Loaded:"+ textStatus+" - "+ request);	
        };
    }
   
   
 
    

	$.fn.couchview.CrossOriginLoader = function (host, database, doc, view, line, pagesz, order, onSuccess) {
        var params =  {limit: pagesz, skip: line, descending: order};
		var url = host+'/'+database+'/_design/'+doc+'/_view/'+view;
		//alert('CrossOriginLoader');
        $.ajax({
                url: url,
                dataType: "jsonp",
                contentType: "application/json", 
                data: params,
                success: function(data, textStatus, request) {
						//alert("LOADED"+textStatus);
						onSuccess(data);
				},
				error : function(XMLHttpRequest, textStatus, errorThrown) {
                        alert("NOT LOADED"+textStatus);
                        obj.html('failed:'+textStatus, +', '+errorThrown);
                        obj.find('.status').html("Loaded:"+ textStatus+" - "+ request)
                    }
            });
			
	};
		
	$.fn.couchview.LocalLoader = function (host, database, doc, view, line, pagesz, order, onSuccess) {
		CouchDB.host = window.location.host;
		CouchDB.inBrowser = true;
		var params =  {limit: pagesz, skip: line, descending: order};
		var url = host+'/'+database+'/_design/'+doc+'/_view/'+view;
		
        var params =  {limit: pagesz, skip: line, descending: order};
        $.ajax({
                url: url,
                dataType: "json",
                contentType: "application/json", 
                data: params,
                success: function(data, textStatus, request) {
						onSuccess(data);
				},
				error : function(XMLHttpRequest, textStatus, errorThrown) {
                        alert("NOT LOADED"+textStatus);
                        obj.html('failed:'+textStatus, +', '+errorThrown);
                        obj.find('.status').html("Loaded:"+ textStatus+" - "+ request)
                    }
            });
			
	};
		  
       
     $.fn.couchview.header = function (grid, obj, options, data) {
            obj.find('.data-sort').click(function(event){
                if (this.id != grid.view) {
                    grid.view = this.id;
                } else {
                    grid.descending = !grid.descending;
                }
                grid.load();
            });
        };   
        
	$.fn.couchview.pager = function (grid, obj, options, data) {
            obj.find('.pager-first').click(function(event){
                grid.offset=0;
                grid.load();
            });
             obj.find('.pager-prev-page').click(function(event){
                grid.offset = grid.offset >= grid.limit ? grid.offset- grid.limit : 0;
                grid.load();
            });
            obj.find('.pager-prev').click(function(event){
                grid.offset = grid.offset > 0 ? grid.offset- 1 : 0;
                grid.load();   
            });
             obj.find('.pager-next').click(function(event){
                grid.offset =  grid.offset+1;
                grid.load();
            });
             obj.find('.pager-next-page').click(function(event){
                var g = grid;
                grid.offset = grid.offset + grid.limit < grid.total_rows ? grid.offset + grid.limit: grid.offset;
                grid.load();
            });
             obj.find('.pager-last').click(function(event){
               grid.offset=grid.total_rows;
                grid.load();
            }); 
        };   
        //
		
		
     $.fn.couchview.table = function (grid, obj, options, data) {
            var anchor = obj.find('.data-body');
            if (grid.rows.length == 0) {
                var evenRowTemplate = obj.find('.data-row-even');
                var oddRowTemplate = null;
                if (evenRowTemplate.length  == 0) { 
                    evenRowTemplate = obj.find('.data-row');
					
                    oddRowTemplate = evenRowTemplate;
                } else {
                    oddRowTemplate = obj.find('.data-row-odd');   
                }
               for (var i=0; i < grid.limit; i++) {
                    grid.rows[i] = i % options.row_mod ==0 ? evenRowTemplate.clone() : oddRowTemplate.clone() ;
                   grid.rows[i].appendTo(anchor);
                }
                evenRowTemplate.hide();
                oddRowTemplate.hide();
            }
          
            $.each(data['rows'], function(rowCount, row) {
                        grid.data[row['value']['_id']] = row['value'];
					//	grid.rows[rowCount] = rowCount+grid.offset % options.row_mod ==0 ? evenRowTemplate.clone() : oddRowTemplate.clone() ;
                    //    grid.rows[rowCount].appendTo(anchor);
   					//    grid.rows[rowCount].attr('record', row);
                        grid.rows[rowCount].find('.field').each(function(index, cell) {
                            var record = row;
                            var id = cell.id;
                            var el = $(cell);
                            el.html(record['value'][id]);
                            el.attr({
                                _id: record['value']['_id'],
                                _rev: record['value']['_rev']
                                }); 
                    });
            });
            
        };   
          
   
   
   $.fn.couchview.defaults = {
        limit: 10,
        row_mod: 2,
        view: 'id',
		doc: 'reports',
        editable: false,
        recordid: '_id',
		loader: $.fn.couchview.LocalLoader,
    };
 
 })(jQuery);
