
import { Octokit } from "https://cdn.skypack.dev/@octokit/core";
        

var main = document.getElementById("main");

// Octokit.js
// https://github.com/octokit/core.js#readme
const octokit = new Octokit({
    // auth: 'personal-access-token123'
})

octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner: 'innofake',
                repo: 'b0t-components-docs',
                path: 'docs'
}).then(result => {
    console.log(result);

    //var keys = Object.keys(result.data);
    result.data.forEach(item => {      
        const path = item.name; 

        var tree = document.createDocumentFragment();
        // var link = document.createElement("a");
        // link.setAttribute("id", "id1");
        // link.setAttribute("href", "http://site.com");
        // link.appendChild(document.createTextNode("linkText"));

        var div = document.createElement("div");
        div.setAttribute("id", `container-${path}`);

        var button = document.createElement("button");
        button.setAttribute("id", `btn-${path}`);
        button.appendChild(document.createTextNode(path));
        button.addEventListener("click", async (e) => {
            var atPath = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner: 'innofake',
                repo: 'b0t-components-docs',
                path: `docs/${path}`
            });
            console.log(atPath);


            //e.firstElementChild can be used.
            var child = main.lastElementChild; 
            while (child) {
                main.removeChild(child);
                child = main.lastElementChild;
            }
        });

        div.appendChild(button);

        tree.appendChild(div);

        main.appendChild(tree);
    });
})
.catch(err => { 
    console.error(err);
});