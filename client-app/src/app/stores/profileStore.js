import { action, computed, makeObservable, observable, runInAction } from "mobx";
import { toast } from "react-toastify";
import agent from "../api/agent";

export default class ProfileStore {
    rootStore;
    profile = null;
    loadingProfile = true;
    uploadingPhoto = false;
    loading = false;
    profileUpdating = false;

    constructor(rootStore) {
        this.rootStore = rootStore;

        makeObservable(this, {
            profile: observable,
            loadingProfile: observable,
            uploadingPhoto: observable,
            loading: observable,
            profileUpdating: observable,

            isCurrentUser: computed,

            loadProfile: action,
            uploadPhoto: action,
            setMainPhoto: action,
            deletePhoto: action,
            updateProfile: action
        });
    }

    get isCurrentUser() {
        if (this.rootStore.userStore.user && this.profile) {
            return this.rootStore.userStore.user.username === this.profile.username;
        }

        return false;
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
}