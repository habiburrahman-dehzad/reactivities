import axios from "axios";
import { toast } from "react-toastify";
import { history } from "../..";

axios.defaults.baseURL = process.env.REACT_APP_API_URL;

axios.interceptors.request.use(
  (config) => {
    var token = window.localStorage.getItem("jwt");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(undefined, (error) => {
  if (error.message === "Network Error" && !error.response) {
    toast.error("Network error - check to make sure API is running!");
  }

  const { status, data, config, headers } = error.response;

  if (status === 404) {
    history.push("/notfound");
  }

  if (
    status === 400 &&
    config.method === "get" &&
    data.errors.hasOwnProperty("id")
  ) {
    history.push("/notfound");
  }

  if (status === 401 && 
    headers['www-authenticate'] &&
    headers['www-authenticate'].startsWith('Bearer error="invalid_token", error_description="The token expired at'))
  {
    window.localStorage.removeItem('jwt');
    history.push('/');
    toast.info('Your session has expired. Please login again');
  }

  if (status === 500) {
    toast.error("Server error - check the terminal for more info!");
  }

  throw error.response;
});

const responseBody = (response) => response.data;

const requests = {
  get: (url) => axios.get(url).then(responseBody),
  post: (url, body) => axios.post(url, body).then(responseBody),
  put: (url, body) => axios.put(url, body).then(responseBody),
  del: (url) => axios.delete(url).then(responseBody),
  postForm: (url, file) => {
    let formData = new FormData();
    formData.append("File", file);
    return axios
      .post(url, formData, {
        headers: { "Content-type": "multipart/form-data" },
      })
      .then(responseBody);
  },
};

const Activities = {
  list: (params) =>
    axios.get('/activities', {params: params}).then(responseBody),
  details: (id) => requests.get(`/activities/${id}`),
  create: (activity) => requests.post("/activities", activity),
  update: (activity) => requests.put(`/activities/${activity.id}`, activity),
  delete: (id) => requests.del(`/activities/${id}`),
  attend: (id) => requests.post(`/activities/${id}/attend`, {}),
  unattend: (id) => requests.del(`/activities/${id}/attend`),
};

const User = {
  current: () => requests.get("/user"),
  login: (user) => requests.post("/user/login", user),
  register: (user) => requests.post("/user/register", user),
};

const Profiles = {
  get: (username) => requests.get(`/profiles/${username}`),
  uploadPhoto: (photo) => requests.postForm(`/photos`, photo),
  setMainPhoto: (id) => requests.post(`/photos/${id}/setMain`, {}),
  deletePhoto: (id) => requests.del(`/photos/${id}`),
  updateProfile: (values) => requests.put(`/profiles`, values),
  follow: (username) => requests.post(`/profiles/${username}/follow`),
  unfollow: (username) => requests.del(`/profiles/${username}/follow`),
  listFollowings: (username, predicate) =>
    requests.get(`/profiles/${username}/follow?predicate=${predicate}`),
  listActivities: (username, predicate) =>
    requests.get(`/profiles/${username}/activities?predicate=${predicate}`)
};

export default {
  Activities,
  User,
  Profiles,
};
