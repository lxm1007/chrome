
if (self === top){
    // var _hmt = _hmt || [];
    // (function() {
    //     var hm = document.createElement("script");
    //     hm.src = "https://www.googletagmanager.com/gtag/js?id=UA-93217128-6";
    //     var s = document.getElementsByTagName("script")[0];
    //     s.parentNode.insertBefore(hm, s);
    //     window.dataLayer = window.dataLayer || [];
    //     function gtag(){dataLayer.push(arguments);}
    //     gtag('js', new Date());
    //     gtag('config', 'UA-93217128-6');
    // })();
    var _hmt = _hmt || [];
    (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?cdce8cda34e84469b1c8015204129522";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(hm, s);
    })();
    port = chrome.extension.connect();
    port.postMessage({
        joke: 'find_video'
    })
    // 无水印视频
    port.onMessage.addListener(function(res) { 
        if (res.joke === 'dw_video'){
            setTimeout(res.data, 0)
        }
    });
}