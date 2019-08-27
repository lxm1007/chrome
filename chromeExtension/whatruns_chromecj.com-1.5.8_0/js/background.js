var tab, responseHeadersCache = {}, allTabsCache = {}, tabData = {};
var finalData = {};
var self = null;
var hostname = '';
var invalidDomains = ["localhost", "127.0.0.1", "0.0.0.0", "newtab"];
(function(){
var s = {
	commonTechs : null,
	init : function(){
		self = s;
		this.addChromeListeners();
	},
	addChromeListeners : function(){
		BROWSER.webRequest.onCompleted.addListener(function(details) {
				if(details.tabId != "undefined"){
					self.removeTabData(details.tabId);
				}
				var currentResponseHeaders = {}
				 if(typeof details.responseHeaders != "undefined"){
				 		var url = self.beautifyURL(details.url);
				 		hostname = self.getRootHostName(url);
				 		var responseHeadersArr = details.responseHeaders;
				 		responseHeadersArr.forEach( function(key){
				 			currentResponseHeaders[key.name.toLowerCase()] = key.value || '' + key.binaryValue;
				 		});
				 		if(responseHeadersCache.length > 10) self.resetHeadersCache();
						if(responseHeadersCache[url] === undefined){
						 	responseHeadersCache[url] = {};
						 }
				 		Object.keys(currentResponseHeaders).forEach(function(key){
				 			responseHeadersCache[url][key] = currentResponseHeaders[key];
				 		});
				 }
		},  { urls: [ 'http://*/*', 'https://*/*' ], types: [ 'main_frame' ] }, [ 'responseHeaders' ]);
		
		BROWSER.runtime.onMessage.addListener(function(request, sender, sendResponse){
			if(typeof request.id != "undefined"){
				 if(request.id == ANALYSE_APPS){
					tab = sender.tab;
					href = self.beautifyURL(tab.url);
					hostname = self.getRootHostName(href);
					if ( responseHeadersCache[href] !== undefined ) {
						request.subject.responseHeaders = responseHeadersCache[href];
					}else request.subject.responseHeaders = {};
					if(hostname != null){
						self.getSiteAppsFromServer(tab, self.getRawHostName(href), href, request.subject, self.processData);
						chrome.browserAction.setTitle({"title" : "What runs " + hostname, "tabId" : tab.id});
					}else{
						chrome.browserAction.setTitle({"title" : "Please enter a website on your browser address bar", "tabId" : tab.id});
					}
				}else if(request.id == GET_DETECTED_APPS){	
					if(allTabsCache[request.tab.id]){
						var response = {
							tabTechs : allTabsCache[request.tab.id]
						}
						sendResponse(response);
					}else{
						tab = request.tab;
						href = self.beautifyURL(tab.url);
						sendResponse(self.getUrlDetails(href));
					}
				}else if(request.id == GET_HOST_NAME){
					tab = request.tab;
					href = self.beautifyURL(tab.url);
					sendResponse(self.getUrlDetails(href));
				}else if(request.id == GET_SITE_DATA){
					tab = request.tab;
					var responseData = {};
					if(tabData[tab.id] && typeof tabData[tab.id] != "undefined"){
						responseData['data'] = tabData[tab.id];
					}else{
						responseData['msg'] = "Data Not Available";
					}
					sendResponse(responseData);
				}
			}
		});

		BROWSER.tabs.onRemoved.addListener(function(tabId) {
			allTabsCache[tabId] = null;
			tabData[tabId] = null;
		});

	},
	removeTabData : function(tabId){
		try{
			if(allTabsCache[tabId]){
				allTabsCache[tabId] = null;
			}
			if(tabData[tabId]) tabData[tabId] = null;
		}catch(e){
		}
	},
	resetHeadersCache : function(){
		responseHeadersCache = {};
	},
	getSiteAppsFromServer : function(tab, rawhostname, href, data, callback){
		if(!self.isValidDomain(hostname)) return false;
		if(hostname === undefined) return false;
		var newData = self.getUrlDetails(href, rawhostname);
		try{
			 var xmlhttp = new XMLHttpRequest();
			 
			xmlhttp.open('POST', GET_SITE_APPS, true);
			xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

			xmlhttp.onreadystatechange = function(e) {
				if ( xmlhttp.readyState == 4 && xmlhttp.status==200) {
					try{
						Object.keys(newData).forEach( function(key){
							data[key] = newData[key];
						});
						callback(tab, xmlhttp.responseText, rawhostname, hostname, href, data);
					}catch(e){
					}
				}
			};
			xmlhttp.send('data=' + encodeURIComponent(JSON.stringify(newData)));
		}catch(e){
			console.log(e);
		}
	},
	analyseSiteDataFromServer : function(tab, rawhostname, hostname, href, data){
		self.beautifyAndStoreData(tab, rawhostname, hostname, href, data);
		if(tabData[tab.id] && typeof tabData[tab.id] != "undefined"){
			data = tabData[tab.id];
		}
		try{
			 var xmlhttp = new XMLHttpRequest();
			 xmlhttp.open('POST', ANALYSE_SITE_DATA, true);
			xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

			xmlhttp.onreadystatechange = function(e) {
				if ( xmlhttp.readyState == 4 && xmlhttp.status==200) {
					try{
						s.processResponseData(tab, xmlhttp.responseText, hostname, data.fontFamily);
					}catch(e){
					}
				}
			};
			xmlhttp.send('data=' + encodeURIComponent(JSON.stringify(data)));
		}catch(e){
			console.log(e);
		}
	},
	getUrlDetails : function(url, rawhostname){
		var urlDetails = {};
		try{
			if(typeof rawhostname == "undefined" || rawhostname == null) rawhostname = self.getRawHostName(url);
			rawhostname = self.removeWWWFromString(rawhostname);
			urlDetails['rawhostname'] = rawhostname;
			if(self.isIpAddress(rawhostname)){
				urlDetails['hostname'] = rawhostname; 
			}else{
				var rootHostName = self.getRootHostName(url);
				urlDetails['hostname'] = rootHostName; 
				if(rawhostname != rootHostName){
					urlDetails['subdomain'] = self.getSubDomain(rawhostname);
				}
			}
			urlDetails['url'] = url;
		}catch(e){
			console.log(e);
		}
		return urlDetails;
	},
	getSubDomain : function(hostname){
		try{
			var parts = hostname.split('.');
			return parts[0];
		}catch(e){
			console.log(e);
		}
	},
	isIpAddress : function(hostname){
		try{
			var ip = hostname.split(".");

			if (ip.length != 4) {
				return false;
			}

			//Check Numbers
			for (var c = 0; c < 4; c++) {
				//Perform Test
				if(isNaN(parseFloat(ip[c])) || !isFinite(ip[c]) || ip[c] < 0 || ip[c] > 255 || ip[c].indexOf(" ") !== -1 || ip[c].match(/^-\d+$/)){

					 return false;
				}
			}

		}catch(e){
		}
		return true;
	},
	removeWWWFromString : function(hostname){
		try{
			var parts = hostname.split('.');
			var firstPart = parts[0].toLowerCase();
			if (firstPart === 'www' && parts[1] !== 'com'){
				parts.shift()
			}
			return parts.join(".");
		}catch(e){
			console.log(e);
		}
		return hostname;
	},
	processHTML : function(html){
		try{
				var $doc = new DOMParser().parseFromString(html, "text/html");
				$doc = this.traverse($doc);
				var scripts = '';
				var nodes = $doc.getElementsByTagName("script");
				for (index = nodes.length - 1; index >= 0; index--) {
						var src = nodes[index].getAttribute("src");
						if(src) scripts += nodes[index].outerHTML;
						nodes[index].parentNode.removeChild(nodes[index]);
				}
				html = $doc.documentElement.outerHTML.trim();
				html =  html.replace(/\s{2,}/g, ' ');
				if ( html.length > 30000 ){
					 html = html.substring(0, 19000) + html.substring(html.length - 10000, html.length);
				}
				html += scripts;
		}catch(e){
			console.log(e);
		}
		return html;
	},
	getAllEmails : function(html){
		try{
			var emails =  html.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
			return this.filterEmails(emails);
		}catch(e){
			console.log(e);
		}
	},
	filterEmails : function(emails){
		try{
			var newEmails = [];
			if(emails == null) return newEmails; 
			for(var i=0; i<emails.length; i++){
				try{
				   var email = emails[i];
				   if(!this.hasImageExntesion(email)){
					   if(email.substr(-1) == ".") email = email.slice(0, -1);
						newEmails.push(email);
				   }
				}catch(e){
					console.log( e );
				}
			}
			return newEmails;
		}catch(e){
			console.log(e);
		}
	},
	hasImageExntesion : function(email){
		try{
			return (/\.(gif|jpg|jpeg|tiff|png)$/i).test(email)
		}catch(e){
			console.log(e);
		}
		return false;
	},
	traverse : function(node){
		try{
			if (node.firstChild) {
				 this.traverse(node.firstChild);
			 }
			 if (node.nodeType === 3) {
				 if (node.nodeValue !== '') {
					 node.nodeValue = '';
				 }
			 }
			 if (node.nextSibling) {
				 this.traverse(node.nextSibling);
			 }
		}catch(e){
			console.log(e);
		}
		return node;
	},
	beautifyAndStoreData : function(tab, rawhostname, hostname, href, data){
		try{
			//if(!tabData[tab.id] && typeof tabData[tab.id] == "undefined"){
				data.hostname = hostname;
				data.rawhostname = rawhostname;
				data.url = href;
				var emails = self.getAllEmails(data.html);
				if(emails)data.emails = JSON.stringify( emails );
				data.html = self.processHTML(data.html);
				tabData[tab.id] = data;
			//}
		}catch(e){
			console.log(e);
		}
	},
	processData : function(tab, response, rawhostname, hostname, href, data){
		try{
			response = JSON.parse(response) || {};
			if(response.status){
				self.processResponseData(tab, response, hostname, data.fontFamily);
				if(response.old) {
					var apps = JSON.parse(data.apps);
					self.analyseSiteDataFromServer(tab, rawhostname, hostname, href, apps);
				}
			}else{
				self.analyseSiteDataFromServer(tab, rawhostname, hostname, href, data);
			}
			self.beautifyAndStoreData(tab, rawhostname, hostname, href, data);
		}catch(e){
			console.log(e);
		}
	},
	processResponseData : function(tab, response, hostname, fontFamily){
		try{
			var res = response;
			if(typeof response != "object") var res = JSON.parse(response) || {};
			if(typeof res.apps != "undefined") res = JSON.parse(res.apps) || {};
			else res = {};
			var href = self.beautifyURL(tab.url);
			var urlDetails = self.getUrlDetails(href);
			var data = {
				hostname : hostname,
			}
			Object.keys(urlDetails).forEach( function(key){
				data[key] = urlDetails[key];
			});
			if(Object.keys(res).length > 0){
				data['response'] = res;
			}
			if(typeof fontFamily != "undefined"){
				data.fontFamily = fontFamily;
			}
			allTabsCache[tab.id] = data;

		}catch(e){
			console.log(e);
		}
	},
	beautifyURL : function(url){
		try{
			return url.replace(/#.*$/, '');
		}catch(e){
		}
		return url;
	},
	getRootHostName : function(url){
		var rawHostName = self.getRawHostName(url);
		rawHostName = self.removeWWWFromString(rawHostName);
		try{
		   var TLDs = ["ac", "ad", "ae", "aero", "af", "ag", "ai", "al", "am", "an", "ao", "aq", "ar", "arpa", "as", "asia", "at", "au", "aw", "ax", "az", "ba", "bb", "bd", "be", "bf", "bg", "bh", "bi", "biz", "bj", "bm", "bn", "bo", "br", "bs", "bt", "bv", "bw", "by", "bz", "ca", "cat", "cc", "cd", "cf", "cg", "ch", "ci", "ck", "cl", "cm", "cn", "co", "com", "coop", "cr", "cu", "cv", "cx", "cy", "cz", "de", "dj", "dk", "dm", "do", "dz", "ec", "edu", "ee", "eg", "er", "es", "et", "eu", "fi", "fj", "fk", "fm", "fo", "fr", "ga", "gb", "gd", "ge", "gf", "gg", "gh", "gi", "gl", "gm", "gn", "gov", "gp", "gq", "gr", "gs", "gt", "gu", "gw", "gy", "hk", "hm", "hn", "hr", "ht", "hu", "id", "ie", "il", "im", "in", "info", "int", "io", "iq", "ir", "is", "it", "je", "jm", "jo", "jobs", "jp", "ke", "kg", "kh", "ki", "km", "kn", "kp", "kr", "kw", "ky", "kz", "la", "lb", "lc", "li", "lk", "lr", "ls", "lt", "lu", "lv", "ly", "ma", "mc", "md", "me", "mg", "mh", "mil", "mk", "ml", "mm", "mn", "mo", "mobi", "mp", "mq", "mr", "ms", "mt", "mu", "museum", "mv", "mw", "mx", "my", "mz", "na", "name", "nc", "ne", "net", "nf", "ng", "ni", "nl", "no", "np", "nr", "nu", "nz", "om", "org", "pa", "pe", "pf", "pg", "ph", "pk", "pl", "pm", "pn", "pr", "pro", "ps", "pt", "pw", "py", "qa", "re", "ro", "rs", "ru", "rw", "sa", "sb", "sc", "sd", "se", "sg", "sh", "si", "sj", "sk", "sl", "sm", "sn", "so", "sr", "st", "su", "sv", "sy", "sz", "tc", "td", "tel", "tf", "tg", "th", "tj", "tk", "tl", "tm", "tn", "to", "tp", "tr", "travel", "tt", "tv", "tw", "tz", "ua", "ug", "uk", "us", "uy", "uz", "va", "vc", "ve", "vg", "vi", "vn", "vu", "wf", "ws", "xn--0zwm56d", "xn--11b5bs3a9aj6g", "xn--3e0b707e", "xn--45brj9c", "xn--80akhbyknj4f", "xn--90a3ac", "xn--9t4b11yi5a", "xn--clchc0ea0b2g2a9gcd", "xn--deba0ad", "xn--fiqs8s", "xn--fiqz9s", "xn--fpcrj9c3d", "xn--fzc2c9e2c", "xn--g6w251d", "xn--gecrj9c", "xn--h2brj9c", "xn--hgbk6aj7f53bba", "xn--hlcj6aya9esc7a", "xn--j6w193g", "xn--jxalpdlp", "xn--kgbechtv", "xn--kprw13d", "xn--kpry57d", "xn--lgbbat1ad8j", "xn--mgbaam7a8h", "xn--mgbayh7gpa", "xn--mgbbh1a71e", "xn--mgbc0a9azcg", "xn--mgberp4a5d4ar", "xn--o3cw4h", "xn--ogbpf8fl", "xn--p1ai", "xn--pgbs0dh", "xn--s9brj9c", "xn--wgbh1c", "xn--wgbl6a", "xn--xkc2al3hye2a", "xn--xkc2dl3a5ee0h", "xn--yfro4i67o", "xn--ygbi2ammx", "xn--zckzah", "xxx", "ye", "yt", "za", "zm", "zw"].join()
		   var parts = rawHostName.split('.');
			if (parts[0] === 'www' && parts[1] !== 'com'){
				parts.shift()
			}
			var extension = [];
			var ln = parts.length, i = ln, minLength = parts[parts.length-1].length, part;
			// iterate backwards
			while(part = parts[--i]){
				extension.push(part);
				// stop when we find a non-TLD part
				if (i === 0  || i < ln-2  || part.length < minLength || TLDs.indexOf(part) < 0 ){
					if(extension.length > 1)
					return extension.reverse().join(".");
				}
			}
			
	   }catch(e){
	   		console.log(e);
	   }
	   return rawHostName;
	},
	isValidDomain : function(domainName){
		try{
			if(invalidDomains.indexOf(domainName) >= 0) return false; 
		}catch(e){
			console.log(e);
		}
		return true;
	},
	getRawHostName : function(url){
		try{
			 var uri = new URL(url);
			 return self.removeWWWFromString(uri.hostname);
		}catch(e){
			console.log(e);
		}
		return null;
	}
};
s.init();
})();
