  
console.log('FFFFFFFFFFFFFFF UUUUUUUUUUUUUUUU')
let i = 0;
let maxPost = 20;
let last_after;

let curr_after ;
let nb_post_next_page ;
let curr_is_passing_threshold ;

parseBodyPost = request => request.requestBody && JSON.parse(decodeURIComponent(String.fromCharCode.apply(null,
    new Uint8Array(request.requestBody.raw[0].bytes)
)));

isAskingNextBatch = postData => {
    const variables = postData.variables;
    return !!(variables && variables.pageSize && variables.after)
}

function cancel(requestDetails) {
    if (requestDetails.url === 'https://www.reddit.com/') i = 25;
    /* else if (
        requestDetails.url.startsWith('https://preview.redd.it/') &&
        !requestDetails.url.startsWith('https://preview.redd.it/award_images/')
    ) {
        i+=1;
        if (i > 500) {
            console.log('Cancelled')
            return { cancel: true };
        } 
    } */
    else if (requestDetails.url === 'https://gql.reddit.com/') {
        postData = parseBodyPost(requestDetails)
        if (!!postData && isAskingNextBatch(postData)) {
            console.log('lllllllll', isAskingNextBatch(postData), postData);

            curr_after = postData.variables.after;
            nb_post_next_page = postData.variables.pageSize;

            curr_plus_pagesize = i + nb_post_next_page;
            curr_is_passing_threshold = i <= maxPost && curr_plus_pagesize > maxPost;
            console.log(i,last_after , curr_after, `Canceling___________: ${requestDetails.url}`, requestDetails.url === 'https://gql.reddit.com/', typeof(requestDetails));

            if (last_after === curr_after) {
                i += nb_post_next_page;
            } else {
                last_after = curr_after;
            }
            console.log(i,last_after , curr_after, `+++++++++++++: ${requestDetails.url}`, requestDetails.url === 'https://gql.reddit.com/', typeof(requestDetails));

            if (curr_is_passing_threshold) {
                return {cancel: false};
            }
            
            if (i > maxPost) {
                console.log('Cancelled',)
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
