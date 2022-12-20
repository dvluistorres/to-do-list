import './style.css';
import {footer} from './devFooter';
import { compareAsc, format, parseISO } from 'date-fns'


footer.add();

const project = (()=>{
    const _projectFactory = (name , importance , dueDate) => {
        let position = 0;
        let tasks = [];
        let completedTasks = 0;
        let progress = 0;
        return{name , importance , dueDate , position , tasks , completedTasks , progress}
    }

    const _taskFactory = (name,dueDate,importance,notes,parentProject)=>{
        let position = 0;
        let isCompleted = false;
        return{name,dueDate,importance,notes,parentProject,position,isCompleted}
    }

    let myProjects = [];

    const retrieveMyProjects = () =>{
        try {
            myProjects = JSON.parse(localStorage.getItem('myProjects'));
            modifyDOM.addSidebarProject(myProjects);
        } catch (error) {
            console.log("No projects in local storage yet");
        }
    }

    function saveToLocal(){
        localStorage.setItem('myProjects', JSON.stringify(myProjects));
    }

    function addProject(){
        const projectName = document.getElementById('projectName').value;
        const myProjectsNames = myProjects.map(project => project.name.toLowerCase());
        if (myProjectsNames.includes(projectName.toLowerCase())){
            alert("Project name already in use");
            return
        }
        const projectImportance = document.querySelector('input[name="ProjectImportance"]:checked').value;
        const dueDate = document.getElementById('dueDate').value;
        if (compareAsc(parseISO(dueDate),new Date()) < 0){
            alert("Due date already passed");
            return
        } else if (dueDate == ''){
            alert('Please insert due date');
            return
        }
        const newProject = _projectFactory(projectName,projectImportance, dueDate);
        document.getElementById('projectName').value = '';
        document.getElementById('dueDate').value = '';
        myProjects.push(newProject);
        myProjects.sort((a,b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0));
        let positionCounter = 0
        for (const project of myProjects){
            project.position = positionCounter;
            positionCounter++;
        }
        modifyDOM.addSidebarProject(myProjects);
        modal.createProject();
        saveToLocal();
    }

    function addTask(){
        const taskName = document.getElementById('taskName').value;
        const taskDueDate = document.getElementById('taskDueDate').value;
        const taskImportance = document.querySelector('input[name="taskImportance"]:checked').value;
        const taskNotes = document.getElementById('taskNotes').value;
        const parentProject = document.getElementById('parentProject').value;
        const newTask = _taskFactory(taskName,taskDueDate,taskImportance,taskNotes,parentProject)
        document.getElementById('taskName').value = '';
        document.getElementById('taskDueDate').value = '';
        document.getElementById('taskNotes').value = '';
        const parentProjectIndex = myProjects.map(project => project.name).indexOf(parentProject);
        myProjects[parentProjectIndex].tasks.push(newTask);
        myProjects[parentProjectIndex].tasks.sort(compareAsc);
        let positionCounter = 0;
        for (const task of myProjects[parentProjectIndex].tasks){
            task.position = positionCounter;
            positionCounter++;
        }
        modal.createTask();
        saveToLocal();
        modifyDOM.addSidebarProject(myProjects);//to update bar progress
        modifyDOM.updateExplorer(myProjects.findIndex(project => project.name === parentProject))

    }

    function clearProjects(){
        if (!confirm("delete sure?")){
            return
        };
        myProjects = [];
        localStorage.setItem('myProjects', JSON.stringify(myProjects));
        modifyDOM.addSidebarProject(myProjects);
    }

    function getMyProjects(){
        return myProjects
    }

    function updateCompletedTasks(position){
        const completed = myProjects[position].tasks.filter(task => task.isCompleted).length
        myProjects[position].completedTasks = completed
    }

    return {retrieveMyProjects , addProject , addTask , clearProjects , getMyProjects , updateCompletedTasks , saveToLocal}
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
        _removeListenersByClass("sidebarCard" ,'click', _sidebarCardClick);
        _removeElementsByClass("sidebarCard");
        _removeElementsByClass("projectSelectionList");
        for (const project of projects){
            const addProgress = ({
                setProgress: () => {
                    let x = Math.round(project.completedTasks / project.tasks.length * 100)
                    project.progress = x;
                }
            });
            Object.assign(project,addProgress);
            const sidebarCard = createElement('div',`sidebarCard ${project.position}`);
            const cardTitle = createElement ('p','cardTitle');
            cardTitle.innerText = project.name;
            const cardProgressBar = createElement('div','cardProgressBar');
            const cardProgress = createElement('div','cardProgress');
            project.setProgress();
            if (project.progress === 100 || isNaN(project.progress)){
                cardProgress.setAttribute('style','clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%)');
            } else {
                cardProgress.setAttribute('style','clip-path: polygon(0 0, 100% 0, 95% 100%, 0% 100%)');
            }
            cardProgress.style.width = `${project.progress}%`;
            sidebarCard.style.borderLeft = `solid 5px ${_importanceColor(project)}`;
            cardProgressBar.append(cardProgress);
            sidebarCard.append(cardTitle , cardProgressBar);
            document.getElementById('projects').appendChild(sidebarCard);
            sidebarCard.addEventListener('click',_sidebarCardClick);
            const opt = document.createElement('option');
            opt.setAttribute("class","projectSelectionList")
            opt.value = project.name;
            opt.textContent = project.name;
            document.getElementById('parentProject').appendChild(opt);
        }
        

    };

    const _importanceColor = (currentProject) => {
        if (currentProject.isCompleted){
            return 'green'
        } else if (currentProject.importance === 'important'){
            return 'red'
        } else if (currentProject.importance === 'normal'){
            return 'orange'
        } else {
            return 'yellow'
        }
    }

    function updateExplorer(projectPosition){
        //Create Title
        const explorer = document.getElementById('explorer');
        _removeListenersByClass("explorerCard" ,'click' , _explorerCardTitleClick);
        _removeElementsByClass("explorerCard");
        _removeElementsByClass("taskCard");
        const currentProject = project.getMyProjects()[projectPosition];
        const explorerTitle = createElement('div','explorerCard explorerTittle');
        const cardTitle = createElement ('p','cardTitle');
        cardTitle.innerText = currentProject.name;
        const cardDate = createElement ('span','cardDate');
        cardDate.innerText = currentProject.dueDate;
        const cardProgressBar = createElement('div','cardProgressBar');
        const cardProgress = createElement('div','cardProgress');
        currentProject.setProgress();
        cardProgress.style.width = `${currentProject.progress}%`;
        explorerTitle.style.borderBottom = `solid 3px ${_importanceColor(currentProject)}`;
        cardProgressBar.append(cardProgress);
        explorerTitle.append(cardTitle , cardDate , cardProgressBar);
        explorer.appendChild(explorerTitle);
        //Crate task cards
        for (const task of currentProject.tasks){
            const taskCard = createElement('div','taskCard');
            const cardCheckbox = createElement('input','cardCheckbox');
            cardCheckbox.setAttribute('type','checkbox');
            cardCheckbox.checked = task.isCompleted;
            const updateCompletion = ({
                updateCompletion: () => {
                    task.isCompleted = !task.isCompleted
                }
            });
            Object.assign(task,updateCompletion);
            cardCheckbox.addEventListener('change', function cardCheckboxClick(Event){
                task.updateCompletion();
                project.updateCompletedTasks(projectPosition);
                currentProject.setProgress();
                document.getElementsByClassName('cardProgress')[projectPosition].setAttribute('style',`width: ${currentProject.progress}%`);
                cardProgress.style.width = `${currentProject.progress}%`;
                project.saveToLocal();
            })
            const cardTitle = createElement('div','taskTitle');
            cardTitle.innerText = task.name;
            const cardDate = createElement('div','taskDate');
            cardDate.innerText = format(parseISO(task.dueDate),'dd/MM/yyyy');
            const cardImportance = createElement('div','taskImportance');
            cardImportance.style.backgroundColor = _importanceColor(task);
            taskCard.append(cardCheckbox,cardTitle,cardDate,cardImportance);
            explorer.appendChild(taskCard);
        }
    }

    function _sidebarCardClick (){
        const clickedProjectPosition = () => {
            if (event.currentTarget.classList[0] === 'sidebarCard'){
                return event.currentTarget.classList[1]
            }}

        updateExplorer(clickedProjectPosition()); 
        }

    function _explorerCardTitleClick (){
        console.log('1')
    }

    function _removeElementsByClass(className){
        const elements = document.getElementsByClassName(className);
        while(elements.length > 0){
            elements[0].parentNode.removeChild(elements[0]);
        }
    }

    function _removeListenersByClass(className,type,listenerFunction){
    const elements = document.getElementsByClassName(className);
    for (const element of elements){
        element.removeEventListener(type,listenerFunction);
    }
    }

    function createElement (type , className){
        const newElement = document.createElement(type);
        newElement.setAttribute('class',className);
        return newElement
    }
    return {addSidebarProject , createElement , updateExplorer}
})()

const modalCreateProject = document.getElementsByClassName('modalCreateProject');
for (const element of modalCreateProject){
    element.addEventListener('click',modal.createProject)
}

const modalCreateTask = document.getElementsByClassName('modalCreateTask');
for (const element of modalCreateTask){
    element.addEventListener('click',modal.createTask)
}

const projectCreateButton = document.getElementById('projectCreateButton');
projectCreateButton.addEventListener('click',project.addProject);

const taskCreateButton = document.getElementById('taskCreateButton');
taskCreateButton.addEventListener('click',project.addTask);

project.retrieveMyProjects();

const clearProjects = document.getElementsByClassName('clearProjects');
for (const element of clearProjects){
    element.addEventListener('click',project.clearProjects)
}
