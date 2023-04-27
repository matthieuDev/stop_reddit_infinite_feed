function changeMaxNbPost() {
    localStorage.setItem('stop_reddit_inifinite_feed_max_nb_posts', document.querySelector('#limitNbPost').value);
}
const DEFAULT_MAX_POST = 40;
function loadMaxPost () {
    try {
        return parseInt(localStorage.getItem('stop_reddit_inifinite_feed_max_nb_posts')) || DEFAULT_MAX_POST;
    } catch (err) {
        return NaN
    }
}

document.getElementById('limitNbPost').value = loadMaxPost();

const updateLimit = document.getElementById('UpdateLimit');
updateLimit.onclick = changeMaxNbPost;

