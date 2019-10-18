
function add_three_bookmarks() {
    var history_time = 3600 * 24 * 5 * 1000; // 5 days
    var start_time = (new Date).getTime() - history_time;
    var search_condition = {
        'text': '',
        'startTime': start_time,
        'maxResults': 1000
    };
    
    var top_click = new Array();
    //alert("top_click1?");
    chrome.history.search(search_condition, 
        function (history_items) {
            
            generate_bookmarks(find_top_click(history_items));
        });

    function find_top_click(list){

        if(list.length==0)
            return false;
        var top_items=new Array();
        if(list.length<10){
            //alert("in second if");
            for(var i=0;i<list.length;i++){
                top_items[i]= {};
                top_items[i].title=list[i].title;
                top_items[i].url=list[i].url;
        }}
        else{
            //alert("in second else");
            list.sort(function compare(obj1,obj2){
                return obj2.visitCount-obj1.visitCount;
            });
            //alert(list.length)
            //alert(list[0].domain)
            for(var i=0;i<3;i++){
                top_items[i]= {};
                top_items[i].title=list[i].title;
                top_items[i].url=list[i].url;
            }
        }
        return top_items;
    }
        
    function generate_bookmarks(top_click){
    chrome.bookmarks.search('Extension bookmarks',function(bookmarkArray){
        var length = bookmarkArray.length;
        var temp = 0;
        //alert("length");
        //alert(length);
        for(var i = 0; i < length;i++)
        {
            //alert(i);
            //alert(bookmarkArray[i].id);
            if(bookmarkArray[i].title == 'Extension bookmarks')
            {
                    //alert("find it?");
                    temp =1;
                    // for(var k = 0;k <top_click.length;k++){
                      //  alert("the top length is");
                        //alert(top_click.length);
                        
                    // chrome.bookmarks.getChildren(bookmarkArray[i].id, function(bookmarkArray_child){
                    // var j = 0;
                    // for (j =0;j<bookmarkArray_child.length;j++)
                    // {
                        // alert(k)
                        // alert(top_click[k])
                        // alert(top_click[k].url)
                    // if (top_click[k].url == bookmarkArray_child.url)
                    // {
                        // continue;
                    // }
       
                    // }
                    
                    // if (j == bookmarkArray_child.length)
                    // {
                    // chrome.bookmarks.create({'parentId': bookmarkArray[i].id,
                                   //'title': 'zhe...haoba',
                                   //'url': 'http://ethereon.github.io/netscope/#/editor'
                                   // 'title': top_click[k].title,
                                   // 'url': top_click[k].url
                                   // });
                        
                    // }
                    
                    // });
       
                    // }
            }
            
        }
        if(i==length&&temp ==0)
        {
            //alert("wokao");
                chrome.bookmarks.create({'parentId': "1",
                                   'title': 'Extension bookmarks'},
                                  function(newFolder) {
                
                
                //for(var i = 0; i < length;i++)
                //{
                for(var k = 0;k <top_click.length;k++){
                        //alert("the top length is");
                        //alert(top_click.length);
                    chrome.bookmarks.create({'parentId': newFolder.id,
                                   // 'title': 'zhe...haoba',
                                   // 'url': 'http://ethereon.github.io/netscope/#/editor'
                                   'title': top_click[k].title,
                                   'url': top_click[k].url
                                   });
                    }
                //}
                });
        }
        
    });
    }
}

add_three_bookmarks()

    