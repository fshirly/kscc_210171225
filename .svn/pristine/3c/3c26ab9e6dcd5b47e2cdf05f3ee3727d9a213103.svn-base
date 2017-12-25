define(["base"],function(base){
	var self = {};
	self.refreshGrid = function(grid){
		grid.ajax.reload();
	};
	self.treeTable = function(setting){
		var self = {};
		self.tmpRow = null;
		self.dg = function(data){
			if(data&&data.length>0){
				$(data).each(function(i,o){
					var row = document.createElement("tr");
					$(row).attr("data-tt-id",o.id);
					$(row).attr("data-tt-parent-id",o.pid);
					$(row).addClass("ui-treeTableChild");
					var s = "";
					$(setting.aoColumns).each(function(i1,o1){
						var type = o1.type?o1.type:null;
						switch(type){
							case "checkbox":
								s+="<td><input type='checkbox' class='cb' name='cb' data-level='"+o.level+"' value='"+o[o1.data]+"' pid='"+o.pid+"'/></td>";
								break;

							default:
								s+="<td>"+(function(){return o[o1.data] ? o[o1.data] : "--"})()+"</td>";
								break;
						}
					});
					$(row).html(s);
					$(self.tmpRow).after(row);
					self.tmpRow = row;
					self.dg(o.children);
				});
			}
		};
		var data = setting.json.data;

		$(data).each(function(i,o){
			if(o.children&&o.children.length>0){
				self.tmpRow = $(setting.nTable).find("tbody tr[rootrow='"+i+"']");
				self.dg(o.children);
			}
		});
		base.treeTable({
			container:setting.nTable,
			setting:{
				expandable:true
			}
		});
	};
	return self;
});