  
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
let last_after;

let curr_after ;
let nb_post_next_page ;
let curr_is_passing_threshold ;

let curr_url;

function filterHtmlThen(tabs, y) {
    browser.tabs.sendMessage(tabs[0].id, {
        command: "filterHtml",
        maxPost: maxPost,
    });
}
function reportError(error) {
    console.error(`Could not beastify: ${error}`);
}

filterHtml = () => {
    browser.tabs.query({active: true, currentWindow: true})
        .then(filterHtmlThen)
        .catch(reportError);
}

parseBodyPost = request => request.requestBody && JSON.parse(decodeURIComponent(String.fromCharCode.apply(null,
    new Uint8Array(request.requestBody.raw[0].bytes)
)));

isAskingNextBatch = postData => {
    const variables = postData.variables;
    return !!(variables && variables.pageSize && variables.after)
}

const isGoodBaseUrl = url => {
    if (!url) return false;
    return url === 'https://www.reddit.com/' || (url.startsWith('https://www.reddit.com/r/') && url.split('/')[5] !== 'comments');
} 

function cancel(requestDetails) {
    // get current url
    browser.tabs.query({active: true, currentWindow: true})
        .then(tabs => {
            curr_url = tabs[0].url;
        });

    if (!isGoodBaseUrl(curr_url)) return;

    filterHtml();

    // When coming to a new page
    if (isGoodBaseUrl(requestDetails.url)) {
        i = 0;
        maxPost = loadMaxPost();
    }
    else if (requestDetails.url.startsWith('https://www.reddit.com/svc/shreddit/feeds/home-feed')) {
        const distanceList = (requestDetails.url.split('?')[1] ?? '').split('&').filter(v => v.startsWith('distance='));
        if (distanceList.length == 1) {
            i = parseInt(distanceList[0].split('=')[1])
        }
        if (i > maxPost) {
            return { cancel: true };
        }
    }
    return {cancel: false};
}

browser.webRequest.onBeforeRequest.addListener(
    cancel,
    {urls: ["https://www.reddit.com/", "https://www.reddit.com/svc/shreddit/feeds/*", "https://www.reddit.com/r/*/"]},
    ["blocking", "requestBody"],
);
