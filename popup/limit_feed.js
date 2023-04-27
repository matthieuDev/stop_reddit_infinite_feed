/**
* Listen for clicks on the buttons, and send the appropriate message to
* the content script in the page.
*/
function listenForClicks() {
    document.addEventListener("click", (e) => {


    function UpdateLimit(tabs) {
        const limitNbPost = document.getElementById("limitNbPost").value;
        browser.tabs.sendMessage(tabs[0].id, {
            command: "UpdateLimit",
            limitNbPost: limitNbPost,
        });
    }


     function reportError(error) {
        console.error(`Could not send message: ${error}`);
    }

 
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
