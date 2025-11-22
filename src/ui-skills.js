import { SKILLS } from './skills.js';

export function renderSkillsList(uiManager) {
    const { skillsList } = uiManager;
    if (!skillsList) return;

    skillsList.innerHTML = '';
    Object.values(SKILLS).forEach(skill => {
        const div = document.createElement('div');
        div.className = 'skill-item';
        div.innerHTML = `
                <img src="${skill.icon}" alt="${skill.name}">
                <span>${skill.name}</span>
            `;
        div.onclick = () => showSkillDetails(uiManager, skill);
        skillsList.appendChild(div);
    });
}

export function showSkillDetails(uiManager, skill) {
    const { skillDetails, state, computeEnergyCount } = uiManager;
    if (!skillDetails) return;

    skillDetails.style.display = 'block';
    document.getElementById('detail-icon').src = skill.icon;
    document.getElementById('detail-name').innerText = skill.name;
    document.getElementById('detail-desc').innerText = skill.description;

    const grid = document.getElementById('task-grid');
    grid.innerHTML = '';

    skill.tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card';

        const hasEnergy = state && computeEnergyCount(state) > 0;
        const isBusy = state && state.activeTask;
        const isThisActive = isBusy && state.activeTask.taskId === task.id;

        card.innerHTML = `
                <h4>${task.name}</h4>
                <p>Time: ${task.duration / 1000}s</p>
                <p>XP: ${task.xp}</p>
            `;

        const btn = document.createElement('button');
        // Label logic: active task shows "In Progress", others show "Start"
        btn.innerText = isThisActive ? 'In Progress' : 'Start';

        // Only disable when there is no energy at all; otherwise allow switching tasks
        if (!hasEnergy && !isThisActive) {
            btn.disabled = true;
            btn.innerText = 'No Energy';
        }

        btn.onclick = () => {
            // Do nothing if this task is already active
            if (isThisActive) return;

            // If another task is currently running, stop it first
            if (isBusy && state.activeTask.taskId !== task.id) {
                uiManager.network.stopTask();
            }

            // Start the requested task (host will validate energy)
            uiManager.network.startTask(task.id, task.duration);
        };

        card.appendChild(btn);
        grid.appendChild(card);
    });
}

export function findSkillByTaskId(taskId) {
    return Object.values(SKILLS).find(s => s.tasks.some(t => t.id === taskId));
}

export function findSkillByName(name) {
    return Object.values(SKILLS).find(s => s.name === name);
}

