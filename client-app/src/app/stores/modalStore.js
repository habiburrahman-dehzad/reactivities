import { action, makeObservable, observable } from "mobx";

export default class ModalStore {
    rootStore;
    modal = {open: false, body: null};

    constructor(rootStore) {
        this.rootStore = rootStore;

        makeObservable(this, {
            modal: observable.shallow,

            openModal: action,
            closeModal: action
        });
    }

    openModal = (content) => {
        this.modal.open = true;
        this.modal.body = content;
    }

    closeModal = () => {
        this.modal.open = false;
        this.modal.body = null;
    }
}