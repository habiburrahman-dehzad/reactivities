import { makeObservable, observable, computed, action, configure, runInAction } from 'mobx';
import { createContext } from 'react';
import agent from '../api/agent';

configure({ enforceActions: 'always' });

class ActivityStore {
    activityRegistry = new Map();
    activities = [];
    loadingInitial = false;
    selectedActivity = null;
    editMode = false;
    submitting = false;
    target = '';

    constructor() {
        makeObservable(this, {
            activityRegistry: observable,
            activities: observable,
            loadingInitial: observable,
            selectedActivity: observable,
            editMode: observable,
            submitting: observable,
            target: observable,

            activitiesByDate: computed,
            
            loadActivities: action,
            createActivity: action,
            editActivity: action,
            deleteActivity: action,
            openCreateForm: action,
            openEditForm: action,
            selectActivity: action,
            cancelSelectActivity: action,
            cancelFormOpen: action
        })
    }

    get activitiesByDate() {
        return Array.from(this.activityRegistry.values())
                    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    }

    loadActivities = async () => {
        this.loadingInitial = true;
        
        try {
            const activities = await agent.Activities.list();

            runInAction(() => {
                activities.forEach(activity => {
                    activity.date = activity.date.split('.')[0];
                    this.activityRegistry.set(activity.id, activity);
                    this.loadingInitial = false;
                });
            });

        } catch (error) {
            runInAction(() => {
                this.loadingInitial = false;
            });

            console.log(error);
        }
    }

    createActivity = async (activity) => {
        this.submitting = true;
        try {
            await agent.Activities.create(activity);

            runInAction(() => {
                this.activityRegistry.set(activity.id, activity);
                this.selectActivity = activity;
                this.editMode = false;
                this.submitting = false;
            })
        }
        catch (error) {
            runInAction(() => {
                this.submitting = false;
            })
            console.log(error);
        }
    }

    editActivity = async (activity) => {
        this.submitting = true;
        try {
            await agent.Activities.update(activity);

            runInAction(() => {
                this.activityRegistry.set(activity.id, activity);
                this.selectedActivity = activity;
                this.editMode = false;
                this.submitting = false;
            })
        }
        catch (error) {
            runInAction(() => {
                this.submitting = false;
            })
            console.log(error);
        }
    }

    deleteActivity = async (event, id) => {
        this.submitting = true;
        this.target = event.target.name;

        try {
            await agent.Activities.delete(id);

            runInAction(() => {
                this.activityRegistry.delete(id);
                this.submitting = false;
                this.target = '';
            })
        }
        catch (error) {
            console.log(error);
            
            runInAction(() => {
                this.submitting = false;
                this.target = '';
            })
        }
    }

    openCreateForm = () => {
        this.editMode = true;
        this.selectedActivity = null;
    }

    openEditForm = (id) => {
        this.selectedActivity = this.activityRegistry.get(id);
        this.editMode = true;
    }

    selectActivity = (id) => {
        this.selectedActivity = this.activityRegistry.get(id);
        this.editMode = false;
    }

    cancelSelectActivity = () => {
        this.selectedActivity = null;
    }

    cancelFormOpen = () => {
        this.editMode = false;
    }
}

export default createContext(new ActivityStore());