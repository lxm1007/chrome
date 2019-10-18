function write_invisible_item()
{
    console.log("write_invisible_item\n");
    var target_url = document.getElementById("add_invisible_text").value;
    if (target_url && target_url.length > 0)
    {
        console.log("Saving url:" + target_url);
        invisible_item.push({url:target_url, active:true});
        update_invisible_item();
    }
    document.getElementById("add_invisible_text").value = "";
}

function update_invisible_item()
{
   console.log("update_invisible_item\n");
   chrome.storage.local.set({"invisible_item": invisible_item}, function()
   {
        console.log("Setting saved!");
        load_invisible_item(show_invisible_item);
   });
}

function remove_invisible_item(del_idx)
{
    idx = parseInt(del_idx.split("_")[1]);
    console.log("Delete idx: " +idx);
    if(idx >= 0 && idx < invisible_item.length) {
        invisible_item.splice(idx, 1);
        update_invisible_item();
    }
}

function invert_invisible_item(del_idx)
{
    idx = parseInt(del_idx.split("_")[1]);
    if(idx >= 0 && idx < invisible_item.length) {
        invisible_item[idx].active = !invisible_item[idx].active 
        update_invisible_item();
    }
}

function show_invisible_item()
{
    var it = document.getElementById("invisible_table");
    str = "<tbody>";
    for (var i = 0; i <invisible_item.length;i++ )
    {
        var inv_str, inv_class;
        if(invisible_item[i].active)
        {
            inv_str = "Disable";
            inv_class = "invisible_active";
        }
        else
        {
            inv_str = "Enable";
            inv_class = "invisible_inactive";
        }
        str = str + "<tr>";
        str = str + "<td><span class = '" + inv_class + "'>"  + invisible_item[i].url + "</span></td>";

        str = str + "<td><a id = 'invinvisible_" + i + "' style='cursor: pointer; cursor: hand;'>" + inv_str + "</a></td>";
        str = str + "<td><a id = 'delinvisible_" + i + "' style='cursor: pointer; cursor: hand;'>Delete</a></td>";
        str = str + "</tr>";
    }
    str = str + "</tbody>";
    it.innerHTML = str;

    for (var i = 0;i < invisible_item.length;i++)
    {
        var el = document.getElementById("delinvisible_" + i);                   
        if(el)
        {
            el.addEventListener("click", function(el){             
            remove_invisible_item(el.target.id);
        });
        }
        el = document.getElementById("invinvisible_" + i);                   
        if(el)
        {
            el.addEventListener("click", function(el){             
            invert_invisible_item(el.target.id);
        });
        }
    }
}

document.getElementById("add_invisible_button").addEventListener("click", write_invisible_item);
document.getElementById('add_invisible_text').addEventListener('keydown', 
    function (e){
        var e = e || window.event; 
        if(e.keyCode == 13){ 
            write_invisible_item();
        }
    }
);
document.getElementById("clear_button").addEventListener("click", 	function() {
		// get current window
		chrome.windows.getCurrent(
			function (currentWindow) {
				// get all tab info in current window
				chrome.tabs.getAllInWindow(currentWindow.id, 
					function (tabs) {
						// check if main history page already open
						for (var i = 0; i < tabs.length; i++) {
							if (tabs[i].url == "chrome://settings/clearBrowserData") {
								// if already exist, reactivate it
								chrome.tabs.update(tabs[i].id, {
									active: true
								});
								self.close();
								return;
							}
						}
						// otherwise open the main history page in the new tab
						chrome.tabs.create({
							selected: true,
							url: "chrome://settings/clearBrowserData"
						});
					}
				);
				return;
			}
		);
	});
    
load_invisible_item(show_invisible_item);

