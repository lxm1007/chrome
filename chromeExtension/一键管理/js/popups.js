if (typeof(localStorage.enabled) === "undefined") {
    localStorage.enabled = 1;
}
var enabled = !!parseInt(localStorage["enabled"]);
var apps = [];
var groupApps = [];
var DISABLE_APP_KEY = "disable_app_key";
var DISABLE_BTN_TYPE_KEY = "ICON_TYPE";
var TimeFn = null;
var groups = [];
if (typeof(localStorage[DISABLE_BTN_TYPE_KEY]) == "undefined") {
	localStorage[DISABLE_BTN_TYPE_KEY] = 'midicon';
}
function openUrl(url) {
	chrome.tabs.query({url:url},function(tabs){
		if (tabs && tabs.length && tabs.length>0) {
			tabs.forEach(function(tab){
				chrome.tabs.update(tab.id,{active:true});
			});
		} else {
			chrome.tabs.create({
				url : url,
				selected : true,
			},function(){});
		}
	});
}
function initAllBtn() {
	console.log("initAllBtn");
	var btn = $("#onekeybtn");
	btn.unbind('click');
	if (enabled) {
		btn.text(i18n("onekeydisable"));
		btn.click(disableAll);
	} else {
		btn.text(i18n("onekeyenable"));
		btn.click(enableAll);
	}
}
function listApp() {
	chrome.management.getAll(function (result){
        operateApps(result);
	});
}
function operateApps(installApps) {
	findGroups(function(dbGroups){
		findGroupApp(function(dbGroupApps){
			groups = dbGroups;
			groupApps = dbGroupApps;
			apps = installApps;
			apps = apps.concat(inlineApp);
			var len = apps.length, i = 0;
			for (i = 0; i < len; i++) {
				var app = apps[i];
				if(isMe(app)) continue;
				var lengroup = groups.length, j;
				for (j = 0; j < lengroup; j++){
					var group = groups[j];
					groupApp(group,app,groupApps);
				}
			}
			showView();
		});
	});
}
function groupName(group) {
	if (group && group.id <=4) {
		return i18n(group.name);
	}
	return group.name;
}

function showView() {
	$("#groupAccordion").empty();
	for ( var k = 0; k < groups.length; k++) {
		var group = groups[k];
		if (!(group && group.apps && group.apps != "undefined" && group.apps.length && group.apps.length>0)) {
			continue;
		}
		var appsHtml = '';
		for ( var ai = 0,alen=group.apps.length; ai < alen; ai++) {
			var app = group.apps[ai];
			var icon = app.icons?app.icons[app.icons.length-1].url:"/img/default.png";
			if (!app.enabled) icon += '?grayscale=true';
			var icontype = localStorage[DISABLE_BTN_TYPE_KEY];
			appsHtml += '<li class="span1 '+icontype+'"><div class="thumbnail" app-id='+app.id+'>'+
							'<img src="'+icon+'" alt="">'+
							'<span class="label'+(app.enabled?'':' diable')+'" title="'+app.description+'">'+app.name+'</span>'+
						'</div></li>'+
							'';
		}
//		var groupHtml = '<div class="accordion-group">'+
//							'<div class="accordion-heading"><div class="row">'+
//							  '<div class="span7">'+
//							    '<div class="row">'+
//							      '<div class="span6"><a class="accordion-toggle"  data-toggle="collapse" data-parent="#groupAccordion" href="#collapse'+k+'"> '+groupName(group)+' </a></div>'+
//							      '<div class="span1 banIcon"><i class="icon-ban-circle"></i></div>'+
//							    '</div>'+
//							  '</div>'+
//							'</div>'+
//						'</div>';
		var groupHtml = '<div class="accordion-group">'+
							'<div class="accordion-heading">'+
							      '<a class="accordion-toggle"  data-toggle="collapse" data-parent="#groupAccordion" href="#collapse'+k+'"> '+groupName(group)+' </a>'+
							'</div>';
		groupHtml += '<div id="collapse'+k+'" class="accordion-body collapse in">'+
						'<div class="accordion-inner">'+
							'<ul class="thumbnails">'+ appsHtml +
							'</ul>'+
						'</div>'+
					'</div></div>';
		$("#groupAccordion").append(groupHtml);
	}
	
	$(".thumbnail").click(function () {
	    clearTimeout(TimeFn);
	    var ele = $(this);
	    TimeFn = setTimeout(function(){
	    	appClick(ele);
	    },300);
	});
	$(".thumbnail").dblclick(function(){
		clearTimeout(TimeFn);
		appDbClick($(this));	
	});
	$(".thumbnail").contextmenu(function(){
		return appContextmenu($(this));
	});
}
