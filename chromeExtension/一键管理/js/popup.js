$(function(){
	initAllBtn();
	db_init();
	listApp();
	initGloabBtn();
});

function initGloabBtn() {
	$("#change_icon_large").click(function(){
		log("change_icon_large click");
		if (localStorage[DISABLE_BTN_TYPE_KEY] != 'largeicon') {
			localStorage[DISABLE_BTN_TYPE_KEY] = 'largeicon';
			refresh();
		}
	});
	$("#chanage_icon_mid").click(function(){
		log("chanage_icon_mid click");
		if (localStorage[DISABLE_BTN_TYPE_KEY] != 'midicon') {
			localStorage[DISABLE_BTN_TYPE_KEY] = 'midicon';
			refresh();
		}
	});
	$("#app_setting").click(function(){
		openUrl("/html/options.html");
	});
}
function appContextmenu(ele) {
	var appId = ele.attr("app-id");
	var app = getApp(appId);
	console.log(app);
	var icon = app.icons?app.icons[app.icons.length-1].url:"/img/default.png";
	$("#modal_app_id").val(appId);
	$("#modal_header_img").attr("src",icon);
	$("#modal_header_title").text(app.name);
	$("#modal_body_name").html("<a href='"+app.homepageUrl+"' target='_blank'>"+app.name+"</a>")
	$("#modal_body_desc").text(app.description)
	$("#modal_body_img").attr("src",icon);
	var btnHtml = '';
	if (canCollect(app)) {
		btnHtml += '<button class="btn btn-primary btn-small" id="collect">'+i18n('collect')+'</button>&nbsp;&nbsp;';
	} else {
		btnHtml += '<button class="btn btn-primary btn-small" id="remove-collect">'+i18n('remove_collect')+'</button>&nbsp;&nbsp;';
	}
	if (app.isApp) {
		btnHtml += '<button class="btn btn-primary btn-small" id="run-app">'+i18n('run_app')+'</button>&nbsp;&nbsp;';
	}
	if (app.enabled) {
		btnHtml += '<button class="btn btn-primary btn-small" id="app-disable">'+i18n('app_disable')+'</button>&nbsp;&nbsp;';
	} else {
		btnHtml += '<button class="btn btn-primary btn-small" id="app-enable">'+i18n('app_enable')+'</button>&nbsp;&nbsp;';
	}
	btnHtml += '<button class="btn btn-primary btn-small" id="uninstall">'+i18n('uninstall')+'</button>&nbsp;&nbsp;';
	//btnHtml += '<button class="btn btn-primary btn-small">隐藏图标</button>&nbsp;&nbsp;';
	if (app.optionsUrl && app.optionsUrl != "") {
		btnHtml += '<button class="btn btn-primary btn-small" id="open-option">'+i18n('option')+'</button>&nbsp;&nbsp;';
	}
	$("#uninstall-real").text(i18n("uninstall"));
	$("#uninstall-cancel").text(i18n("cancel"));
	$("#modal_body_btns").html(btnHtml);
	$("#collect").click(function(){
		addCollect(1,$("#modal_app_id").val(), function(){$("#appOperation").modal('hide');refresh();});
	});
	$("#remove-collect").click(function(){
		console.log("#remove-collect");
		removeCollect(1,$("#modal_app_id").val(), function(){$("#appOperation").modal('hide');refresh();});
	});
	$("#run-app").click(function(){
		chrome.management.launchApp($("#modal_app_id").val());
	});
	$("#app-disable").click(function(){
		chrome.management.setEnabled($("#modal_app_id").val(),false,function(){$("#appOperation").modal('hide');refresh();})
	});
	$("#app-enable").click(function(){
		chrome.management.setEnabled($("#modal_app_id").val(),true,function(){$("#appOperation").modal('hide');refresh();})
	});
	$("#uninstall").click(function(){
		$("#modal_body_btns").hide();
		$("#modal_body_uninstall").show();
		$("#uninstall-real").click(function(){
			chrome.management.uninstall($("#modal_app_id").val(), {showConfirmDialog : false}, function(){$("#appOperation").modal('hide');refresh();})
		})
		$("#uninstall-cancel").click(function(){
			$("#modal_body_btns").show();
			$("#modal_body_uninstall").hide();
		});
	});
	$("#open-option").click(function(){
		var id = $("#modal_app_id").val();
		var app = getApp(appId);
		openUrl(app.optionsUrl);
	});
	$("#appOperation").modal({keyboard:true,show:true});
	return false;
}
function canCollect(app) {
	var lenGA = groupApps.length;
	for ( var i = 0; i < lenGA; i++) {
		var ga = groupApps[i];
		if (ga.gid == 1 && ga.aid == app.id) {
			return false;
		}
	}
	return true;
}
function appOptioinClick(action, id) {}

function appClick(ele){
	console.log("appClick");
	var appId = ele.attr("app-id");
	var app = getApp(appId);
	console.log(app);
	if (app.type.indexOf("inline_app") > -1) {
		openUrl(app.appLaunchUrl);
	} if (app.type.indexOf("app")>-1) {
		chrome.management.launchApp(appId);
		//openUrl(app.appLaunchUrl);
	} else if(app.type == "extension") {
		chrome.management.get(app.id, function (result){
			chrome.management.setEnabled(result.id, !result.enabled, refresh);
		});
	} 
}
function appDbClick(ele){
	console.log("appDbClick");
	appContextmenu(ele);
	$("#uninstall").click();
}

function getApp(id) {
	var len = apps.length, i = 0;
	for (i = 0; i < len; i++) {
		var app = apps[i];
		if (app.id == id) return app;
	}
	return null;
}
function groupApp(group, app, groupApps) {
	var lenGA = groupApps.length;
	for ( var i = 0; i < lenGA; i++) {
		var ga = groupApps[i];
		if (ga.gid == group.id && ga.aid == app.id) {
			groupAddApp(group,app);
		}
	}
	if (app.type.indexOf(group.system)>-1) {
		groupAddApp(group,app);
	}
}
function groupAddApp(group, app) {
	group.apps = group.apps || [];
	group.apps.push(app);
}

function disableAll(){
	console.log('disableAll');
	chrome.management.getAll(function (result){
		var t = '',len = result.length;
		for (var i = 0; i < len; i++){
			if(result[i].enabled && !isMe(result[i])) {
				t += (result[i].id + '|||');
				chrome.management.setEnabled(result[i].id, false);
			}
		}
		enabled = false;
		localStorage["enabled"] = 0;
		refresh();
		
		t = t.substr(0, t.length-3);
		localStorage[DISABLE_APP_KEY] = t;
		console.log(t);
	});
	
}
function enableAll(){
	console.log('enableAll');
	diableAppslist = localStorage[DISABLE_APP_KEY].split('|||');
    var len = diableAppslist.length;
	for (var i = 0; i < len; i++){
		chrome.management.setEnabled(diableAppslist[i], true);
	}
	enabled = true;
	localStorage["enabled"] = 1;
	refresh();
}