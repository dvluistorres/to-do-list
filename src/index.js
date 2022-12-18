import './style.css';
import {footer} from './devFooter';


footer.add();

const project = (()=>{
    const projectFactory = (name , importance , dueDate) => {
        let position = 0;
        let tasks = [1,2,3,4,5,6,7,8,9,10];
        let completedTasks = 0;
        return{name , importance , dueDate , position , tasks , completedTasks}
    }

    let myProjects = []

    const retrieveMyProjects = () =>{
        try {
            myProjects = JSON.parse(localStorage.getItem('myProjects'));
            modifyDOM.addSidebarProject(myProjects);
            console.log("retrieved")
        } catch (error) {
            console.log("No projects in local storage yet");
            myProjects = []
        }
    }

    function addProject(){
        const projectName = document.getElementById('projectName').value;
        const projectImportance = document.querySelector('input[name="ProjectImportance"]:checked').value;
        const dueDate = document.getElementById('dueDate').value;
        const newProject = projectFactory(projectName,projectImportance, dueDate);
        newProject.numberOfTasks = 8;
        newProject.completedTasks = 4;
        document.getElementById('projectName').value = ""
        document.getElementById('dueDate').value = ""
        myProjects.push(newProject);
        myProjects.sort((a,b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0));
        let positionCounter = 0
        for (const project of myProjects){
            project.position = positionCounter;
            positionCounter++;
        }
        modifyDOM.addSidebarProject(myProjects);
        modal.createProject();
        localStorage.setItem('myProjects', JSON.stringify(myProjects));
    }

    function addTask(){
        console.log(1)
    }

    return {addProject , retrieveMyProjects , addTask}
})()

const modal = (()=>{
    const createProject = () => {
        const bodyClassList = document.body.classList;

        if (bodyClassList.contains("projectModal")) {
          bodyClassList.remove("projectModal");
          bodyClassList.add("open");
        } else {
          bodyClassList.remove("open");
          bodyClassList.add("projectModal");
        }
      };

    const createTask = () => {
    const bodyClassList = document.body.classList;

    if (bodyClassList.contains("taskModal")) {
        bodyClassList.remove("taskModal");
        bodyClassList.add("open");
    } else {
        bodyClassList.remove("open");
        bodyClassList.add("taskModal");
    }
    };

    return {createProject,createTask}
})()

const modifyDOM = (()=>{
    const addSidebarProject = (projects) => {
        removeListenersByClass("sidebarCard" , sidebarCardClick);
        removeElementsByClass("sidebarCard");
        for (const project of projects){
            const addProgress = ({
                progress: () => Math.round(project.completedTasks / project.tasks.length * 100)
            });
            Object.assign(project,addProgress);
            const sidebarCard = createElement('div',`sidebarCard ${project.position}`);
            const cardTitle = createElement ('p','cardTitle');
            cardTitle.innerText = project.name;
            const cardProgressBar = createElement('div','cardProgressBar');
            const cardProgress = createElement('div','cardProgress');
            cardProgress.style.width = `${project.progress()}%`;
            const importanceColor = () => {
                if (project.importance === 'important'){
                    return 'red'
                } else if (project.importance === 'normal'){
                    return 'yellow'
                } else {
                    return 'green'
                }
            }
            sidebarCard.style.borderBottom = `solid 3px ${importanceColor()}`;
            cardProgressBar.append(cardProgress);
            sidebarCard.append(cardTitle , cardProgressBar);
            document.getElementById('projects').appendChild(sidebarCard);
            sidebarCard.addEventListener('click',sidebarCardClick);
            const opt = document.createElement('option');
            opt.setAttribute("class","projectSelectionList")
            opt.value = project.name;
            opt.textContent = project.name;
            document.getElementById('parentProject').appendChild(opt);
        }
        

    };

    function sidebarCardClick (){
        console.log("1")
    }

    function removeElementsByClass(className){
        const elements = document.getElementsByClassName(className);
        while(elements.length > 0){
            elements[0].parentNode.removeChild(elements[0]);
        }
    }

    function removeListenersByClass(className,listenerFunction){
    const elements = document.getElementsByClassName(className);
    for (const element of elements){
        element.removeEventListener('click',listenerFunction);
    }
    }

    function createElement (type , className){
        const newElement = document.createElement(type);
        newElement.setAttribute('class',className);
        return newElement
    }
    return {addSidebarProject , createElement}
})()

const modalCreateProject = document.getElementsByClassName('modalCreateProject');
for (const element of modalCreateProject){
    element.addEventListener('click',modal.createProject)
}

const modalCreateTask = document.getElementsByClassName('modalCreateTask');
for (const element of modalCreateTask){
    element.addEventListener('click',modal.createTask)
}

project.retrieveMyProjects();

const projectCreateButton = document.getElementById('projectCreateButton');
projectCreateButton.addEventListener('click',project.addProject);

const taskCreateButton = document.getElementById('taskCreateButton');
taskCreateButton.addEventListener('click',project.addTask);