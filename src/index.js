import './style.css';
import {footer} from './devFooter'

footer.add();

const project = (()=>{
    const createProject = (name , importance , dueDate) => {
        return{name , importance , dueDate}
    }
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
      document.getElementById("createProject").innerHTML ='<fieldset id="projectData" class="projectData"><p>Add project</p><div><label for="name">Name:</label><input type="text" id="name" placeholder="Your project name here" name="name" required></div>          <div>              <label for="dueDate">Due date?:</label>              <input type="date" value="dueDate" id="dueDate" name="dueDate" required>          </div>          <div>              <label id="ProjectImportance" for="ProjectImportance">Project importance?:</label>              <div class="radioWrapper" style="display:flex;gap:12px">                  <div>                      <input type="radio" id="important" name="ProjectImportance" value="important">                      <label for="important">important</label>                  </div>                                    <div>                      <input type="radio" id="normal" name="ProjectImportance" value="normal" checked>                      <label for="normal">normal</label>                  </div>                                    <div>                      <input type="radio" id="nonImportant" name="ProjectImportance" value="nonImportant">                      <label for="nonImportant">Non important</label>                  </div>              </div>          </div>                    <button class="projectCreate modalButton"><b>Add Project</b></button>          <button class="modalCreateProject modalButton" >Cancel</button>   </fieldset>'
    return {createProject}
})()

const modalCreateProject = document.getElementsByClassName('modalCreateProject');
for (const element of modalCreateProject){
    element.addEventListener('click',modal.createProject)
}