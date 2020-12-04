import {
  makeObservable,
  observable,
  computed,
  action,
  runInAction,
} from "mobx";
import { toast } from "react-toastify";
import { history } from "../..";
import agent from "../api/agent";
import { createAttendee, setActivityProps } from "../common/util/utils";
import { HubConnectionBuilder, LogLevel } from "@aspnet/signalr";

export default class ActivityStore {
  rootStore;
  activityRegistry = new Map();
  loadingInitial = false;
  activity = null;
  submitting = false;
  target = "";
  loading = false;
  hubConnection = null;

  constructor(rootStore) {
    this.rootStore = rootStore;

    makeObservable(this, {
      activityRegistry: observable,
      loadingInitial: observable,
      activity: observable,
      submitting: observable,
      target: observable,
      loading: observable,
      hubConnection: observable.ref,

      activitiesByDate: computed,

      createHubConnection: action,
      stopHubConnection: action,
      addComment: action,
      loadActivities: action,
      loadActivity: action,
      createActivity: action,
      editActivity: action,
      deleteActivity: action,
      clearActivity: action,
      attendActivity: action,
      cancelAttendance: action,
    });
  }

  createHubConnection = () => {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl("http://localhost:5000/chat", {
        accessTokenFactory: () => this.rootStore.commonStore.token,
      })
      .configureLogging(LogLevel.Information)
      .build();

    this.hubConnection
      .start()
      .then(() => console.log(this.hubConnection.state))
      .catch((error) => console.log("Error establishing connection: ", error));

    this.hubConnection.onclose(() => {
      console.log('Hub connectin closed');
    });
    
    this.hubConnection.on("ReceiveComment", (comment) => {
      runInAction(() => {
        this.activity.comments.push(comment);
      });
    });
  };

  stopHubConnection = () => {
    this.hubConnection.stop();
  };

  addComment = async (values) => {
    values.activityId = this.activity.id;
    try {
      await this.hubConnection.invoke("SendComment", values);
    } catch (error) {
      console.log(error);
    }
  };

  get activitiesByDate() {
    return this.groupActivitiesByDate(
      Array.from(this.activityRegistry.values())
    );
  }

  groupActivitiesByDate(activities) {
    const sortedActivities = activities.sort((a, b) => a.date - b.date);

    return Object.entries(
      sortedActivities.reduce((activities, activity) => {
        const date = activity.date.toISOString().split("T")[0];
        activities[date] = activities[date]
          ? [...activities[date], activity]
          : [activity];
        return activities;
      }, {})
    );
  }

  loadActivities = async () => {
    this.loadingInitial = true;

    try {
      const activities = await agent.Activities.list();

      runInAction(() => {
        activities.forEach((activity) => {
          setActivityProps(activity, this.rootStore.userStore.user);
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
          setActivityProps(activity, this.rootStore.userStore.user);
          this.activity = activity;
          this.activityRegistry.set(activity.id, activity);
          this.loadingInitial = false;
        });
        return activity;
      } catch (error) {
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
      const attendee = createAttendee(this.rootStore.userStore.user);
      attendee.isHost = true;
      let attendees = [];
      attendees.push(attendee);
      activity.attendees = attendees;
      activity.comments = [];
      activity.isHost = true;
      runInAction(() => {
        this.activityRegistry.set(activity.id, activity);
        this.selectActivity = activity;
        this.submitting = false;
      });
      history.push(`/activities/${activity.id}`);
    } catch (error) {
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
    } catch (error) {
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

  attendActivity = async () => {
    const attendee = createAttendee(this.rootStore.userStore.user);
    this.loading = true;
    try {
      await agent.Activities.attend(this.activity.id);
      runInAction(() => {
        if (this.activity) {
          this.activity.attendees.push(attendee);
          this.activity.isGoing = true;
          this.activityRegistry.set(this.activity.id, this.activity);
          this.loading = false;
        }
      });
    } catch (error) {
      runInAction(() => {
        this.loading = false;
      });

      toast.error("Problem signing up to the activity");
    }
  };

  cancelAttendance = async () => {
    this.loading = true;
    try {
      await agent.Activities.unattend(this.activity.id);
      runInAction(() => {
        if (this.activity) {
          this.activity.attendees = this.activity.attendees.filter(
            (a) => a.username !== this.rootStore.userStore.user.username
          );
          this.activity.isGoing = false;
          this.activityRegistry.set(this.activity.id, this.activity);
          this.loading = false;
        }
      });
    } catch (error) {
      runInAction(() => {
        this.loading = false;
      });

      toast.error("Problem cancelling attendance");
    }
  };
}
