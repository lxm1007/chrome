# A Test Branch in First Sprint

In this branch, I simply test some chrome API.

** This branch will not be merged into dev branch. **

** It is just used to learn Chrome API & Git !**

The main source code is available on **`"js/"`** folder. And the referenced
HTML page is located on **'"html/"'** folder. It includes 

- search_history.js
- search_visit.js

------

## Override page

The chrome supports to use own html page to override some default pages.

For more details, pls see [Chrome Doc](https://developer.chrome.com/extensions/override)

For testing, I simply modify the **manifest.json** 

'''
  "chrome_url_overrides" : {
    "history": "html/test_search_history.html"
  },
'''

Then, the original **chrome://history** page is replaced with my 
test page.

## History Search API

> chrome.history.search(object query, function callback)

This function takes query condition as input, then it will execute the
callback function when completing search.

The output is a array of history items. For each history items, it
contains those attributions:

- id 
- url
- title
- lastVisitTime
- visitCount
- typedCount

** TODO: ** I still can't understand what lastVisitTime means. In the chrome's
document, it explains this attribution as 
>  When this page was last loaded, represented in milliseconds since the epoch.

However, I don't know what **epoch** means.

In the **test_search_history.html**, I show the results of history items in the
past 3 days.

## Visit Search API

> chrome.history.getVisits(object details, function callback)

This function is quite like to **chrome.history.search** API. It takes 
url object as input and it will execute the callback function when completing search.

The parameter **details** should be formulated like this:

> {url : history_list[i].url}

The visitItem has some attributions:

- id
- visitId
- visitTime
- referringVisitId
- transition

The transition type reveals which method the user used to access this page.
For more details, pls reference to [Chrome Doc](https://developer.chrome.com/extensions/history#type-TransitionType)

I do some experiments to understand the meaning of each attribution.

- id denotes the History Item's id. In the other words, if I re-visit a link
for several times, it will result a list of visit items having same **id**.
- visitId is used to identify echo visit item.
- visitTime, just like the **lastVisitTime** in history item.

**TODO**: what confused me most is the **referringVisitId**. In some visit item,
its value can be 0. And I don't know what does "0" means.

If I click a link in google searching page, it will result a visit item like this:

- id:96
- visitId:7904 
- visitTime: 1479370587064.101
- referringVisitId: 7903
- transition: link

However, if I tpye a link from a **new** tab. I still can get a referringVisitId!?

- id:96
- visitId:7906
- visitTime: 1479370607722.2732
- referringVisitId: 7905
- transition: typed

It seems that a new tab has an visit item, too. So I feel confused about "0" referringVisitId.

