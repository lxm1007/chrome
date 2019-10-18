/*This function is used to store the history items noted by domain 
*including the heat and accumulated browsed time for each item.
*It can be used for visualization, e.g. bar or pie chart.
*/

/*
*history_blocks is an array of history block
*A history block is a javascript object which contains:
* {
*  title: // the block's name
*  historys: // the array of history items(return from chrome API)
* }
*list is the vessel used to store history iterms and their information:
*{    
*  domain;// extract from url
*  heat;
*  last_time;//accumulated browsed time
*}
*/

// This code is used to do test.
var history_time = 3600 * 24 * 5 * 1000; // 5 days
var start_time = (new Date).getTime() - history_time;
var search_condition = {
    'text': '',
    'startTime': start_time,
    'maxResults': 1000
};


function get_heat_staytime_list(){
    //var list = new Array();
    //alert("this or that");
    chrome.history.search(search_condition, 
    function (history_items) {
        //something to store them
        //alert("hsitory")
        //alert(history_items.length)
        //alert("list0");
        var list = history_heat_staytime_list(history_items);
        tmp_svgBarChart(list);
        tmp_svgPieChart(list);
        //alert("list1");
        //alert(list);
    });
    //alert("list4");
    //alert(list);
    //return list;
}





/*get the heat history
*/
function history_heat_staytime_list(history_items){
    //alert("in history_heat_list function")
    var domain_list=new Array();
    domain_list=[];
    var n_item=0;
    //alert("history_items.length");
    //alert(history_items.length);
    //alert("done")
    
    for(var i=1;i<history_items.length;++i){
            //alert("i");
            //alert(i);
            //alert(history_items[i].url)
            var my_url=parseURL(history_items[i].url);
            //alert("my_url.host");
            //alert(my_url.host);
            if(my_url.protocol=="chrome-extension") //dont care
               continue;
            var item_dom=my_url.host;
            var index=find_indx(item_dom,domain_list);
            //alert("index");
            //alert(index);

            if(index == false){
                ++n_item;
                //alert(n_item);
                //alert("not die1?")
                domain_list[n_item]=new Object();
                //alert("not die2?")
                domain_list[n_item].domain=item_dom;
                //alert("not die3?")
                domain_list[n_item].heat=history_items[i].visitCount;
                //alert("not die?")
                var stay_time_temp=history_items[i-1].lastVisitTime - history_items[i].lastVisitTime;
                if (stay_time_temp > 10 && stay_time_temp < 1800000){
                    //1800000 means 30 mins
                    stay_time_temp = stay_time_temp * history_items[i].visitCount;
                }
                else if (stay_time_temp >= 1800000){
                    stay_time_temp = (1800000 + 400000 * Math.random() - 200000) * history_items[i].visitCount;
                }
                else{
                    stay_time_temp = 10 * history_items[i].visitCount;
                }
                
                domain_list[n_item].staytime = stay_time_temp;
                
            }
            else{
                domain_list[index].heat = domain_list[index].heat + history_items[i].visitCount;
                
                var stay_time_temp=history_items[i-1].lastVisitTime - history_items[i].lastVisitTime;
                if (stay_time_temp > 10 && stay_time_temp < 1800000){
                    //1800000 means 30 mins
                    stay_time_temp = stay_time_temp * history_items[i].visitCount;
                }
                else if (stay_time_temp >= 1800000){
                    stay_time_temp = (1800000 + 400000 * Math.random() - 200000) * history_items[i].visitCount;
                }
                else{
                    stay_time_temp = 10 * history_items[i].visitCount;
                }
                domain_list[index].staytime = domain_list[index].staytime + stay_time_temp;
            }
    }
    //alert("domain_list length");
    //alert(domain_list.length)
    //alert(domain_list)
    //alert(domain_list[5].domain)
    //alert(domain_list[5].heat)
    //alert(domain_list[5].staytime)
    return domain_list;
} 

function find_indx(item_dom,list){
    //alert("ehh")
    if(list.length==0)
        return false;
    for(var i=1;i<list.length;i++){
        //alert("item_dom");
        //alert(item_dom)
        //alert("list[i].domain")
        //alert(list[i].domain)
        if(list[i].domain==item_dom){           
            //alert("find one");
            return i;}
    }
    if(i==list.length)
        return false;        
}


/* This function is used to find the top8 history according to heat.
*/
function find_top_list(list){
    //alert("in find_top_list");
    //alert(list);
    //alert(list.length);
    if(list.length==0)
        return false;
    var top_items=new Array();
    if(list.length<10){
        //alert("in second if");
        for(var i=0;i<list.length;i++){
            top_items[i]= {};
            top_items[i].domain=list[i].domain;
            top_items[i].heat=list[i].heat;
    }}
    else{
        //alert("in second else");
        list.sort(function compare(obj1,obj2){
            return obj2.heat-obj1.heat;
        });
        //alert(list.length)
        //alert(list[0].domain)
        for(var i=0;i<8;i++){
            top_items[i]= {};
            top_items[i].domain=list[i].domain;
            top_items[i].heat=list[i].heat;
        }
    }
    return top_items;
}
