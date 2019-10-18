function parseToDomainGroup(historyItems) {
	if (historyItems == undefined) {
		return undefined;
	}
	var historyGroups = [];
	if (historyItems.length === 0) {
		return historyGroups;
	}
	historyGroups.push(jQuery.extend(true, {
		'isGroup': false
	}, historyItems[0]));
	var len = 1;
	for (var i = 1; i < historyItems.length; i++) {
		if (parseURL(historyGroups[len - 1].url).host
			== parseURL(historyItems[i].url).host) {
			if (!historyGroups[len - 1].isGroup) {
				var originItem = jQuery.extend(true, {
					'deleted': false
				}, historyGroups[len - 1]);
				delete originItem.isGroup;
				historyGroups[len - 1].isGroup = true;
				historyGroups[len - 1]['group'] = new Array(originItem);
				historyGroups[len - 1]['groupHost'] = parseURL(originItem.url).host;
			}
			historyGroups[len - 1].group.push(jQuery.extend(true, {'deleted': false}, historyItems[i]));
		} else {
			historyGroups.push(jQuery.extend(true, {'isGroup': false}, historyItems[i]));
			len++;
		}
	}
	return historyGroups;
}