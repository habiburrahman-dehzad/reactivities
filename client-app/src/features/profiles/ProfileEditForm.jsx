import React from "react";
import { Button, Form, Grid } from "semantic-ui-react";
import { Form as FinalForm, Field } from "react-final-form";
import { useContext } from "react";
import { RootStoreContext } from "../../app/stores/rootStore";
import TextInput from "../../app/common/form/TextInput";
import TextAreaInput from "../../app/common/form/TextAreaInput";
import { combineValidators, composeValidators, hasLengthGreaterThan, isRequired } from "revalidate";
import { observer } from "mobx-react-lite";

const validator = combineValidators({
    displayName: isRequired({message: 'Display Name is required'}),
    bio: composeValidators(
      isRequired('Bio'),
      hasLengthGreaterThan(3)({message: 'Bio must be at least 4 characters'})
    )()
  });

const ProfileEditForm = ({setEditProfileMode}) => {
  const rootStore = useContext(RootStoreContext);
  const { profile, profileUpdating, updateProfile } = rootStore.profileStore;

  const userProfile = {
    displayName: profile.displayName,
    bio: profile.bio,
  };

  const handleProfileEditSubmit = (values) => {
    updateProfile(values).then(() => setEditProfileMode(false));
  };

  return (
    <Grid>
      <Grid.Column width={16}>
        <FinalForm
          initialValues={userProfile}
          validate={validator}
          onSubmit={handleProfileEditSubmit}
          render={({ handleSubmit, invalid, pristine }) => (
            <Form onSubmit={handleSubmit}>
              <Field
                name="displayName"
                placeholder="Display Name"
                value={userProfile.displayName}
                component={TextInput}
              />
              <Field
                component={TextAreaInput}
                name="bio"
                rows={3}
                placeholder="Bio"
                value={userProfile.bio}
              />
              <Button
                loading={profileUpdating}
                disabled={profileUpdating || invalid || pristine}
                floated="right"
                positive
                type="submit"
                content="Update Profile"
              />
            </Form>
          )}
        />
      </Grid.Column>
    </Grid>
  );
};

export default observer(ProfileEditForm);
