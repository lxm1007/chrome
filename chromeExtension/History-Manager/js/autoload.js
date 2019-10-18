function getPreviousDate(op, time) {
    if (op) {
        switch(op) {
            case 'reset':
                delete getPreviousDate.startTime;
                delete getPreviousDate.endTime;
                return;
            case 'bound':
                if (time != undefined) {
                    getPreviousDate.timeBound = time;
                    return;
                } else {
                    if (typeof getPreviousDate.timeBound == 'undefined') {
                        console.log("timeBound not set.");
                        debugger;
                        return;
                    } else {
                        return getPreviousDate.timeBound;
                    }
                }
            case 'set':
                if (time != undefined) {
                    getPreviousDate.endTime = time - 1;
                    getPreviousDate.startTime = new Date(time).setHours(0, 0, 0, 0);
                } else {
                    console.log('no time specified');
                    debugger;
                }
                return;
            case 'test':
                if (getPreviousDate.startTime && getPreviousDate.startTime >= getPreviousDate.timeBound) {
                    return true;
                } else {
                    return false;
                }
            default:
                return undefined;
        }
        return undefined;
    }
    if (typeof getPreviousDate.endTime == 'undefined') {
        getPreviousDate.endTime = (new Date()).getTime();
        getPreviousDate.startTime = (new Date()).setHours(0, 0, 0, 0);
    }
    var res = {
        'startTime': getPreviousDate.startTime,
        'endTime': getPreviousDate.endTime
    };
    if (getPreviousDate.timeBound && getPreviousDate.timeBound > res.startTime) {
        res.startTime = getPreviousDate.timeBound;
    }
    getPreviousDate.startTime -= ONE_DAY;
    getPreviousDate.endTime = getPreviousDate.startTime + ONE_DAY - 1;
    return res;
}

const MINIMAL_CACHE_SIZE = 150;

function getHistoryItems(op, condition, callback) {
    if (op == 'search') {
        if ((typeof getHistoryItems.inqueueItems != 'undefined')
            && getHistoryItems.inqueueItems.length > MINIMAL_CACHE_SIZE) {
            callback();
        } else {
            search(condition, 
                function(historyItems) {
                    historyItems = parseToDomainGroup(historyItems);
                    if (typeof getHistoryItems.inqueueItems == 'undefined') {
                        getHistoryItems.inqueueItems = historyItems;
                    } else {
                        getHistoryItems.inqueueItems.push.apply(getHistoryItems.inqueueItems, historyItems);
                    }
                    if ($(document).height() - $(window).scrollTop() - $(window).height() < 300) {
                        printIntoPage();
                    }
                    if (getPreviousDate('test') && getHistoryItems.inqueueItems.length < condition.length) {
                        var nextTime = getPreviousDate();
                        var newCondition = jQuery.extend(true, {}, condition);
                        newCondition.startTime = nextTime.startTime;
                        newCondition.endTime = nextTime.endTime;
                        getHistoryItems('search', newCondition, callback);
                    } else {
                        callback();
                    }
                }
            );
        }
    } else
    if (op == 'query') {
        if (typeof getHistoryItems.inqueueItems == 'undefined') {
            return 0;
        } else {
            return getHistoryItems.inqueueItems.length;
        }
    } else
    if (op == 'purge') {
        if (typeof getHistoryItems.inqueueItems == 'undefined') {
            return undefined;
        }
        if (condition.length == undefined) {
            return undefined;
        }
        if (getHistoryItems.inqueueItems.length < condition.length) {
            return getHistoryItems.inqueueItems.splice(0, getHistoryItems.inqueueItems.length);
        } else {
            return getHistoryItems.inqueueItems.splice(0, condition.length);
        }
    } else
    if (op == 'reset') {
        delete getHistoryItems.inqueueItems;
    }
}

function printIntoPage() {
    var newItems = getHistoryItems('purge', {length: MINIMAL_CACHE_SIZE});
    for (var i = 0; i < newItems.length; i++) {
        if (newItems == undefined || newItems.length === 0) {
            // no more items
        } else {
            if (history_blocks.length === 0 || history_blocks[history_blocks.length - 1].startTime > newItems[i].visitTime) {
                var newDate = new Date(newItems[i].visitTime);
                var newBlock = {
                    title: newDate.toDateString(),
                    startTime: (newDate.setHours(0, 0, 0, 0), newDate.getTime()),
                    historys: []
                };
                addNewBlock(newBlock, "b" + history_blocks.length);
            }
            addNewItem(newItems[i], "b" + (history_blocks.length - 1) + "h" + history_blocks[history_blocks.length - 1].historys.length);
        }
    }
}

function loadMore(searchCondition, callback = function() {}) {
    var time = getPreviousDate();
    getHistoryItems('search', {
        text: searchCondition.text,
        startTime: time.startTime,
        endTime: time.endTime,
        length: MINIMAL_CACHE_SIZE
    }, function() {
        printIntoPage();
        callback();
    });
}

$(window).scroll(
    function() {
        if ($(document).height() - $(window).scrollTop() - $(window).height() < 300 && getPreviousDate('test')) {
            searchOn('add');
            loadMore(getSearchCondition('current'), function() {
                searchOn('remove');
            });
        }
    }
);