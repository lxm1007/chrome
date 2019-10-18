/* ------------------------------------------------------------
 * This function is a re-capsulated function of native chrome
 * history search api.
 * It group more search mode like only specify text or only
 * specify date.
 * It also support modes like multiURL, noTitle, etc.
 * ------------------------------------------------------------ */

/**
 * Take search condition as input and return hitory items and the
 * description of these itmes.
 * 
 * @param {!Object} searchCondition Specify the search conditions
 * {
 *   text: {!string}
 *   startTime: {!double} Milliseconds from epoch time
 *       Same meaning as in native chrome api.
 *   endTime: {!double} Milliseconds from epoch time
 *       Same meaning as in native chrome api.
 *   maxResults: {!int} Greater than zero
 *       Expect to get <maxResults> items, return less
 *       itmes if fewer items satify other conditions.
 *       If more than <maxResults> items found, return
 *       the latest <maxResults> items.
 *   multiURL: {!boolean}
 *       Specify whether to return multiple records if the same
 *       url is visited in the time intervel.
 *   noTitle: {!boolean}
 *       Whether to return records with no title.
 * }
 * @param {!function} callback What to do after desired records
 *            all collected.
 * @return {!Array of Object} historyItems Array containing all
 *            the history record items which satisfy given
 *            condition.
 * @return {!Object} itemsAttributes Describe attributes of 
 *            historyItems.
 * {
 *   startTime: {!double} Milliseconds from epoch time
 *       Same meaning as in native chrome api.
 *   endTime: {!double} Milliseconds from epoch time
 *       Same meaning as in native chrome api.
 * }
 */

const DEFAULT_MAX_RESULT 	= 100;
const ONE_DAY				= 3600 * 24 * 1000;
const ONE_WEEK				= ONE_DAY * 7;
const ONE_MONTH				= ONE_DAY * 30;

const TIME_SCALE			= ONE_WEEK;

function search(searchCondition, callback) {
	if (searchCondition == undefined) {
		var searchCondition = {};
	}
	var selectedCondition = {};

	// Complete search conditions

	if (searchCondition.text == undefined) {
		// <text> is set to empty by default
		selectedCondition['text'] = "";
	} else {
		selectedCondition['text'] = searchCondition.text;
	}

	if (searchCondition.endTime == undefined) {
		// <endTime> is defaultly set to the time when search process
		selectedCondition['endTime'] = Date.now();
	} else {
		selectedCondition['endTime'] = searchCondition.endTime;
	}

	if (searchCondition.startTime == undefined) {
		// This complement can be used for conveniently show records close to some date
		selectedCondition['startTime'] = searchCondition.endTime - TIME_SCALE;
	} else {
		selectedCondition['startTime'] = searchCondition.startTime;
	}

	if (selectedCondition.endTime <= selectedCondition.startTime) {
		callback([]);
		return;
	}

	var date = new Date(selectedCondition.endTime);
	date.setHours(0, 0, 0, 0);

	// Search history records day by day, and group records with same date
	// into one block.
	// In this case, records in one block will be distinct.
	var itemBlocks = [];
	var now = new Date(date);
	while (now.getTime() > selectedCondition.startTime - ONE_DAY) {
		itemBlocks.push({
			startTime: now.getTime(),
			endTime: Math.min(now.getTime() + ONE_DAY, selectedCondition.endTime),
			items: []
		});
		now.setDate(now.getDate() - 1);
	}

	var totalItems = 0;
	var countItems = 0;
	for (var i = 0; i < itemBlocks.length; i++) {
		!function(num) {
			var condition = jQuery.extend(true, {}, selectedCondition);
			condition.startTime = itemBlocks[num].startTime;
			condition.endTime = itemBlocks[num].endTime;
			condition.maxResults = 1000;		// To get all the records in this time interval,
												// <maxResults> should be large enough.
			chrome.history.search(condition, 
				function(historyItems) {
					// Invisible is an important basic feature, it should be done right
					// after raw history records are obtained.
					var visibleItems = [];
					for (var i = 0; i < historyItems.length; i++) {
						var invisible = false;
						for (var j = 0; j < invisible_item.length; j++) {
							if (invisible_item[j].active
								&& matchWord(historyItems[i].url, invisible_item[j].url)) {
								// Invisible only if the key word appears as one word,
								// not a substring of a word
								invisible = true;
								break;
							}
						}
						if (!invisible) {
							visibleItems.push(historyItems[i]);
						}
					}
					historyItems = visibleItems;

					// It is assumed that, <visitTime> will be processed
					// after all item been obtained.
					itemBlocks[num].items = historyItems;
					totalItems += historyItems.length;

					// No history match the given conditions.
					if (num == itemBlocks.length - 1 && totalItems === 0) {
						callback([]);
						return;
					}

					// Add <visitTime>
					for (var i = 0; i < historyItems.length; i++) {
						!function(blockID, itemID) {
							var item = itemBlocks[blockID].items[itemID];
							var endTime = itemBlocks[blockID].endTime;
							chrome.history.getVisits({'url': item.url},
								function(visitItem) {
									// It is assumed that the visit items are organized
									// in visit time descending order.
									for (var i = visitItem.length - 1; i >= 0; i--) {
										if (visitItem[i].visitTime <= endTime) {
											item['visitTime'] = visitItem[i].visitTime;
											break;
										}
									}
									countItems++;
									// All items' <visitTime> are obtained.
									if (countItems == totalItems) {
										// Follow the pattern of native search API,
										// return the array of history items.
										var res = [];
										for (var i = 0; i < itemBlocks.length; i++) {
											res.push.apply(res, itemBlocks[i].items);
										}
										callback(res);
									}
								}
							);
						}(num, i);
					}
				}
			);
		}(i)
		// Push the date to previous one day.
		date.setDate(date.getDate() - 1);
	}
}