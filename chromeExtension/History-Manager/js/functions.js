
// invisible_item is a gloable array which 
// contains the invisible urls.
// e.g.
// invisible_item[0] = "www.baidu.com"
// invisible_item[1] = "www.4399.com"
var invisible_item;

// copy item is a gloable array
var copy_item;

function parseURL(url) {
//input a url and get the information about the url
//specially, to get the domain, you should get the host element
 var a =  document.createElement('a');  
 a.href = url;  
 return {  
 source: url,  
 protocol: a.protocol.replace(':',''),  
 host: a.hostname,  
 port: a.port,  
 query: a.search,    
 file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],  
 hash: a.hash.replace('#',''),  
 path: a.pathname.replace(/^([^\/])/,'/$1'),  
 relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],  
 segments: a.pathname.replace(/^\//,'').split('/')  
 };  
}    

/*
//here is a simple example
var myurl = parseURL('https://github.com/szagoruyko/nnpack.torch');
alert(myurl.host) // "github.com"
alert(myurl.protocol) // "https"
alert(myurl.source)  // "https://github.com/szagoruyko/nnpack.torch"
alert(myurl.port) // null for this url
alert(myurl.params) // null for this url
alert(myurl.query) // null for this url
alert(myurl.file)  //"nnpack.torch"
alert(myurl.hash) //null for this url
alert(myurl.path) //"/szagoruyko/nnpack.torch"
alert(myurl.relative) //"/szagoruyko/nnpack.torch"
alert(myurl.segments) //"szagoruyko,nnpack.torch"
*/

function load_invisible_item(callback_func = function(){})
{
    invisible_item = [];
    chrome.storage.local.get("invisible_item", function(result)
    {
        var items;
        if (result.length === 0) {
            items = undefined;
        } else {
            items = result.invisible_item;
        }
        if (items) {
            for(var i = 0;i < items.length; i++)
            {
                invisible_item.push(items[i]);
            }
        }
        console.log("Load invisible_item, done!...");
        callback_func();
    });
}

function load_copy_item(callback_func = function(){})
{
    copy_item = [];
    chrome.storage.local.get("copy_page", function(result)
    {
        var items;
        if (result.length === 0) {
            items = undefined;
        } else {
            items = result.copy_page;
        }
        if (items) {
            for(var i = 0;i < items.length; i++)
            {
                copy_item.push(items[i]);
            }
        }
        console.log("Load copy item, done!...");
        callback_func();
    });
}

function matchWord(str, word) {    
    return str.search(RegExp('\\W' + word + '\\W', 'i')) != -1
        || str.substr(0, word.length)
            == invisible_item.url
        || str.substr(str - word.length)
            == invisible_item.url
        || str == word;
}