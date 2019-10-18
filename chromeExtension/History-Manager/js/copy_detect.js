/* This is a content script used to detect the copy
 * behaviour in Chrome extension.
 */

var copy_flag = false;
var MAX_COPY_PAGE = 20;

function save_behaviour()
{
    // Step 1. Get current URL
    var url = document.URL;
    // Step 2. Detect if the url was recorded

    chrome.storage.local.get("copy_page", function(result)
    {
        var items;
        if(result.length == 0)
        {
            items = undefined;
        }
        else{
            items = result.copy_page;
        }

        console.log(items);

        if(items)
        {
            if(items.length > MAX_COPY_PAGE)
            {
                // Remove some items...
                items.splice(0, 1);
            }
            var url_exist = false;
            for(var i = 0;i < items.length; i++)
            {
                if(items[i] == url_exist)
                {
                    url_exist = true;
                    break;
                }
            }
            if(!url_exist)  items.push(url);
        }
        else // if not exist copy_page item, then create one
        {
            items = new Array();
            items.push(url);
        }
        // Finally, record updated item to the storage area
        chrome.storage.local.set({"copy_page":items}, function()
        {
            console.log("Setting saved!");
        });
    });
}

$(document).ready(function() {

	$(document).bind({
		copy : function(){
            save_behaviour();
		},
		cut : function(){
			save_behaviour();
		}
	})
});

