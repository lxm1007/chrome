$(function(){var e=[],t=[],i=[],n=[],o={},a={},s="img/default.jpg",r="",c="";$("#background").find(".fadein").css({"background-image":"url("+s+")",opacity:0});var l=setInterval(function(){chrome.runtime.sendMessage({origin:"newTabs"},function(d){e=d.backgroundTypes,t=d.serverWebsiteObj,i=d.saveWebsitesObj,n=d.searchSelectWebsiteObj,o=d.backgroundImages,a=d.settingObj,s=d.defaultBackgroundImage,r=d.showMessage,c=d.lastVersion;var h=d.pluginIsEnd;if(1==h||"true"==h){clearInterval(l),u.show();var g=chrome.runtime.getManifest().version;g=g.replace(/\./gi,""),c&&0!=c.length&&(c=c.replace(/\./gi,""),Number(c)>Number(g)&&$("#currentVersion").html("<b>更新版本</b>"))}})},50),u={};function d(e){e?(u.initSettingOperation(),$("#shade").show()):$("#shade").hide()}u.show=function(){u.initSettingOperation(),u.loadBackgroundImg(),u.loadSearchSelect(),u.loadTopSites(),u.showMessage()},u.showMessage=function(){r?($("#show-message").html(r),$("#show-message").parents(".footer-piece").show()):$("#show-message").parents(".footer-piece").hide()},u.loadTopSites=function(){var e,n=new Array,o=[];o=o.concat(t),chrome.topSites.get(function(t){(t=t.slice(0,8)).forEach(function(t){e={icon:"chrome://favicon/"+t.url,title:t.title,url:t.url,origin:2},n.push(e)}),o=(o=o.concat(n)).concat(i),u.initMostVisited(u.uniqWebsiteObj(o))})},u.uniqWebsiteObj=function(e){var t=[],i="",n="";for(old of e){let e=!0;for(uniq of(i=(i=old.url).replace(/(http|https):\/\//,""),t))n=(n=uniq.url).replace(/(http|https):\/\//,""),"/"==i.substring(i.length-1,i.length)&&(i=i.substring(0,i.length-1)),"/"==n.substring(n.length-1,n.length)&&(n=n.substring(0,n.length-1)),i==n&&(e=!1);e&&t.push(old)}return t},u.loadSearchSelect=function(){for(var e="",t=0;t<n.length;t++)e+='<option value="'+n[t].url+'">'+n[t].name+"</option>";$("#search-select").empty(),$("#search-select").append(e)},u.loadBackgroundImg=function(){for(var t=s,i=0;i<e.length;i++)if(1==e[i].status){100==e[i].value?t=o.comprehensive_pic_url:1==e[i].value?t=o.natural_pic_url:2==e[i].value?t=o.painting_pic_url:3==e[i].value?t=o.anime_pic_url:4==e[i].value&&(t=o.originality_pic_url);break}var n=new Image;n.src=t,n.onload=function(){var e=$("#background").find(".fadein");e.css({"background-image":"url("+t+")"});var i=0,n=setInterval(function(){e.css({opacity:i}),(i+=.4)>=1&&(e.css({opacity:1}),clearInterval(n))},50)},$("#download-img-href").attr("href",t)},u.initMostVisited=function(e){$(".most-visited").css({width:400});for(var t="",i="",n=$(".websites"),o=0;o<e.length;o++)i=e[o].origin,t+='<a class="visited-piece" data-href="'+e[o].url+'">\t<div class="website-icon"><img src="'+e[o].icon+'"/></div>',1==i?t+='<div class="website-title">'+e[o].title+"</div></a>":2!=i&&3!=i||(t+='<div class="right-up-img remove-most-visited" data-origin="'+i+'"><img src="img/close.png"/></div>',t+=2==i?'<div class="website-title"><span class="iconfont icon-bookmark"></span>'+e[o].title+"</div></a>":'<div class="website-title"><span class="iconfont icon-shoucang"></span>'+e[o].title+"</div></a>");n.empty(),n.append(t),$(".visited-piece").mouseover(function(){var e=$(this).find(".remove-most-visited");0!=e.length&&e.show()}),$(".visited-piece").mouseout(function(){var e=$(this).find(".remove-most-visited");0!=e.length&&e.hide()})},u.initSettingOperation=function(){$(".plugin-setting").on("click",function(){for(var t="",i=0;i<e.length;i++)1==e[i].status?t+='<input type="radio" name="backgroundType" value="'+e[i].value+'" checked/>'+e[i].name:t+='<input type="radio" name="backgroundType" value="'+e[i].value+'"/>'+e[i].name;var n=$(".background-type-radio");n.empty(),n.append(t),d(!0)}),$("#top-shade-close").on("click",function(){d(!1)}),$("#bottom-shae-close").on("click",function(){d(!1)})};var h=$(".current-time");setInterval(function(){var e=new Date,t=e.getHours(),i=e.getMinutes(),n=e.getSeconds();parseInt(t)<10&&(t="0"+t),parseInt(i)<10&&(i="0"+i),parseInt(n)<10&&(n="0"+n),h.text(t+":"+i+":"+n)},1e3),document.onmousemove=function(){window.lastMove=(new Date).getTime()},window.lastMove=(new Date).getTime(),window.setInterval(function(){(new Date).getTime()-lastMove>8e3?function(e){if(1==$("#search-keyword-input").is(":focus"))return;$(".header").hide(),$(".footer").hide(),$(".most-visited").hide(),$(".middle-box").fadeIn(e),$("#shade").hide(),$(".container").addClass("hide-background-color")}(500):($(".header").show(),$(".footer").show(),$(".most-visited").show(),$(".middle-box").hide(),$(".container").removeClass("hide-background-color"))},50),$(".menu-right a").on("click",function(){var e=$(this).data("href");e&&(-1!=e.indexOf("http")?window.location.href=e:chrome.tabs.create({url:e}))}),$("#search-keyword-input").keypress(function(e){if(13==e.which){var t=$(".search-select").val(),i=$("#search-keyword-input").val();t&&i&&(i=encodeURIComponent(i),t=t.replace(/@/g,i),window.location.href=t)}}),$("#bottom-save-btn").on("click",function(){var t=$("input[name='backgroundType']:checked").val();if(t){for(var i=0;i<e.length;i++)e[i].value+""==t+""?e[i].status=1:e[i].status=0;d(!1),u.loadBackgroundImg(),chrome.runtime.sendMessage({origin:"newTabs-setting",settingObj:a,backgroundTypes:e},function(e){})}}),$("body").on("click",".website-icon,.website-title",function(e){var t=$(this).parent(".visited-piece").data("href");t&&(window.location.href=t)}),$("body").on("click",".remove-most-visited",function(e){var t=$(this).parent(".visited-piece"),i=t.data("href");chrome.history.deleteUrl({url:i},function(){t.remove()})}),chrome.history.onVisitRemoved.addListener(function(e){e.allHistory||u.loadTopSites()})});