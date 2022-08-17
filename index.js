
function goHome() {
    var url = new URL(window.location.href);
    headerLabel.textContent = `Innofake: Open Source Docs`;
    window.document.title = `Innofake: Open Source Docs`;
    var newUrl = url.href.replace(url.search, ``);
    history.pushState({ url: newUrl }, ``, newUrl);
    load(false, newUrl);
};

function goFullscreen() {
    if (!iframe || !iframe.parentElement || !iframe.contentWindow || !iframe.contentWindow.location) {
        console.warn(`Attempted to go fullscreen with no iframe`);
    } else {
        window.location.href = iframe.contentWindow.location.href;
    }
}

window.addEventListener(`popstate`, evt => {
    if (intervalId) {
        try {
            clearInterval(intervalId);
        } catch (error) {

        }
        intervalId = undefined;
    }
    if (evt.state && evt.state.url) {
        load(false, evt.state.url);
    } else {
        // window.location.reload();
        load(false, window.location.href);
    }
});
// history.replaceState({ url: window.location.href }, ``, window.location.href);

let intervalId = undefined;
let iframe = undefined;
let selectChange = undefined;
var home = document.getElementById("btn-home");
var header = document.getElementById("header");
var headerLabel = document.getElementById("header-label");
var select = document.getElementById("version-select");
var fullscreen = document.getElementById("btn-fullscreen");

home.addEventListener(`click`, goHome);
fullscreen.addEventListener(`click`, goFullscreen);

async function load(pushState = true, loadUrl = undefined) {

    loadUrl = new URL(loadUrl || window.location.href);

    const baseRef = window.location.pathname.slice(0, -1);

    const requestInit = {
        mode: `cors`,
        method: `GET`,
        credentials: `same-origin`,
        headers: {
            'Pragma': `no-cache`,
            'Cache-Control': `no-store`
        }
    };
    let response = await fetch(`${baseRef}/repos.json`, requestInit);
    let structure = await response.text();
    if (structure) {
        structure = JSON.parse(structure);
    } else {
        structure = {
            repos: []
        };
    }

    var main = document.getElementById("main");

    function clearElements(el) {
        if (!el) {
            el = main;
        }
        // Clear elements
        var child = el.lastElementChild;
        while (child) {
            el.removeChild(child);
            child = el.lastElementChild;
        }
    }
    clearElements();

    function displayFor(repo, versions, displayVersion, pushState) {
        if (select && selectChange) {
            select.removeEventListener(`change`, selectChange);
            selectChange = undefined;
        }
        var url = new URL(window.location.href);
        url.searchParams.set(`repo`, repo);

        headerLabel.textContent = `Innofake: ${repo}`
        window.document.title = `Innofake: ${repo}`

        var tree = document.createDocumentFragment();

        var div = document.createElement("div");
        div.setAttribute("id", `container-${repo}`);

        iframe = document.createElement("iframe");
        iframe.setAttribute("id", `frame-${repo}`);
        iframe.setAttribute("class", `content-frame`);
        const repoSrc = `/docs/${repo}`;
        let src = repoSrc;
        if (displayVersion && displayVersion !== `latest`) {
            src = `/docs/${repo}/versions/${displayVersion}`;
            url.searchParams.set(`version`, displayVersion);
        } else {
            url.searchParams.delete(`version`);
        }

        if (pushState) {
            history.pushState({ url: url.href }, ``, url.href);
        }

        var searchPath = url.searchParams.get(`path`);
        if (searchPath) {
            iframe.setAttribute("src", `${baseRef}${src}${searchPath}`);
        } else {
            iframe.setAttribute("src", `${baseRef}${src}`);
        }
        intervalId = setInterval(() => {
            try {
                if (!iframe || !iframe.parentElement || !iframe.contentWindow || !iframe.contentWindow.location) {
                    clearInterval(intervalId);
                } else if (iframe.contentWindow.location.search) {
                    const search = iframe.contentWindow.location.search;
                    if (search) {
                        url = new URL(window.location.href);
                        const hadPath = url.searchParams.has(`path`);
                        url.searchParams.set(`path`, search);
                        if (url.href != window.location.href && url.searchParams.has(`repo`)) {
                            if (hadPath) {
                                history.pushState({ url: url.href }, ``, url.href);
                            } else {
                                history.replaceState({ url: url.href }, ``, url.href);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(error);
                clearInterval(intervalId);
            }
        }, 50);

        if (versions && versions.length > 0) {
            select.setAttribute(`class`, `version-select`);
            clearElements(select);
            var option;

            option = document.createElement('option');

            option.value = option.textContent = `latest`;

            select.appendChild(option);

            versions.forEach((item) => {

                option = document.createElement('option');

                option.value = option.textContent = item;

                select.appendChild(option);
            });
            selectChange = (evt) => {
                const newDisplayVersion = evt.target.value;
                if (newDisplayVersion !== displayVersion && (displayVersion || newDisplayVersion !== `latest`)) {
                    clearElements();
                    displayFor(repo, versions, newDisplayVersion, true);
                }
            }
            select.addEventListener(`change`, selectChange);

            if (displayVersion && displayVersion !== `latest`) {
                select.options[versions.indexOf(displayVersion) + 1].selected = true;
            }

            // header.appendChild(select);
        } else {
            select.setAttribute(`class`, `hidden`);
        }
        fullscreen.classList.remove(`hidden`);

        div.appendChild(iframe);

        tree.appendChild(div);

        main.appendChild(tree);
    }


    if (loadUrl.search) {
        var url = loadUrl;
        var repo = url.searchParams.get(`repo`);
        if (repo) {
            let versions = [];
            var version = url.searchParams.get(`version`);
            let definition = structure.repos.find(r => r.name === repo);
            if (definition) {
                versions = definition.versions || [];
            }
            clearElements();

            displayFor(repo, versions, version, pushState);
            return;
        }
    }
    headerLabel.textContent = `Innofake: Open Source Docs`;
    window.document.title = `Innofake: Open Source Docs`;
    select.setAttribute(`class`, `hidden`);
    fullscreen.classList.add(`hidden`);
    
    var barTree = document.createDocumentFragment();
    var barDiv = document.createElement("div");
    barDiv.setAttribute("id", `container-buttons`);
    barDiv.setAttribute("class", "btn-bar");

    structure.repos.forEach(item => {
        const path = item.name;

        var tree = document.createDocumentFragment();

        var div = document.createElement("div");
        div.setAttribute("id", `container-${path}`);
        div.setAttribute("class", "btn-container");

        var button = document.createElement("button");
        button.setAttribute("id", `btn-${path}`);
        button.appendChild(document.createTextNode(path));
        button.addEventListener("click", async (e) => {
            let versions = item.versions || [];
            clearElements();

            displayFor(path, versions, undefined, true);
        });

        div.appendChild(button);

        tree.appendChild(div);

        barDiv.appendChild(tree);
    });

    barTree.appendChild(barDiv);

    main.appendChild(barTree);
    // })
    // .catch(err => { 
    //     console.error(err);
    // });
}

load(true);