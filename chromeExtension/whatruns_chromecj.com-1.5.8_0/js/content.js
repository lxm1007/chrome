var ANALYSE_APPS = "analyseApps";
var finalData = {};
var BROWSER = (chrome || browser);
(function() {
	var su = {
		finalHtml : '',
		globalVars : '',
		fontFamily : '',
		contentExceeded : false,
		init : function(){
			this.addEventListener();
		},
		addEventListener : function(){
			var scriptEl, divEl, html = document.documentElement.outerHTML;
			try{
				divEl = document.createElement('div');
				divEl.setAttribute('id',    'divScriptsUsed');
				divEl.setAttribute('style', 'display: none');

				scriptEl = document.createElement('script');

				scriptEl.setAttribute('id', 'globalVarsDetection');
				scriptEl.setAttribute('src', chrome.extension.getURL('js/wrs_env.js'));

				divEl.addEventListener('globalVarsEvent', (function(event) {
					var jsonStr = event.target.childNodes[0].nodeValue;
					try{
						var jsonObj = JSON.parse(jsonStr);
						globalVars = jsonObj.environmentVars;
						fontFamily = jsonObj.fontFamily;
					}catch(e){
						console.log(e);
					}
					document.documentElement.removeChild(divEl);
					document.documentElement.removeChild(scriptEl);

					var finalData = {
						html : html,
						globalVars : JSON.stringify( globalVars ),
						fontFamily : fontFamily
					}
					BROWSER.runtime.sendMessage({id: ANALYSE_APPS, subject: finalData});

				}), true);

				document.documentElement.appendChild(divEl);
				document.documentElement.appendChild(scriptEl);

			}catch(e){
				console.log(e);
			}
		}
	}
	su.init();
}());
