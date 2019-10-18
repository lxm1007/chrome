/* ------------------------------------------------------
 * This is the main javascript file for the history page
 * It can search the history in past 3 days. Then show them
 * in the history panel.
 * ------------------------------------------------------*/

const DEFAULT_MAX_NUMBER_HISTORY    = 100;
const TIMEZONE_OFFSET = (new Date()).getTimezoneOffset() * 60 * 1000;

function searchOn(op) {
    switch (op) {
        case 'add':
            if (typeof searchOn.count == 'undefined') {
                searchOn.count = 1;
            } else {
                searchOn.count++;
            }
            return;
        case 'remove':
            if (typeof searchOn.count == 'undefined') {
                console.log("Remove before add.");
                debugger;
            } else {
                if (searchOn.count <= 0) {
                    console.log("Remove more than add");
                    debugger;
                }
                searchOn.count--;
            }
            return;
        case 'ask':
            if (typeof searchOn.count == 'undefined') {
                return 0;
            } else {
                return searchOn.count;
            }
        default:
            return undefined;
    }
}

function getSearchCondition(op) {
    var text = document.getElementById("search_text").value;
    var searchCondition = {
        'text': (text ? text : "")
    }
    if (document.getElementById('calendar_div').style.display == 'inline') {
        var date0 = document.getElementById('calendar-0').value;
        var date1 = document.getElementById('calendar-1').value;
        if (date1) {
            searchCondition['endTime'] = new Date(date1).getTime() + TIMEZONE_OFFSET + ONE_DAY - 1;
        } else {
            searchCondition['endTime'] = Date.now();
        }
        if (date0) {
            searchCondition['startTime'] = new Date(date0).getTime() + TIMEZONE_OFFSET;
        } else {
            searchCondition['startTime'] = searchCondition.endTime - ONE_MONTH * 3;
        }
    } else {
        searchCondition['endTime'] = Date.now();
        searchCondition['startTime'] = new Date().setHours(0, 0, 0, 0) - ONE_MONTH * 3;
    }
    if (getSearchCondition.lastCondition && JSON.stringify(getSearchCondition.lastCondition) == JSON.stringify(searchCondition)) {
        if (op && op == 'current') {
            
        } else {
            return undefined;
        }
    }
    getSearchCondition.lastCondition = searchCondition;
    return searchCondition;
}

function load() {
    var condition = getSearchCondition();
    if (condition) {
        getPreviousDate('set', condition.endTime);
        getPreviousDate('bound', condition.startTime);
        var panel = document.getElementById('history_panel');
        while (panel.lastChild) {
            panel.removeChild(panel.lastChild);
        }
        history_blocks = [];
        getHistoryItems('reset');
        (function init() {
            if ($(document).height() <= $(window).height() && getPreviousDate('test')) {
                searchOn('add');
                loadMore(condition, function() {
                    searchOn('remove');
                    init();
                });
            }
        })();
    }
}

var forbid_list = new Array();

// Add filter
load_copy_item(load_invisible_item(
    function() {
        forbid_list = invisible_item;
        load();
    }
));

// document.getElementById("search_button").addEventListener('click', load);
// document.getElementById("search_text").addEventListener('input', search_onclick);

document.getElementById('search_text').addEventListener('keydown', 
    function (e){
        var e = e || window.event; 
        if(e.keyCode == 13){ 
            load();
        }
    }
);

document.getElementById('calendar_icon').addEventListener('click', 
    function() {
        var calender = document.getElementById("calendar_div");
        var calender_0 = document.getElementById("calender-0");
        var calender_1 = document.getElementById("calender-1");
        if(calender.style.display=="none"){
            calender.style.display="inline";
        }
        else{
            calender.style.display="none";
        }

    }
);

document.getElementById('delete_all').addEventListener('click', 
    function() {
        if (searchOn('ask')) {
            alert("Page is still loading... Please wait");
            return;
        }
        if (!confirm("Are you sure you want to delete **ALL** historys listed below?")) {
            return;
        }
        for (var blockID = 0; blockID < history_blocks.length; blockID++) {
            for (var historyID = 0; historyID < history_blocks[blockID].historys.length; historyID++) {
                if (history_blocks[blockID].historys[historyID].isGroup) {
                    for (var k = 0; k < history_blocks[blockID].historys[historyID].group.length; k++) {
                        chrome.history.deleteUrl({url: history_blocks[blockID].historys[historyID].group[k].url});
                        var record = document.getElementById('b' + blockID + 'h' + historyID + 'g' + k);
                        if (record) {
                            record.className += " deleting";
                        }
                    }
                } else {
                    var record = document.getElementById('b' + blockID + 'h' + historyID);
                    if (record) {
                        record.className += " deleting";
                    }
                    chrome.history.deleteUrl({url: history_blocks[blockID].historys[historyID].url});
                }
            }
            var block = document.getElementById('b' + blockID);
            if (block) {
                block.parentElement.removeChild(block);
            }
        }
        document.getElementById("search_text").value
        load();
    }
);

document.addEventListener('DOMContentLoaded',
    function() {
        date0.on('select', function(data) {
            load();
        });
        date1.on('select', function(data) {
            load();
        });
        date0.on('clear', function(data) {
            document.getElementById('calendar-0').value = "";
            load();
        });
        date1.on('clear', function(data) {
            document.getElementById('calendar-1').value = "";
            load();
        });
    }
);
