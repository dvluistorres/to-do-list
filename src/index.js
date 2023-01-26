import './style.css';
import 'alertifyjs/build/css/alertify.css';
import { compareAsc, format, parseISO } from 'date-fns';
import alertify from 'alertifyjs';
import { footer } from './devFooter';

/* eslint-disable */ 

footer.add();
let editingTask = [];
let editingProject = 0;

const project = (() => {
  const _projectFactory = (name, importance, dueDate) => {
    const position = 0;
    const tasks = [];
    const completedTasks = 0;
    const progress = 0;
    const isCompleted = false;
    return {
      name, importance, dueDate, position, tasks, completedTasks, progress, isCompleted,
    };
  };

  const _taskFactory = (name, dueDate, importance, notes, parentProject) => {
    const position = 0;
    const isCompleted = false;
    return {
      name, dueDate, importance, notes, parentProject, position, isCompleted,
    };
  };

  let myProjects = [];

  const retrieveMyProjects = () => {
    try {
      myProjects = JSON.parse(localStorage.getItem('myProjects'));
      modifyDOM.addSidebarProject(myProjects);
    } catch (error) {
      console.log('No projects in local storage yet');
    }
  };

  function saveToLocal() {
    localStorage.setItem('myProjects', JSON.stringify(myProjects));
  }

  function addProject() {
    const projectName = document.getElementById('projectName').value;
    const myProjectsNames = myProjects.map((project) => project.name.toLowerCase());
    if (myProjectsNames.includes(projectName.toLowerCase())) {
      alertify.alert('Error', 'Project name already in use');
      return;
    }
    const projectImportance = document.querySelector('input[name="ProjectImportance"]:checked').value;
    const dueDate = document.getElementById('dueDate').value;
    if (compareAsc(parseISO(dueDate), new Date()) < 0) {
      alertify.alert('Error', 'Due date already passed');
      return;
    } if (dueDate == '') {
      alertify.alert('Error', 'Please insert due date');
      return;
    }
    const newProject = _projectFactory(projectName, projectImportance, dueDate);
    document.getElementById('projectName').value = '';
    document.getElementById('dueDate').value = '';
    myProjects.push(newProject);
    myProjects.sort((a, b) => ((a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0)));
    let positionCounter = 0;
    for (const project of myProjects) {
      project.position = positionCounter;
      positionCounter++;
    }
    modifyDOM.addSidebarProject(myProjects);
    modal.createProject();
    saveToLocal();
  }

  function editProject() {
    const currentProject = myProjects[editingProject];
    const projectName = document.getElementById('projectName').value;
    const myProjectsNames = myProjects.map((project) => project.name.toLowerCase());
    myProjectsNames.splice(currentProject.position, 1);// Don't check for actual name
    if (myProjectsNames.includes(projectName.toLowerCase())) {
      alertify.alert('Error', 'Project name already in use');
      return;
    }
    const projectImportance = document.querySelector('input[name="ProjectImportance"]:checked').value;
    const dueDate = document.getElementById('dueDate').value;
    if (compareAsc(parseISO(dueDate), new Date()) < 0) {
      alertify.alert('Error', 'Due date already passed');
      return;
    } if (dueDate == '') {
      alertify.alert('Error', 'Please insert due date');
      return;
    }
    let currentTasks = currentProject.tasks;
    currentTasks = currentTasks.map((a) => {
      a.parentProject = projectName;
      return a;
    });
    currentProject.name = projectName;
    currentProject.importance = projectImportance;
    currentProject.dueDate = dueDate;
    myProjects.sort((a, b) => ((a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0)));
    let positionCounter = 0;
    for (const project of myProjects) {
      project.position = positionCounter;
      positionCounter++;
    }
    modifyDOM.addSidebarProject(myProjects);
    modal.createProject();
    modifyDOM.updateExplorer(currentProject.position);
    saveToLocal();
  }

  function deleteProject() {
    alertify.confirm('Are you sure you want to delete this project?', (e) => {
      const projectNumber = event.currentTarget.getAttribute('projectNumber');
      myProjects.splice(projectNumber, 1);
      let positionCounter = 0;
      for (const project of myProjects) {
        project.position = positionCounter;
        positionCounter++;
      }
      modifyDOM.addSidebarProject(myProjects);
      modifyDOM.updateExplorer(0);
      saveToLocal();
    });
  }

  function addTask() {
    const taskName = document.getElementById('taskName').value;
    const parentProject = document.getElementById('parentProject').value;
    const parentProjectIndex = myProjects.map((project) => project.name).indexOf(parentProject);
    const myProjectTasksNames = myProjects[parentProjectIndex].tasks.map((task) => task.name.toLowerCase());
    if (myProjectTasksNames.includes(taskName.toLowerCase())) {
      alertify.alert('Error', 'Task name already in use in this project');
      return;
    }
    const taskDueDate = document.getElementById('taskDueDate').value;
    if (compareAsc(parseISO(taskDueDate), new Date()) < 0) {
      alertify.alert('Error', 'Due date already passed');
      return;
    } if (taskDueDate == '') {
      alertify.alert('Error', 'Please insert due date');
      return;
    }
    const taskImportance = document.querySelector('input[name="taskImportance"]:checked').value;
    const taskNotes = document.getElementById('taskNotes').value;
    const newTask = _taskFactory(taskName, taskDueDate, taskImportance, taskNotes, parentProject);
    document.getElementById('taskName').value = '';
    document.getElementById('taskDueDate').value = '';
    document.getElementById('taskNotes').value = '';
    myProjects[parentProjectIndex].tasks.push(newTask);
    myProjects[parentProjectIndex].tasks.sort((a, b) => compareAsc(parseISO(a.dueDate), parseISO(b.dueDate)));
    let positionCounter = 0;
    for (const task of myProjects[parentProjectIndex].tasks) {
      task.position = positionCounter;
      positionCounter++;
    }
    modal.createTask();
    saveToLocal();
    modifyDOM.addSidebarProject(myProjects);// to update bar progress
    modifyDOM.updateExplorer(myProjects.findIndex((project) => project.name === parentProject));
  }

  function editTask() {
    const currentTask = myProjects[editingTask[0]].tasks[editingTask[1]];
    const taskName = document.getElementById('taskName').value;
    const parentProject = document.getElementById('parentProject').value;
    const parentProjectIndex = myProjects.map((project) => project.name).indexOf(parentProject);
    const myProjectTasksNames = myProjects[parentProjectIndex].tasks.map((task) => task.name.toLowerCase());
    myProjectTasksNames.splice(myProjectTasksNames.indexOf(currentTask.name), 1);// Don't check for actual name
    if (myProjectTasksNames.includes(taskName.toLowerCase())) {
      alertify.alert('Error', 'Task name already in use in this project');
      return;
    }
    const taskDueDate = document.getElementById('taskDueDate').value;
    if (compareAsc(parseISO(taskDueDate), new Date()) < 0) {
      alertify.alert('Error', 'Due date already passed');
      return;
    } if (taskDueDate == '') {
      alertify.alert('Error', 'Please insert due date');
      return;
    }
    currentTask.name = taskName;
    currentTask.dueDate = document.getElementById('taskDueDate').value;
    currentTask.importance = document.querySelector('input[name="taskImportance"]:checked').value;
    currentTask.notes = document.getElementById('taskNotes').value;
    currentTask.parentProject = parentProject;
    myProjects[parentProjectIndex].tasks.sort((a, b) => compareAsc(parseISO(a.dueDate), parseISO(b.dueDate)));
    let positionCounter = 0;
    for (const task of myProjects[parentProjectIndex].tasks) {
      task.position = positionCounter;
      positionCounter++;
    }
    modal.createTask();
    saveToLocal();
    modifyDOM.updateExplorer(myProjects.findIndex((project) => project.name === currentTask.parentProject));
  }

  function deleteTask() {
    const projectNumber = event.currentTarget.getAttribute('projectNumber');
    const taskNumber = event.currentTarget.getAttribute('taskNumber');
    alertify.confirm('Are you sure you want to delete this task?', (e) => {
      myProjects[projectNumber].tasks.splice(taskNumber, 1);
      let positionCounter = 0;
      for (const task of myProjects[projectNumber].tasks) {
        task.position = positionCounter;
        positionCounter++;
      }
      modifyDOM.updateExplorer(projectNumber);
      saveToLocal();
    });
  }

  function clearProjects() {
    if (!confirm('delete sure?')) {
      return;
    }
    myProjects = [];
    localStorage.setItem('myProjects', JSON.stringify(myProjects));
    modifyDOM.addSidebarProject(myProjects);
  }

  function getMyProjects() {
    return myProjects;
  }

  function updateCompletedTasks(position) {
    const completed = myProjects[position].tasks.filter((task) => task.isCompleted).length;
    myProjects[position].completedTasks = completed;
  }

  return {
    retrieveMyProjects, addProject, editProject, deleteProject, addTask, editTask, deleteTask, clearProjects, getMyProjects, updateCompletedTasks, saveToLocal,
  };
})();

