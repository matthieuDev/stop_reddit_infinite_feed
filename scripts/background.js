  
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

function cancel(requestDetails) {
    maxPost = loadMaxPost();

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

    if (i > maxPost) {
        return {cancel: true};
    }

    let filter = browser.webRequest.filterResponseData(requestDetails.requestId);
    let decoder = new TextDecoder("utf-8");
    let encoder = new TextEncoder();

    filter.ondata = (event) => {
        if (i >= maxPost) return;
        
        let str = decoder.decode(event.data, { stream: true });
        const newI = i + (str.match('</article>')?.length ?? 0) ;
        if (newI >= maxPost) {
            let toWrite = '';
            for (;i < maxPost;i++) {
                const sizeTag =  '</article>'.length;
                const posTag = str.indexOf('</article>') + sizeTag;
                toWrite += str.slice(0, posTag);
                str = str.slice(posTag);
            }
            filter.write(encoder.encode(toWrite));
            return;
        }
        i = newI;
        filter.write(encoder.encode(str));
    };

    filter.onstop = (event) => {
        filter.close();
    };

    return {cancel: false};
}

browser.webRequest.onBeforeRequest.addListener(
    cancel,
    {urls: ["https://www.reddit.com/svc/shreddit/feeds/*", "https://www.reddit.com/svc/shreddit/community-more-posts/*"]},
    ["blocking"],
);
