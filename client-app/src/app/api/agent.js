import axios from 'axios';
import { toast } from 'react-toastify';
import { history } from '../..';

axios.defaults.baseURL = 'http://localhost:5000/api';

axios.interceptors.response.use(undefined, error => {
    if (error.message === 'Network Error' && !error.response) {
        toast.error('Network error - check to make sure API is running!');
    }

    const {status, data, config} = error.response;

    if(status === 404) {
        history.push('/notfound');
    }
    if (status === 400 && config.method === 'get' && data.errors.hasOwnProperty('id'))
    {
        history.push('/notfound');
    }
    if (status === 500) {
        toast.error('Server error - check the terminal for more info!');
    }
});

const responseBody = (response) => response.data;

const sleep = (ms) => (response) => new Promise(resolve => setTimeout(() => resolve(response), ms));

const requests = {
    get: (url) => axios.get(url).then(sleep(1000)).then(responseBody),
    post: (url, body) => axios.post(url, body).then(responseBody),
    put: (url, body) => axios.put(url, body).then(responseBody),
    del: (url) => axios.delete(url).then(responseBody)
}

const Activities = {
    list: () => requests.get('/activities'),
    details: (id) => requests.get(`/activities/${id}`),
    create: (activity) => requests.post('/activities', activity),
    update: (activity) => requests.put(`/activities/${activity.id}`, activity),
    delete: (id) => requests.del(`/activities/${id}`)
}

export default {
    Activities
}