const modal = (() => {
  const createProject = () => {
    document.getElementById('projectName').value = '';
    document.getElementById('dueDate').value = '';

    const bodyClassList = document.body.classList;

    if (bodyClassList.contains('projectModal')) {
      bodyClassList.remove('projectModal');
      bodyClassList.add('open');
    } else {
      bodyClassList.remove('open');
      bodyClassList.add('projectModal');
    }
    setTimeout(() => {
      document.getElementById('projectModalTitle').innerText = 'Add Project';
      document.getElementById('projectCreateButton').style.display = 'inline-block';
      document.getElementById('projectEditButton').style.display = 'none';
    }, 500);
  };

  const editProject = () => {
    document.getElementById('projectEditButton').style.display = 'inline-block';
    document.getElementById('projectCreateButton').style.display = 'none';
    document.getElementById('projectModalTitle').innerText = 'Edit Project';

    const bodyClassList = document.body.classList;

    if (bodyClassList.contains('projectModal')) {
      bodyClassList.remove('projectModal');
      bodyClassList.add('open');
    } else {
      bodyClassList.remove('open');
      bodyClassList.add('projectModal');
    }
  };

  const createTask = () => {
    document.getElementById('taskName').value = '';
    document.getElementById('taskDueDate').value = '';
    document.getElementById('taskNotes').value = '';

    const bodyClassList = document.body.classList;

    if (bodyClassList.contains('taskModal')) {
      bodyClassList.remove('taskModal');
      bodyClassList.add('open');
    } else {
      bodyClassList.remove('open');
      bodyClassList.add('taskModal');
    }
    setTimeout(() => {
      document.getElementById('taskModalTitle').innerText = 'Add Task';
      document.getElementById('taskCreateButton').style.display = 'inline-block';
      document.getElementById('taskEditButton').style.display = 'none';
    }, 500);
  };

  const editTask = () => {
    document.getElementById('taskEditButton').style.display = 'inline-block';
    document.getElementById('taskCreateButton').style.display = 'none';
    document.getElementById('taskModalTitle').innerText = 'Edit Task';

    const bodyClassList = document.body.classList;

    if (bodyClassList.contains('taskModal')) {
      bodyClassList.remove('taskModal');
      bodyClassList.add('open');
    } else {
      bodyClassList.remove('open');
      bodyClassList.add('taskModal');
    }
  };

  return {
    createProject, createTask, editTask, editProject,
  };
})();

