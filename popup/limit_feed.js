/**
* Listen for clicks on the buttons, and send the appropriate message to
* the content script in the page.
*/
function listenForClicks() {
    document.addEventListener("click", (e) => {

    /**
    * Insert the page-hiding CSS into the active tab,
    * then get the beast URL and
    * send a "beastify" message to the content script in the active tab.
    */
    function UpdateLimit(tabs) {
        const limitNbPost = document.getElementById("limitNbPost").value;
        browser.tabs.sendMessage(tabs[0].id, {
            command: "UpdateLimit",
            limitNbPost: limitNbPost,
        });
    }

    /**
     * Just log the error to the console.
     */
     function reportError(error) {
        console.error(`Could not beastify: ${error}`);
    }

    /**
    * Get the active tab,
    * then call "beastify()" or "reset()" as appropriate.
    */
    if (e.target.classList.contains("UpdateLimit")) {
        browser.tabs.query({active: true, currentWindow: true})
            .then(UpdateLimit)
            .catch(reportError);
    } 
});
}


function reportExecuteScriptError(error) {
    console.error(`lol nope: ${error.message}`);
}

/**
* When the popup loads, inject a content script into the active tab,
* and add a click handler.
* If we couldn't inject the script, handle the error.
*/
browser.tabs.executeScript({file: "/scripts/apply.js"})
    .then(listenForClicks)
    .catch(reportExecuteScriptError);
