import { Octokit } from "https://cdn.skypack.dev/@octokit/core";

(() => {
        
var main = document.getElementById("main");

function clearElements() {
    // Clear elements
    var child = main.lastElementChild; 
    while (child) {
        main.removeChild(child);
        child = main.lastElementChild;
    }
}

function displayFor(repo, versions, displayVersion) {
        var url = new URL(window.location.href);
        url.searchParams.set(`repo`, repo);

        var tree = document.createDocumentFragment();

        var div = document.createElement("div");
        div.setAttribute("id", `container-${repo}`);

        var iframe = document.createElement("iframe");
        iframe.setAttribute("id", `frame-${repo}`);
        iframe.setAttribute("style", `position:fixed; top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:-1;`);
        const repoSrc = `/docs/${repo}`;
        let src = repoSrc;
        if (displayVersion && displayVersion !== `latest`) {
            src = `/docs/${repo}/versions/${displayVersion}`;
            url.searchParams.set(`version`, displayVersion);
        } else {
            url.searchParams.delete(`version`);
        }

        history.pushState(null, ``, url);

        var searchPath = url.searchParams.get(`path`);
        if (searchPath) {
            iframe.setAttribute("src", `${window.location.pathname.slice(0,-1)}${src}${searchPath}`);
        } else {
            iframe.setAttribute("src", `${window.location.pathname.slice(0,-1)}${src}`);
        }
        let intervalId = undefined;
        intervalId = setInterval(() => {
            try {
                if (!iframe || !iframe.parentElement || !iframe.contentWindow || !iframe.contentWindow.location) {
                    clearInterval(intervalId);
                } else if (iframe.contentWindow.location.search) {
                    const search = iframe.contentWindow.location.search;
                    if (search) {
                        url = new URL(window.location.href);
                        url.searchParams.set(`path`, search);
                        if (url.href != window.location.href) {
                            history.pushState(null, ``, url);
                        }
                    }
                }
            } catch (error) {
                console.error(error);
                clearInterval(intervalId);
            }
        }, 50);

        if (versions && versions.length > 0) {
            var select = document.createElement( 'select' );
            var option;

            option = document.createElement( 'option' );

            option.value = option.textContent = `latest`;

            select.appendChild( option );

            versions.forEach(( item ) => {

                option = document.createElement( 'option' );

                option.value = option.textContent = item;

                select.appendChild( option );
            });
            select.style.position = "absolute";
            select.style.top = `27px`;
            select.style.left = `120px`;
            select.addEventListener(`change`, (evt) => {
                const newDisplayVersion = evt.target.value;
                if (newDisplayVersion !== displayVersion && (displayVersion || newDisplayVersion !== `latest`)) {
                    clearElements();
                    displayFor(repo,versions, newDisplayVersion);
                }
            });

            if (displayVersion && displayVersion !== `latest`) {
                select.options[versions.indexOf(displayVersion) + 1].selected = true;
            }

            div.appendChild(select);
        }

        div.appendChild(iframe);

        tree.appendChild(div);

        main.appendChild(tree);
}

// Octokit.js
// https://github.com/octokit/core.js#readme
const octokit = new Octokit({
    // auth: 'personal-access-token123'
});

if (window.origin && window.location && history) {
    if (window.location.search) {
        var url = new URL(window.location.href);
        var repo = url.searchParams.get(`repo`);
        if (repo) {
            let versions = [];
            var version = url.searchParams.get(`version`);
            octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner: 'innofake',
                repo: 'open-source-docs',
                path: `docs/${repo}/versions`
            }).then(atPath => {
                console.log(atPath);
                versions = atPath.data.map(v => v.name);

                clearElements();
    
                displayFor(repo, versions, version);
            }).catch(err => {
                console.warn(err);

                clearElements();
    
                displayFor(repo, versions, version);
            });
            return;
        }
    }
}

octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner: 'innofake',
                repo: 'open-source-docs',
                path: 'docs'
}).then(result => {
    console.log(result);

    result.data.forEach(item => {      
        const path = item.name; 

        var tree = document.createDocumentFragment();

        var div = document.createElement("div");
        div.setAttribute("id", `container-${path}`);

        var button = document.createElement("button");
        button.setAttribute("id", `btn-${path}`);
        button.appendChild(document.createTextNode(path));
        button.addEventListener("click", async (e) => {
            let versions = [];
            try {
                var atPath = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                    owner: 'innofake',
                    repo: 'open-source-docs',
                    path: `docs/${path}/versions`
                });
                console.log(atPath);
                versions = atPath.data.map(v => v.name);

            } catch (err) {
                console.log(err);    
            }
            clearElements();

            displayFor(path, versions);
        });

        div.appendChild(button);

        tree.appendChild(div);

        main.appendChild(tree);
    });
})
.catch(err => { 
    console.error(err);
});
})();