const modifyDOM = (() => {
  const addSidebarProject = (projects) => {
    _removeListenersByClass('sidebarCard', 'click', _sidebarCardClick);
    _removeElementsByClass('sidebarCard');
    _removeElementsByClass('projectSelectionList');
    for (const project of projects) {
      const addProgress = ({
        setProgress: () => {
          const x = Math.round(project.completedTasks / project.tasks.length * 100);
          project.progress = x;
        },
      });
      Object.assign(project, addProgress);
      const checkCompletion = ({
        checkCompletion: () => {
          if (project.progress === 100) {
            project.isCompleted = true;
          } else {
            project.isCompleted = false;
          }
        },
      });
      Object.assign(project, checkCompletion);
      const sidebarCard = createElement('div', `sidebarCard ${project.position}`);
      const cardTitle = createElement('p', 'cardTitle');
      cardTitle.innerText = project.name;
      const cardProgressBar = createElement('div', 'cardProgressBar');
      const cardProgress = createElement('div', 'cardProgress');
      project.setProgress();
      if (project.progress === 100 || isNaN(project.progress)) {
        cardProgress.setAttribute('style', 'clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%)');
      } else {
        cardProgress.setAttribute('style', 'clip-path: polygon(0 0, 100% 0, 95% 100%, 0% 100%)');
      }
      cardProgress.style.width = `${project.progress}%`;
      sidebarCard.style.borderLeft = `solid 5px ${_importanceColor(project)}`;
      cardProgressBar.append(cardProgress);
      sidebarCard.append(cardTitle, cardProgressBar);
      document.getElementById('projects').appendChild(sidebarCard);
      sidebarCard.addEventListener('click', _sidebarCardClick);
      const opt = document.createElement('option');
      opt.setAttribute('class', 'projectSelectionList');
      opt.value = project.name;
      opt.textContent = project.name;
      document.getElementById('parentProject').appendChild(opt);
    }
  };

  const _importanceColor = (currentProject) => {
    if (currentProject.isCompleted) {
      return 'var(--completedColor)';
    } if (currentProject.importance === 'important') {
      return 'var(--importantColor)';
    } if (currentProject.importance === 'normal') {
      return 'var(--normalColor)';
    }
    return 'var(--nonImportantColor)';
  };

  function updateExplorer(projectPosition) {
    // Create Title
    const explorer = document.getElementById('explorer');
    _removeListenersByClass('explorerCard', 'click', _projectEditButton);
    _removeElementsByClass('explorerCard');
    _removeListenersByClass('taskEditButton', 'click', _taskEditButton);
    _removeElementsByClass('taskCard');
    const currentProject = project.getMyProjects()[projectPosition];
    const explorerTitle = createElement('div', 'explorerCard explorerTittle');
    explorerTitle.setAttribute('projectNumber', `${projectPosition}`);
    const projectEditButton = createElement('button', 'projectEditButton');
    projectEditButton.setAttribute('projectNumber', `${projectPosition}`);
    projectEditButton.innerText = '✏️';
    const projectDeleteButton = createElement('button', 'projectDeleteButton');
    projectDeleteButton.setAttribute('projectNumber', `${projectPosition}`);
    projectDeleteButton.innerText = '🗑️';
    const cardTitle = createElement('p', 'cardTitle');
    cardTitle.innerText = currentProject.name;
    cardTitle.appendChild(projectEditButton);
    cardTitle.appendChild(projectDeleteButton);
    const cardDate = createElement('div', 'cardDate');
    cardDate.innerText = currentProject.dueDate;
    const cardProgressBar = createElement('div', 'cardProgressBar');
    const cardProgress = createElement('div', 'cardProgress');
    currentProject.setProgress();
    cardProgress.style.width = `${currentProject.progress}%`;
    explorerTitle.style.borderBottom = `solid 3px ${_importanceColor(currentProject)}`;
    cardProgressBar.append(cardProgress);
    explorerTitle.append(cardTitle, cardDate, cardProgressBar);
    explorer.appendChild(explorerTitle);
    projectEditButton.addEventListener('click', _projectEditButton);
    projectDeleteButton.addEventListener('click', project.deleteProject);
    // Crate task cards
    let cardPosition = 0;
    for (const task of currentProject.tasks) {
      const taskCard = createElement('div', 'taskCard');
      const cardCheckbox = createElement('input', 'cardCheckbox');
      cardCheckbox.setAttribute('type', 'checkbox');
      cardCheckbox.checked = task.isCompleted;
      const updateCompletion = ({
        updateCompletion: () => {
          task.isCompleted = !task.isCompleted;
        },
      });
      Object.assign(task, updateCompletion);
      cardCheckbox.addEventListener('change', (Event) => {
        task.updateCompletion();
        project.updateCompletedTasks(projectPosition);
        currentProject.setProgress();
        document.getElementsByClassName('cardProgress')[projectPosition].setAttribute('style', `width: ${currentProject.progress}%`);
        cardProgress.style.width = `${currentProject.progress}%`;
        project.saveToLocal();
      });
      const cardTitle = createElement('div', 'taskTitle');
      cardTitle.innerText = task.name;
      const cardDate = createElement('div', 'taskDate');
      cardDate.innerText = format(parseISO(task.dueDate), 'dd/MM/yyyy');
      const taskEditButton = createElement('button', 'taskEditButton');
      taskEditButton.setAttribute('projectNumber', `${projectPosition}`);
      taskEditButton.setAttribute('taskNumber', `${cardPosition}`);
      taskEditButton.innerText = '✏️';
      const taskDeleteButton = createElement('button', 'taskDeleteButton');
      taskDeleteButton.setAttribute('projectNumber', `${projectPosition}`);
      taskDeleteButton.setAttribute('taskNumber', `${cardPosition}`);
      taskDeleteButton.innerText = '🗑️';
      const cardImportance = createElement('div', 'taskImportance');
      cardImportance.style.backgroundColor = _importanceColor(task);
      taskCard.append(cardCheckbox, cardTitle, cardDate, taskEditButton, taskDeleteButton, cardImportance);
      taskEditButton.addEventListener('click', _taskEditButton);
      taskDeleteButton.addEventListener('click', project.deleteTask);
      explorer.appendChild(taskCard);
      cardPosition++;
    }
  }

  function showAllProjects() {
    _removeListenersByClass('explorerCard', 'click', _projectEditButton);
    _removeElementsByClass('explorerCard');
    _removeListenersByClass('taskEditButton', 'click', _taskEditButton);
    _removeElementsByClass('taskCard');
    for (let projectPosition = 0; projectPosition < project.getMyProjects().length; projectPosition++) {
      const explorer = document.getElementById('explorer');
      const currentProject = project.getMyProjects()[projectPosition];
      const explorerTitle = createElement('div', 'explorerCard explorerTittle');
      explorerTitle.setAttribute('projectNumber', `${projectPosition}`);
      const projectEditButton = createElement('button', 'projectEditButton');
      projectEditButton.setAttribute('projectNumber', `${projectPosition}`);
      projectEditButton.innerText = '✏️';
      const projectDeleteButton = createElement('button', 'projectDeleteButton');
      projectDeleteButton.setAttribute('projectNumber', `${projectPosition}`);
      projectDeleteButton.innerText = '🗑️';
      const cardTitle = createElement('p', 'cardTitle');
      cardTitle.innerText = currentProject.name;
      cardTitle.appendChild(projectEditButton);
      cardTitle.appendChild(projectDeleteButton);
      const cardDate = createElement('div', 'cardDate');
      cardDate.innerText = currentProject.dueDate;
      const cardProgressBar = createElement('div', 'cardProgressBar');
      const cardProgress = createElement('div', 'cardProgress');
      currentProject.setProgress();
      cardProgress.style.width = `${currentProject.progress}%`;
      explorerTitle.style.borderBottom = `solid 3px ${_importanceColor(currentProject)}`;
      cardProgressBar.append(cardProgress);
      explorerTitle.append(cardTitle, cardDate, cardProgressBar);
      explorer.appendChild(explorerTitle);
      projectEditButton.addEventListener('click', _projectEditButton);
      projectDeleteButton.addEventListener('click', project.deleteProject);
    }
  }

  function showAllTasks() {
    _removeListenersByClass('explorerCard', 'click', _projectEditButton);
    _removeElementsByClass('explorerCard');
    _removeListenersByClass('taskEditButton', 'click', _taskEditButton);
    _removeElementsByClass('taskCard');
    let allTasks = [];
    for (let projectPosition = 0; projectPosition < project.getMyProjects().length; projectPosition++) {
      allTasks = allTasks.concat(project.getMyProjects()[projectPosition].tasks);
    }
    for (const task of allTasks) {
      const projectPosition = project.getMyProjects().map((project) => project.name.toLowerCase()).indexOf(task.parentProject.toLowerCase());
      const taskCard = createElement('div', 'taskCard');
      const cardCheckbox = createElement('input', 'cardCheckbox');
      cardCheckbox.setAttribute('type', 'checkbox');
      cardCheckbox.checked = task.isCompleted;
      const updateCompletion = ({
        updateCompletion: () => {
          task.isCompleted = !task.isCompleted;
        },
      });
      Object.assign(task, updateCompletion);
      cardCheckbox.addEventListener('change', (Event) => {
        task.updateCompletion();
        project.updateCompletedTasks(projectPosition);
        currentProject.setProgress();
        document.getElementsByClassName('cardProgress')[projectPosition].setAttribute('style', `width: ${currentProject.progress}%`);
        cardProgress.style.width = `${currentProject.progress}%`;
        project.saveToLocal();
      });
      const cardTitle = createElement('div', 'taskTitle');
      cardTitle.innerText = task.name;
      const cardDate = createElement('div', 'taskDate');
      cardDate.innerText = format(parseISO(task.dueDate), 'dd/MM/yyyy');
      const taskEditButton = createElement('button', 'taskEditButton');
      taskEditButton.setAttribute('projectNumber', `${projectPosition}`);
      taskEditButton.setAttribute('taskNumber', `${task.position}`);
      taskEditButton.innerText = '✏️';
      const taskDeleteButton = createElement('button', 'taskDeleteButton');
      taskDeleteButton.setAttribute('projectNumber', `${projectPosition}`);
      taskDeleteButton.setAttribute('taskNumber', `${task.position}`);
      taskDeleteButton.innerText = '🗑️';
      const cardImportance = createElement('div', 'taskImportance');
      cardImportance.style.backgroundColor = _importanceColor(task);
      taskCard.append(cardCheckbox, cardTitle, cardDate, taskEditButton, taskDeleteButton, cardImportance);
      taskEditButton.addEventListener('click', _taskEditButton);
      taskDeleteButton.addEventListener('click', project.deleteTask);
      explorer.appendChild(taskCard);
    }
  }

  function _sidebarCardClick() {
    const clickedProjectPosition = () => {
      if (event.currentTarget.classList[0] === 'sidebarCard') {
        return event.currentTarget.classList[1];
      }
    };
    document.getElementById('parentProject').selectedIndex = clickedProjectPosition();
    updateExplorer(clickedProjectPosition());
  }

  function _projectEditButton() {
    const currentProject = project.getMyProjects()[event.currentTarget.getAttribute('projectNumber')];
    document.getElementById('projectName').value = currentProject.name;
    document.getElementById('dueDate').value = currentProject.dueDate;
    modal.editProject();
    editingProject = event.currentTarget.getAttribute('projectNumber');
  }

  function _taskEditButton() {
    const currentTask = project.getMyProjects()[event.currentTarget.getAttribute('projectNumber')].tasks[event.currentTarget.getAttribute('taskNumber')];
    document.getElementById('taskName').value = currentTask.name;
    document.getElementById('taskDueDate').value = currentTask.dueDate;
    document.getElementById('taskNotes').value = currentTask.notes;
    document.getElementById('parentProject').value = currentTask.parentProject;
    modal.editTask();
    editingTask = [event.currentTarget.getAttribute('projectNumber'), event.currentTarget.getAttribute('taskNumber')];
  }

  function _removeElementsByClass(className) {
    const elements = document.getElementsByClassName(className);
    while (elements.length > 0) {
      elements[0].parentNode.removeChild(elements[0]);
    }
  }

  function _removeListenersByClass(className, type, listenerFunction) {
    const elements = document.getElementsByClassName(className);
    for (const element of elements) {
      element.removeEventListener(type, listenerFunction);
    }
  }

  function createElement(type, className) {
    const newElement = document.createElement(type);
    newElement.setAttribute('class', className);
    return newElement;
  }
  return {
    addSidebarProject, createElement, updateExplorer, showAllProjects, showAllTasks,
  };
})();

const modalCreateProject = document.getElementsByClassName('modalCreateProject');
for (const element of modalCreateProject) {
  element.addEventListener('click', modal.createProject);
}

const modalCreateTask = document.getElementsByClassName('modalCreateTask');
for (const element of modalCreateTask) {
  element.addEventListener('click', modal.createTask);
}

const projectCreateButton = document.getElementById('projectCreateButton');
projectCreateButton.addEventListener('click', project.addProject);

const projectEditButton = document.getElementById('projectEditButton');
projectEditButton.addEventListener('click', project.editProject);

const taskCreateButton = document.getElementById('taskCreateButton');
taskCreateButton.addEventListener('click', project.addTask);

const taskEditButton = document.getElementById('taskEditButton');
taskEditButton.addEventListener('click', project.editTask);

project.retrieveMyProjects();

const clearProjects = document.getElementsByClassName('clearProjects');
for (const element of clearProjects) {
  element.addEventListener('click', project.clearProjects);
}

const showAllProjects = document.getElementById('showAllProjects');
showAllProjects.addEventListener('click', modifyDOM.showAllProjects);

const showAllTasks = document.getElementById('showAllTasks');
showAllTasks.addEventListener('click', modifyDOM.showAllTasks);
