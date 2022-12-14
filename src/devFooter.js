import gitLogo from "./images/github.png";

const footer = (() =>{
    const add = ()=>{
        const footerDiv = document.getElementById('footer');
        footerDiv.innerText='Copyright © 2021 devLuisTorres';
        const githubLogo = new Image();
        githubLogo.src = gitLogo;
        footerDiv.appendChild(githubLogo);
        footerDiv.style.cssText = 'width: 100%;background-color: rgba(0, 0, 0, 0.3);bottom:0;position:relative;height: 45px;background: #eee;color: rgb(0, 0, 0);flex: initial;display: flex;justify-content: center;align-items: center';
        githubLogo.style.cssText = 'height: 30px;cursor: pointer';
        githubLogo.addEventListener('click', () => {
            window.open('https://github.com/dvluistorres', '_blank');
            });
    }
    return {add}
})()

export {footer}