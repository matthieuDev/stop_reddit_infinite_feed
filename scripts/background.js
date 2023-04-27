  
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

function cancel(requestDetails) {
    filterHtml();

    if (requestDetails.url === 'https://www.reddit.com/') {
        i = 25;
        maxPost = loadMaxPost();
    }
    else if (requestDetails.url === 'https://gql.reddit.com/') {
        postData = parseBodyPost(requestDetails)
        if (!!postData && isAskingNextBatch(postData)) {

            curr_after = postData.variables.after;
            nb_post_next_page = postData.variables.pageSize;

            curr_plus_pagesize = i + nb_post_next_page;
            curr_is_passing_threshold = i <= maxPost && curr_plus_pagesize > maxPost;

            if (last_after === curr_after) {
                i += nb_post_next_page;
            } else {
                last_after = curr_after;
            }

            if (curr_is_passing_threshold) {
                // when the threshold was just passed
                return {cancel: false};
            }
            
            if (i > maxPost) {
                return { cancel: true };
            }
        }
    }
    return {cancel: false};
}

browser.webRequest.onBeforeRequest.addListener(
    cancel,
    {urls: ["https://www.reddit.com/*", "https://gql.reddit.com/*", "https://preview.redd.it/*"]},
    ["blocking", "requestBody"],
);
