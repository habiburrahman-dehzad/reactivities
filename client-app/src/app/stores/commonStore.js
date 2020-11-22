import { action, makeObservable, observable, reaction } from "mobx";

export default class CommonStore {
    rootStore;
    token = window.localStorage.getItem('jwt');
    appLoaded = false;

    constructor(rootStore) {
        this.rootStore = rootStore;

        makeObservable(this, {
            token: observable,
            appLoaded: observable,

            setToken: action,
            setAppLoaded: action
        });

        reaction(
            () => this.token,
            token => {
                if (token) {
                    window.localStorage.setItem('jwt', token);
                } else {
                    window.localStorage.removeItem('jwt');
                }
            }
        )
    }

    setToken = (token) => {
        window.localStorage.setItem('jwt', token);
        this.token = token;
    }

    setAppLoaded = () => {
        this.appLoaded = true;
    }
}