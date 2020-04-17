import React from 'react'
import { Segment, Form, Button } from 'semantic-ui-react'
import { useState } from 'react';
import {v4 as uuid} from 'uuid';

export const ActivityForm = ({
    setEditMode,
    activity: initialActivity,
    createActivity,
    editActivity
}) => {
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
                <Button floated='right' positive type='submit' content='Submit' />
                <Button onClick={() => setEditMode(false)} floated='right' type='button' content='Cancel' />
            </Form>
        </Segment>
    )
}
