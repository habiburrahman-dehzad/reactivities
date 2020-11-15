import {
  makeObservable,
  observable,
  computed,
  action,
  configure,
  runInAction,
} from "mobx";
import { createContext } from "react";
import { toast } from "react-toastify";
import { history } from "../..";
import agent from "../api/agent";

configure({ enforceActions: "always" });

class ActivityStore {
  activityRegistry = new Map();
  loadingInitial = false;
  activity = null;
  submitting = false;
  target = "";

  constructor() {
    makeObservable(this, {
      activityRegistry: observable,
      loadingInitial: observable,
      activity: observable,
      submitting: observable,
      target: observable,

      activitiesByDate: computed,

      loadActivities: action,
      loadActivity: action,
      createActivity: action,
      editActivity: action,
      deleteActivity: action,
      clearActivity: action,
    });
  }

  get activitiesByDate() {
    return this.groupActivitiesByDate(Array.from(this.activityRegistry.values()));
  }

  groupActivitiesByDate(activities) {
    const sortedActivities = activities.sort(
      (a, b) => a.date - b.date
    );

    return Object.entries(sortedActivities.reduce((activities, activity) => {
      const date = activity.date.toISOString().split('T')[0];
      activities[date] = activities[date] ? [...activities[date], activity] : [activity];
      return activities;
    }, {}));
  }

  loadActivities = async () => {
    this.loadingInitial = true;

    try {
      const activities = await agent.Activities.list();

      runInAction(() => {
        activities.forEach((activity) => {
          activity.date = new Date(activity.date);
          this.activityRegistry.set(activity.id, activity);
          this.loadingInitial = false;
        });
      });
    } 
    catch (error) {
      runInAction(() => {
        this.loadingInitial = false;
      });

      console.log(error);
    }
  };

  loadActivity = async (id) => {
    let activity = this.getActivity(id);
    if (activity) {
      this.activity = activity;
      return activity;
    } else {
      this.loadingInitial = true;

      try {
        activity = await agent.Activities.details(id);

        runInAction(() => {
            activity.date = new Date(activity.date);
            this.activity = activity;
            this.activityRegistry.set(activity.id, activity);
            this.loadingInitial = false;
        });
        return activity;
      } 
      catch (error) {
          runInAction(() => {
              this.loadingInitial = false;
          });

          console.log(error);
      }
    }
  };

  getActivity = (id) => {
    return this.activityRegistry.get(id);
  };

  clearActivity = () => {
    this.activity = null;
  };

  createActivity = async (activity) => {
    this.submitting = true;
    try {
      await agent.Activities.create(activity);

      runInAction(() => {
        this.activityRegistry.set(activity.id, activity);
        this.selectActivity = activity;
        this.submitting = false;
      });
      history.push(`/activities/${activity.id}`);
    } 
    catch (error) {
      runInAction(() => {
        this.submitting = false;
      });
      toast.error(error.response.data.title);
      console.log(error.response);
    }
  };

  editActivity = async (activity) => {
    this.submitting = true;
    try {
      await agent.Activities.update(activity);

      runInAction(() => {
        this.activityRegistry.set(activity.id, activity);
        this.activity = activity;
        this.submitting = false;
      });
      history.push(`/activities/${activity.id}`);
    } 
    catch (error) {
      runInAction(() => {
        this.submitting = false;
      });
      toast.error(error.response.data.title);
      console.log(error.response);
    }
  };

  deleteActivity = async (event, id) => {
    this.submitting = true;
    this.target = event.target.name;

    try {
      await agent.Activities.delete(id);

      runInAction(() => {
        this.activityRegistry.delete(id);
        this.submitting = false;
        this.target = "";
      });
    } catch (error) {
      console.log(error);

      runInAction(() => {
        this.submitting = false;
        this.target = "";
      });
    }
  };
}

export default createContext(new ActivityStore());
