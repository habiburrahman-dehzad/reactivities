import React from 'react'
import { Segment, Form, Button } from 'semantic-ui-react'
import { useState } from 'react';
import {v4 as uuid} from 'uuid';
import ActivityStore from '../../../app/stores/activityStore';
import { useContext } from 'react';
import { observer } from 'mobx-react-lite';

const ActivityForm = ({
    activity: initialActivity,
}) => {
    const activityStore = useContext(ActivityStore);
    const { createActivity, editActivity, submitting, cancelFormOpen } = activityStore;

    const initializeForm = () => {
        if (initialActivity) {
            return initialActivity;
        }
        else {
            return {
                id: '',
                title: '',
                description: '',
                category: '',
                date: '',
                city: '',
                venue: ''
            };
        }
    }

    const [activity, setActivity] = useState(initializeForm);

    const handleChangeEvent = (event) => {
        const { name, value } = event.target;
        setActivity({ ...activity, [name]: value });
    }

    const handleSubmit = () => {
        if (activity.id.length === 0){
            let newActivity = {
                ...activity,
                id: uuid()
            };

            createActivity(newActivity);
        }
        else {
            editActivity(activity);
        }
    }

    return (
        <Segment clearing>
            <Form onSubmit={handleSubmit}>
                <Form.Input onChange={handleChangeEvent} name='title' placeholder='title' value={activity.title} />
                <Form.TextArea onChange={handleChangeEvent} name='description' rows={2} placeholder='description' value={activity.description} />
                <Form.Input onChange={handleChangeEvent} name='category' placeholder='category' value={activity.category} />
                <Form.Input onChange={handleChangeEvent} name='date' type='datetime-local' placeholder='date' value={activity.date} />
                <Form.Input onChange={handleChangeEvent} name='city' placeholder='city' value={activity.city} />
                <Form.Input onChange={handleChangeEvent} name='venue' placeholder='venue' value={activity.venue} />
                <Button loading={submitting} floated='right' positive type='submit' content='Submit' />
                <Button onClick={cancelFormOpen} floated='right' type='button' content='Cancel' />
            </Form>
        </Segment>
    )
}

export default observer(ActivityForm);