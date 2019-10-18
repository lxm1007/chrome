/* ----------------------------------------------------------------------- *
 * This file is responsible for history panel's manipulation.
 *
 * This file containing functions related to history panel's html
 * manipulation:
 *  --- update_history_panel
 *      +-- get_history_item_html
 *      +-- get_history_block_html
 *      +-- delete_history_item
 *
 * These functions do not use global variable, only update_history_panel
 * takes history_blocks as a parameter and will further call the rest
 * two functions.
 *
 * These functions will be used in history page and search page.
 * 
 * ----------------------------------------------------------------------- */
/**
 * Refine the inout string to replace the special characters with the coding number in the HTML.
 * The input strings are from the history title and history url
 * 
 * @param {str} the history title or history url
 * reture the refined string
 */
function transformSpecialCharacter(str) {
	var specialCharacterArray = [" ","<",">","&","\""];
	var specialCharacterCode = ["&nbsp;","&lt;","&gt;","&amp;","&quot;"];
	var newStr = "";
	strLength = str.length;
	for(var i = 0; i < strLength; ++i)
	{
		var ch = str.substring(i,i+1);
		var isSpecialCharacter = false;
		var loc = -1;
    	for(var j = 0; j < specialCharacterArray.length; ++j)
		{
        	if (specialCharacterArray[j] == ch)
			{
				isSpecialCharacter = true;
				loc = j;
				break;
			}
        }
		if(isSpecialCharacter)
		{
			newStr += specialCharacterCode[loc];
		}
		else
		{
			newStr += ch;
		}
    } 
    return newStr;
}

/**
 * Get the history item object, and then return the HTML text.
 * Used to update the history panel.
 * 
 * @param {history item} history
 * A history item is a javascript object. For more details,
 * pls reference to chrome API.
 */
function  get_history_item_html(history, history_id) {
    var copy_flag = false;
    if(history.url)
    {
        if(copy_item.indexOf(history.url) != -1)
        {
            copy_flag = true;
        }
    }
    var res;
    if(!copy_flag)
    {
        res = '<li> <div class = "record" id="' + history_id +　'">';
    }
    else
    {
        res = '<li> <div class = "record important" id="' + history_id +　'">';
    }
/*
    <div class = "history_item_title">
      Google Page 
    </div>
    <div class = "history_item_url">
      <a href = "http://www.google.com">http://www.google.com </a>
    </div>
*/

    // Show time
    var show_time = "";
    if(history.visitTime)
    {
        var history_date = new Date(history.visitTime);
        var hour = history_date.getHours();
        var minute = history_date.getMinutes();
        var second = history_date.getSeconds();
        if(hour<10)
        {
            show_time = "0" + hour + " : ";
        }
        else
        {
            show_time = hour + " : ";
        }
        if(minute<10)
        {
            show_time = show_time + "0" + minute + " : ";
        }
        else
        {
            show_time = show_time + minute + " : ";
        }
        if(second<10)
        {
            show_time = show_time + "0" + second;
        }
        else
        {
            show_time = show_time + second;
        }
    }
    res = res + '<span><img class = "history_delete" id = "a' + history_id + '" src="../imgs/delete_16px.png" title="Delete" height=16em></img></span>';
    res = res + "<span class = 'history_time'>" + show_time + "</span>"

    
    var show_url = history.isGroup ? (parseURL(history.url).protocol + "://" + history.groupHost) : history.url;
    var show_title = history.isGroup ? history.groupHost : history.title;
	
    title_length=show_title.length;
	show_title = transformSpecialCharacter(show_title);
    if(!show_title)
    {
        show_title = "No title";
    }
	
    url_length = show_url.length;
    if(url_length > 35+3+4){
        show_url = show_url.substring(0,35) + "..." + show_url.substring(url_length - 4,url_length)
    }
	show_url = transformSpecialCharacter(show_url);
    var imageURL = history.isGroup ? ("../imgs/plus.png") : ('chrome://favicon/' + history.url);
	var full_title = history.title;
	full_title = transformSpecialCharacter(full_title);
	var full_url = history.url;
	full_url = transformSpecialCharacter(full_url);
    res = res + '<span class="title" id="icon' + history_id + '" style="background-image: url(' + imageURL + ');"><a title = "' + full_title + '" href = "' + full_url + '"> '+show_title+' ' + ' </a><text title = " '+history.url+' " class="url">'+ show_url +'</text></span>';
	res = res + '</div></li>';
	
    return res;
}

/**
 * This function is triggered when some record delete button is clicked. 
 * It take the id of the corresponding record and use jquery to remove
 * it from history panel and also remove the url from chrome history.
 *
 * @param {A history id string} history_id - the string indicating the records id
 */
