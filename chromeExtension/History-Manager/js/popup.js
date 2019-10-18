const MINIMUM = 30;

/**
 * Take a time as input, return formated description of
 * position the time in time axis.
 * 
 * @param {double} inputTime - number of milliseconds of 
 * one previous time 
 */
function timeTransform(inputTime) {

	if (typeof inputTime != "number") {
		return "Not a time";
	}

	var now = new Date(inputTime);
	var formatedTime = "";
	var millisecond = Date.now() - inputTime;

	if (millisecond < 0) {
		return "In the future";
	}

	var minute = (millisecond / 1000 / 60) << 0;
	if (minute < 1) {
		return "just now";
	}
	if (minute == 1) {
		return "a minute ago";
	}
	if (minute < 60) {
		return minute.toString() + " minutes ago";
	}

	var hour = minute / 60 << 0;
	if (hour == 1) {
		return "an hour ago";
	}
	if (hour <= (new Date).getHours()) {
		return hour.toString() + " hours ago";
	}
	hour -= (new Date).getHours() - 24;

	var day = hour / 24 << 0;
	if (day == 1) {
		return "yesterday";
	}
	if (day <= 30) {
		return day.toString() + " days ago";
	}

	var month = day / 30 << 0;
	if (month == 1) {
		return "one month ago";
	}
	if (month < 12) {
		return month.toString() + " months ago";
	}

	var year = month / 12 << 0;
	if (year == 1) {
		return "one year ago";
	}
	return year.toString() + " years ago";
}

// when user click one listed title,
// open a new tab focus on the new tab.
function onClick(event) {
	chrome.tabs.create({
		selected: true,
		url: event.currentTarget.href
	});
	return;
}
// insert history records in the popup window
function buildDomInDiv(divName, data) {
	var parentDic = document.getElementById(divName);
	// simply list the history records
	for (var i = 0; i < data.length; i++) {

		var li = document.createElement('li');
		parentDic.appendChild(li);

		var div = document.createElement('div');
		div.className = "record";
		li.appendChild(div);

		// use a hyperlink form to demonstrate the record
		var a = document.createElement('a');
		a.href = data[i].url;
		a.style.textDecoration = "none";
		a.title = data[i].title + '\n' + data[i].url;
		div.appendChild(a);

		// show the human readable title instead of url
		var span = document.createElement('span');
		span.style.backgroundImage = "url(chrome://favicon/" + data[i].url + ")";
		span.className = "title";

		var count = document.createElement('span');
		count.className = "count";
		count.appendChild(document.createTextNode(timeTransform(data[i].lastVisitTime)));
		a.appendChild(count);

		var text = document.createTextNode(data[i].title);
		span.appendChild(text);
		a.appendChild(span);

		a.addEventListener('click', onClick);
	}
}
// find ten history records with title
function queryChromeHistory(divName, data, startTime, endTime) {
	search({
			'text': '',
			'startTime': startTime,
			'endTime': endTime,
			'maxResults': MINIMUM
		},
		function (historyItems) {
			// no more history can be found,
			// build the DOM and return
			if (historyItems.length == 0) {
				buildDomInDiv(divName, data);
				return;
			}
			var update = false;
			for (var i = 0; i < historyItems.length; i++) {
				// update the next search start time
				endTime = historyItems[i].visitTime;
				// check if the history record has title
				if (historyItems[i].title.length > 0) {
					// not showing multiple identical records
					var identicalTitle = true;
					for (var j = 0; j < data.length; j++) {
						if (data[j].title == historyItems[i].title) {
							identicalTitle = false;
							break;
						}
					}
					if (!identicalTitle) {
						continue;
					}
					// only need to remember the title and the url
					var newRecord = {
						title: historyItems[i].title,
						url: historyItems[i].url,
						lastVisitTime: historyItems[i].lastVisitTime
					}
					data.push(newRecord);
					update = true;
				}
			}
			// if have found enouth records, then build the DOM
			// otherwise, keep searching
			if (data.length < MINIMUM) {
				queryChromeHistory(divName, data, endTime - ONE_WEEK, endTime);
			} else {
				buildDomInDiv(divName, data);
			}
		}
	)
}
function buildHistoryList() {
	var data = [];
	// initial time cursor is set to current time
	queryChromeHistory("history", data, Date.now() - ONE_WEEK, Date.now());
}

// add listener to header to direct to main page
document.getElementById("brand").addEventListener('click',
	function() {
		// get current window
		chrome.windows.getCurrent(
			function (currentWindow) {
				// get all tab info in current window
				chrome.tabs.getAllInWindow(currentWindow.id, 
					function (tabs) {
						// check if main history page already open
						for (var i = 0; i < tabs.length; i++) {
							if (tabs[i].url == "chrome://history/") {
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
							url: "chrome://history"
						});
					}
				);
				return;
			}
		);
	}
);

document.addEventListener('DOMContentLoaded',
	function() {
		load_invisible_item(buildHistoryList);
	}
);