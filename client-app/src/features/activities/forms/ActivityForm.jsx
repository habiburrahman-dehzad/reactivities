import React from "react";
import { Segment, Form, Button } from "semantic-ui-react";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import ActivityStore from "../../../app/stores/activityStore";
import { useContext } from "react";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

const ActivityForm = ({ match, history }) => {
  const activityStore = useContext(ActivityStore);
  const {
    createActivity,
    editActivity,
    submitting,
    loadActivity,
    activity: initialActivity,
    clearActivity,
  } = activityStore;

  const [activity, setActivity] = useState({
    id: "",
    title: "",
    description: "",
    category: "",
    date: "",
    city: "",
    venue: "",
  });

  useEffect(() => {
    if (match.params.id && activity.id.length === 0) {
      loadActivity(match.params.id).then(
        () => initialActivity && setActivity(initialActivity)
      );
    }

    return () => {
      clearActivity();
    };
  }, [loadActivity, clearActivity, match.params.id, initialActivity, activity.id.length]);

  const handleChangeEvent = (event) => {
    const { name, value } = event.target;
    setActivity({ ...activity, [name]: value });
  };

  const handleSubmit = () => {
    if (activity.id.length === 0) {
      let newActivity = {
        ...activity,
        id: uuid(),
      };

      createActivity(newActivity).then(() => history.push(`/activities/${activity.id}`));
    } else {
      editActivity(activity).then(() => history.push(`/activities/${activity.id}`));
    }
  };

  return (
    <Segment clearing>
      <Form onSubmit={handleSubmit}>
        <Form.Input
          onChange={handleChangeEvent}
          name="title"
          placeholder="title"
          value={activity.title}
        />
        <Form.TextArea
          onChange={handleChangeEvent}
          name="description"
          rows={2}
          placeholder="description"
          value={activity.description}
        />
        <Form.Input
          onChange={handleChangeEvent}
          name="category"
          placeholder="category"
          value={activity.category}
        />
        <Form.Input
          onChange={handleChangeEvent}
          name="date"
          type="datetime-local"
          placeholder="date"
          value={activity.date}
        />
        <Form.Input
          onChange={handleChangeEvent}
          name="city"
          placeholder="city"
          value={activity.city}
        />
        <Form.Input
          onChange={handleChangeEvent}
          name="venue"
          placeholder="venue"
          value={activity.venue}
        />
        <Button
          loading={submitting}
          floated="right"
          positive
          type="submit"
          content="Submit"
        />
        <Button
          onClick={() => history.push('/activities')}
          floated="right"
          type="button"
          content="Cancel"
        />
      </Form>
    </Segment>
  );
};

export default observer(ActivityForm);