function delete_history_item(history_id)
{
    var record = document.getElementById(history_id.substring(1));
    if (!record) {
        return;
    }

    var split_history = history_id.split(/b|h|g/);
    var block_int = parseInt(split_history[1]);
    var history_int = parseInt(split_history[2]);
    var group_int = split_history[3] ? parseInt(split_history[3]) : null;
    var record = history_blocks[block_int].historys[history_int];

    var li = document.getElementById(history_id.substring(1)).parentElement;
    var parent = li.parentElement;
    var hide = (document.getElementById("icon" + history_id.substring(1)).style.backgroundImage == 'url("../imgs/plus.png")');
    
    var deleteTransitionTime = 3;//Set the whole delete action need (deleteTransitionTime)*0.1 seconds.
    var $deleteRecord=$("#"+history_id.substring(1));
    $deleteRecord.addClass("deleting");

    // Use jQuery to remove some elements
    var handle = setInterval(function() {
        $("#"+history_id.substring(1)).remove();
        parent.removeChild(li);
        if (parent.childElementCount === 0) {
            var blockEmpty = (parent.nodeName == "DIC" && parent.parentElement.childElementCount == 2);
            if (blockEmpty) {
                parent.parentElement.parentElement.removeChild(parent.parentElement);
            } else {
                parent.parentElement.removeChild(parent);
                delete_history_item("ab" + block_int + "h" + history_int);
            }
        }
        // otherwise it will keep repeating
        clearInterval(handle);
    },deleteTransitionTime*100);

    if (group_int == null && record.isGroup != undefined && record.isGroup == true) {
        for (var i = 0; i < record.group.length; i++) {
            if (record.group[i].deleted == false) {
                if (hide) {
                    chrome.history.deleteUrl({'url': record.group[i].url});
                    record.group[i].deleted = true;
                } else {
                    delete_history_item(history_id + "g" + i);
                }
            }
        }
    } else {
        // Then we should call the API function
        if (history_id.indexOf("g") != -1) {
            url_obj = {url: record.group[split_history[3]].url};
            record.group[group_int].deleted = true;
        } else {
            url_obj = {url: record.url};
        }
        chrome.history.deleteUrl(url_obj);
    }

}

function addNewBlock(historyBlock, id) {
    var div = document.createElement('div');
    div.className = "history_block";
    div.id = id;
    var title = document.createElement('h4');
    title.innerText = historyBlock.title;
    div.appendChild(title);
    var dic = document.createElement('dic');
    dic.className = "history_list";
    div.appendChild(dic);
    document.getElementById("history_panel").appendChild(div);
    history_blocks.push(historyBlock);
}

function addNewItem(historyItem, id) {
    var code = get_history_item_html(historyItem, id);
    var block = document.getElementById("b" + id.split(/b|h|g/)[1]);
    var li = $(code);
    block.childNodes[1].appendChild(li[0]);
    history_blocks[history_blocks.length - 1].historys.push(historyItem);

    // add listener for deleting records or groups
    document.getElementById("a" + id).addEventListener("click", 
        function(element) {
            delete_history_item(element.target.id);
        }
    );
    
    // add listener for expanding and collapsing groups
    var icon = document.getElementById("icon" + id);
    if (icon.style.backgroundImage == "url(\"../imgs/plus.png\")") {
        icon.addEventListener("click", function(element) {
            var imageURL = element.target.style.backgroundImage;
            var id = element.target.id;
            var li = element.target.parentElement.parentElement;
            if (imageURL == "url(\"../imgs/plus.png\")") {
                element.target.style.backgroundImage = "url(\"../imgs/minus.png\")";
                var num = id.split(/b|h/);
                var subList = document.createElement('ul');
                for (var i = 0; i < history_blocks[num[1]].historys[num[2]].group.length; i++) {
                    if (history_blocks[num[1]].historys[num[2]].group[i].deleted) {
                        continue;
                    }
                    subList.innerHTML += get_history_item_html(history_blocks[num[1]].historys[num[2]].group[i], id.substring(4) + "g" + i);
                }
                if (subList.innerHTML.length > 0) {
                    li.appendChild(subList);
                    for (var i = 0; i < history_blocks[num[1]].historys[num[2]].group.length; i++) {
                        if (history_blocks[num[1]].historys[num[2]].group[i].deleted) {
                            continue;
                        }
                        document.getElementById("a" + id.substring(4) + "g" + i).addEventListener("click", function(element) {
                                var li = element.target.parentElement.parentElement;
                                var parent = li.parentElement.parentElement;
                                delete_history_item(element.target.id);
                        });
                    }
                }
            } else
            if (imageURL == "url(\"../imgs/minus.png\")") {
                element.target.style.backgroundImage = "url(\"../imgs/plus.png\")";
                li.removeChild(li.childNodes[2]);
            }
        });
    }
}