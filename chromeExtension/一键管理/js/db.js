var db = openDatabase('onekeymanager', '1.0', 'onekeymanager DB', 2 * 1024 * 1024);
function db_init() {
	$sqlCheck = "select * from GROUPS LIMIT 0,1";
	db_exe($sqlCheck,null,null,function(){
		showInitDialog(true);
		console.log("db_init....");
		db_dml("CREATE TABLE IF NOT EXISTS GROUPS (id unique, name,num,system)");
		db_dml("INSERT INTO GROUPS VALUES (1,'myfav',10,'mark')");
		db_dml("INSERT INTO GROUPS VALUES (2,'myext',20,'extension')");
		db_dml("INSERT INTO GROUPS VALUES (3,'mytheme',30,'theme')");
		db_dml("INSERT INTO GROUPS VALUES (4,'myapp',40,'app')");
		db_dml("CREATE TABLE IF NOT EXISTS GROUP_APP (gid, aid,app_type,UNIQUE(gid,aid))");
		db_dml("INSERT INTO GROUP_APP VALUES(1,'history','system');");
		db_dml("INSERT INTO GROUP_APP VALUES(1,'extensions','system');");
		db_dml("INSERT INTO GROUP_APP VALUES(1,'newtab','system');");
		db_dml("INSERT INTO GROUP_APP VALUES(1,'downloads','system');");
		db_exe($sqlCheck,null,function(){showInitDialog(false);refresh();},null);
	});
}

function showInitDialog(isShow) {
	if (isShow) {
		$("#initDialog").modal("show");
	} else {
		$("#initDialog").modal("hide");
	}
}

function db_dml($sql) {
	db_exe($sql,null,null,null);
}

function db_exe($sql,$args,$successCallback,$errorCallback) {
	db.transaction(function(tx){
		console.log($sql + "," + $args);
		tx.executeSql($sql,$args,$successCallback,$errorCallback);
	});
}

function findGroups(actionGroups) {
	$groupsSql = "select * from groups order by num asc;";
	db_exe($groupsSql,null,function(tx,results){
		actionGroups(dbDataToArray(results));
	},null);
	return null;
}
function findGroupApp(action) {
	$sql = "select * from group_app;";
	db_exe($sql,null,function(tx,results){
		action(dbDataToArray(results));
	},null);
	return null;
}
function findTheGroupApps(gid, action) {
	$sql = "select * from group_app where gid="+gid;
	db_exe($sql,null,function(tx,results){
		action(dbDataToArray(results));
	},null);
	return null;
}
function dbDataToArray($result) {
	var arr = [];
	if (!$result || !$result.rows || $result.rows.length == 0) return arr;
	var $rows = $result.rows;
	for ( var i = 0; i < $rows.length; i++) {
		arr.push($rows.item(i));
	}
	return arr;
}
function addCollect(gid, aid, callback) {
	var sql = "INSERT INTO GROUP_APP VALUES("+gid+",'"+aid+"','user');";
	db_exe(sql, null,function(tx,results){callback();}, null);
}
function removeCollect(gid,aid, callback) {
	var sql = "delete from GROUP_APP where gid="+gid+" and aid='"+aid+"'";
	db_exe(sql, null,function(tx,results){callback();}, null);
}
function i18n($key) {
	return chrome.i18n.getMessage($key);
}
function refresh() {
//	setTimeout(function(){
//		window.location.reload();
//	},200);
	initAllBtn();
	listApp();
}
function log(str) {
	if (!debug) return ;
	console.log(str);
}
function isMe(app) {
	return app.name == chrome.i18n.getMessage("application_title")
}
var debug = true;
var inlineApp = [];
inlineApp.push({
	description : i18n("history"),
	icons : [{
		size : "128",
		url : "/img/history.png"
	}],
	id : "history",
	mayDisable : "false",
	enabled : "true",
	appLaunchUrl : 'chrome://history',
	type : 'inline_app',
	name : i18n("history")
});
inlineApp.push({
	description : i18n("extensions"),
	icons : [{
		size : "128",
		url : "/img/extension.png"
	}],
	id : "extensions",
	mayDisable : "false",
	enabled : "true",
	appLaunchUrl : 'chrome://extensions/',
	type : 'inline_app',
	name : i18n("extensions")
});
inlineApp.push({
	description : i18n("newtab"),
	icons : [{
		size : "128",
		url : "/img/newtab.png"
	}],
	id : "newtab",
	mayDisable : "false",
	enabled : "true",
	appLaunchUrl : 'chrome://newtab/',
	type : 'inline_app',
	name : i18n("newtab")
});
inlineApp.push({
	description : i18n("downloads"),
	icons : [{
		size : "128",
		url : "/img/download.png"
	}],
	id : "downloads",
	mayDisable : "false",
	enabled : "true",
	appLaunchUrl : 'chrome://downloads/',
	type : 'inline_app',
	name : i18n("downloads")
});

