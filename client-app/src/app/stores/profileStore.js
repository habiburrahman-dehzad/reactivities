import { action, computed, makeObservable, observable, reaction, runInAction } from "mobx";
import { toast } from "react-toastify";
import agent from "../api/agent";

export default class ProfileStore {
    rootStore;
    profile = null;
    loadingProfile = true;
    uploadingPhoto = false;
    loading = false;
    profileUpdating = false;
    followings = [];
    activeFollowingTab = 0;

    constructor(rootStore) {
        this.rootStore = rootStore;

        makeObservable(this, {
            profile: observable,
            loadingProfile: observable,
            uploadingPhoto: observable,
            loading: observable,
            profileUpdating: observable,
            followings: observable,
            activeFollowingTab: observable,

            isCurrentUser: computed,

            setActivefollowingTab: action,
            loadProfile: action,
            uploadPhoto: action,
            setMainPhoto: action,
            deletePhoto: action,
            updateProfile: action,
            follow: action,
            unfollow: action,
            loadFollowings: action
        });

        reaction(
            () => this.activeFollowingTab,
            activeFollowingTab => {
                if (activeFollowingTab === 3 || activeFollowingTab === 4)
                {
                    const predicate = activeFollowingTab === 3 ? 'followers' : 'following';
                    this.loadFollowings(predicate);
                }
                else
                {
                    this.followings = [];
                }
            }
        );
    }

    get isCurrentUser() {
        if (this.rootStore.userStore.user && this.profile) {
            return this.rootStore.userStore.user.username === this.profile.username;
        }

        return false;
    }

    setActivefollowingTab = (activeIndex) => {
        this.activeFollowingTab = activeIndex;
    }

    loadProfile = async (username) => {
        this.loadingProfile = true;

        try {
            const profile = await agent.Profiles.get(username);
            
            runInAction(() => {
                this.profile = profile;
                this.loadingProfile = false;
            });
        } 
        catch (error) {
            runInAction(() => {
                this.loadingProfile = false;
            })

            console.log(error);
        }
    }

    uploadPhoto = async (file) => {
        this.uploadingPhoto = true;

        try {
            const photo = await agent.Profiles.uploadPhoto(file);

            runInAction(() => {
                if (this.profile) {
                    this.profile.photos.push(photo);
                    if (photo.isMain && this.rootStore.userStore.user) {
                        this.rootStore.userStore.user.image = photo.url;
                        this.profile.image = photo.url;
                    }

                    this.uploadingPhoto = false;
                }
            });
        }
        catch (error) {
            runInAction(() => {
                this.uploadingPhoto = false;
            });

            console.log(error);
            toast.error('Problem uploading photo');
        }
    }

    setMainPhoto = async (photo) => {
        this.loading = true;

        try {
            await agent.Profiles.setMainPhoto(photo.id);
            runInAction(() => {
                this.rootStore.userStore.user.image = photo.url;
                this.profile.photos.find(a => a.isMain).isMain = false;
                this.profile.photos.find(a => a.id === photo.id).isMain = true;
                this.profile.image = photo.url;
                this.loading = false;
            })
        } 
        catch (error) {
            runInAction(() => {
                this.loading = false;
            })

            toast.error('Problem setting photo as main');
            console.log(error);
        }
    }

    deletePhoto = async (photo) => {
        this.loading = true;

        try {
            await agent.Profiles.deletePhoto(photo.id);
            runInAction(() => {
                this.profile.photos = this.profile.photos.filter(a => a.id !== photo.id);
                this.loading = false;
            })
        } 
        catch (error) {
            runInAction(() => {
                this.loading = false;
            })

            toast.error('Problem deleting the photo');
            console.log(error);
        }
    }

    updateProfile = async (values) => {
        this.profileUpdating = true;

        try {
            await agent.Profiles.updateProfile(values);
            
            runInAction(() => {
                this.profile = {...this.profile, ...values};
                this.rootStore.userStore.user = {...this.rootStore.userStore.user, ...values};
                this.profileUpdating = false;
            });
        } 
        catch (error) {
            runInAction(() => {
                this.profileUpdating = false;
            });

            console.log(error);
            toast.error('Problem updating user profile');
        }
    }

    follow = async (username) => {
        this.loading = true;

        try {
            await agent.Profiles.follow(username);
            runInAction(() => {
                this.profile.following = true;
                this.profile.followersCount++;
                this.loading = false;
            });
        }
        catch (error) {
            toast.error('Problem following the user');
            runInAction(() => {
                this.loading = false;
            });
        }
    }

    unfollow = async (username) => {
        this.loading = true;

        try {
            await agent.Profiles.unfollow(username);
            runInAction(() => {
                this.profile.following = false;
                this.profile.followersCount--;
                this.loading = false;
            });
        }
        catch (error) {
            toast.error('Problem unfollowing the user');
            runInAction(() => {
                this.loading = false;
            });
        }
    }

    loadFollowings = async (predicate) => {
        this.loading = true;

        try {
            const profiles = await agent.Profiles.listFollowings(this.profile.username, predicate);
            runInAction(() => {
                this.followings = profiles;
                this.loading = false;
            });
        }
        catch (error) {
            toast.error('Problem loading followings');
            runInAction(() => {
                this.loading = false;
            });
        }
    }
}