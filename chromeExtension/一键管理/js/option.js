//window.location.href="http://www.onekeyplugin.com/manager/feed.html";
$(document).ready(function(){
	var newBody = Mustache.to_html($('#main-container').html(), chrome.i18n.getMessage);
	$($('#main-container')).html(newBody);
	
	initGroupManager();
});
var groups = [];
function initGroupManager() {
	initGroupTable();
	$("#createGroup").click(function(){
		$("#createGroupSave").removeAttr("updateId");
		$("#inputGroupName").val("");
		$("#inputGorupOrder").val("");
		$("#create_group_dialog").modal('toggle');
	});
	$("#createGroupSave").click(function(){
		var updateId = $(this).attr("updateId");
		var groupName = $("#inputGroupName").val();
		var groupOrder = $("#inputGorupOrder").val();
		if (groupName == "" || groupOrder == "") {
			return;
		}
		if (updateId == undefined || updateId == "") {
			var maxIdSQL = "SELECT MAX(ID) AS \"mid\" FROM GROUPS";
			db_exe(maxIdSQL, null, function(tx,results){
				var mid = results.rows.item(0).mid;
				var id = mid+1;
				db_dml("INSERT INTO GROUPS VALUES ("+id+",'"+groupName+"',"+groupOrder+",'user')");
				initGroupTable();
				$("#create_group_dialog").modal('toggle');
			},null);
		} else {
			var updateSQL = "UPDATE GROUPS SET NAME='"+groupName+"',NUM="+groupOrder+" WHERE ID="+updateId;
			db_exe(updateSQL, null, function(tx,results){
				initGroupTable();
				$("#create_group_dialog").modal('toggle');
			},null);
		}
		return;
	});
}

function initGroupTable() {
	var table = $("#group_manager_table");
	findGroups(function(dbGroups){
		groups = dbGroups;
		var tableBody = $("#group_manager_table_body");
		tableBody.empty();
		for ( var i = 0; i < groups.length; i++) {
			var g = groups[i];
			log(g);
			var name = g.system=='user'?g.name:i18n(g.name);
			var managerApp = (g.system=='mark'||g.system=='user')?('<a href="javascript:void(0);" class="managerApp" id="'+g.id+'">'+i18n('managerapp')+'</a>'):i18n('managerapp');
			var deleteGroup = g.system=='user'?('<a href="javascript:void(0);" class="deleteGroup" id="'+g.id+'">'+i18n('groupdelete')+'</a>&nbsp;&nbsp;'):'';
			var modifyGroup = g.system=='user'?('<a href="javascript:void(0);" class="modifyGroup" id="'+g.id+'">'+i18n('groupmodify')+'</a>'):'';
			tableBody.append('<tr><td>'+g['num']+'</td><td>'+name+'</td><td><i class="icon-list-alt"></i>'+managerApp+'</td><td>'+deleteGroup+modifyGroup+'</td></tr>');
		}
		$('.managerApp').click(function(){
			var id = $(this).attr("id");
			$("#managerapp_group_dialog").modal('toggle');
			managerAppFn(id);
		});
		$('.deleteGroup').click(function(){
			var id = $(this).attr("id");
			deleteGroupFn(id);
		});
		$('.modifyGroup').click(function(){
			var id = $(this).attr("id");
			modifyGroupFn(id);
		});
	});
}
function deleteGroupFn(id) {
	var deleteSQL = "DELETE FROM GROUPS WHERE ID="+id;
	db_exe(deleteSQL, null, function(tx,results){
		initGroupTable();
	},null);
}
function modifyGroupFn(id){
	var group = getGroup(id);
	$("#createGroupSave").attr("updateId",group.id);
	$("#inputGroupName").val(group.name);
	$("#inputGorupOrder").val(group.num);
	$("#create_group_dialog").modal('toggle');
	log(group);
}
function getGroup(id) {
	var len = groups.length, i = 0;
	for (i = 0; i < len; i++) {
		var g = groups[i];
		if (g.id == id) return g;
	}
	return null;
}
function managerAppFn(id){
	log("managerAppFn");
	var ul = $("#show_all_apps_ul");
	chrome.management.getAll(function (apps){
		findTheGroupApps(id,function(groupApps){
			apps = apps.concat(inlineApp);
			ul.empty();
			for ( var i = 0; i < apps.length; i++) {
				var app = apps[i];
				if (isMe(app)) continue;
				var icon = app.icons?app.icons[app.icons.length-1].url:"/img/default.png";
				icon += '?grayscale=true';
				var appHtml = '<li class="span1"><div class="thumbnail" id="app_'+app.id+'" app-id='+app.id+'>'+
								'<img src="'+icon+'" alt="">'+
								'<span class="label'+'" title="'+app.description+'">'+app.name+'</span>'+
							'</div></li>'+
								'';
				ul.append(appHtml);
			}
			for ( var i = 0; i < groupApps.length; i++) {
				var ga = groupApps[i];
				$("#app_"+ga.aid).attr("isCollect","true");
				var icon = $("#app_"+ga.aid+" img");
				icon.attr("src",normalIcon(icon.attr("src")));
			}
			$(".thumbnail").click(function () {
			    var ele = $(this);
			    var aid = ele.attr("app-id");
			    var isCollection = ele.attr("isCollect");
			    if (isCollection == "true"){
			    	removeCollect(id,aid,function(){
			    		managerAppFn(id);
			    	});
			    } else {
			    	addCollect(id,aid,function(){
			    		managerAppFn(id);
			    	});
			    }
			});
		});
	});
}
function normalIcon(url) {
	var a = url.split("?");
	if (isArray(a) && a.length > 0) {
		return a[0];
	} else {
		return a;
	}
}
function isArray(obj){ 
	return (typeof obj=='object')&&obj.constructor==Array; 
} 