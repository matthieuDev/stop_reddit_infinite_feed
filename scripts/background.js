  
const DEFAULT_MAX_POST = 40;
function loadMaxPost () {
    try {
        return parseInt(localStorage.getItem('stop_reddit_inifinite_feed_max_nb_posts')) || DEFAULT_MAX_POST;
    } catch (err) {
        return DEFAULT_MAX_POST
    }
}


let i = 0;
let maxPost = loadMaxPost();

function filterHtmlThen(tabs, y) {
    browser.tabs.sendMessage(tabs[0].id, {
        command: "filterHtml",
        maxPost: maxPost,
    });
}
function reportError(error) {
    console.error(`Could not query tab: ${error}`);
}

filterHtml = () => {
    browser.tabs.query({active: true, currentWindow: true})
        .then(filterHtmlThen)
        .catch(reportError);
}
function cancel(requestDetails) {

    filterHtml();
    if (requestDetails.url.startsWith('https://www.reddit.com/svc/shreddit/feeds/home-feed')) {
        const distanceList = (requestDetails.url.split('?')[1] ?? '').split('&').filter(v => v.startsWith('distance='));
        if (distanceList.length == 1) {
            i = parseInt(distanceList[0].split('=')[1])
        }
    } else if (requestDetails.url.startsWith('https://www.reddit.com/svc/shreddit/community-more-posts/')) {
        const distanceList = (requestDetails.url.split('?')[1] ?? '').split('&').filter(v => v.startsWith('feedLength='));
        if (distanceList.length == 1) {
            i = parseInt(distanceList[0].split('=')[1])
        }
    } 
    return {cancel: i > maxPost};
}

browser.webRequest.onBeforeRequest.addListener(
    cancel,
    {urls: ["https://www.reddit.com/svc/shreddit/feeds/*", "https://www.reddit.com/svc/shreddit/community-more-posts/*"]},
    ["blocking"],
);
