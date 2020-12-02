import { observer } from "mobx-react-lite";
import React, { useContext, useState } from "react";
import { Button, Grid, Header, Tab } from "semantic-ui-react";
import { RootStoreContext } from "../../app/stores/rootStore";
import ProfileEditForm from "./ProfileEditForm";

const ProfileDescription = () => {
  const rootStore = useContext(RootStoreContext);
  const {
    profile,
    isCurrentUser,
  } = rootStore.profileStore;

  const [editProfileMode, setEditProfileMode] = useState(false);

  return (
    <Tab.Pane>
      <Grid>
        <Grid.Column width={16} style={{ paddingBottom: 0 }}>
          <Header floated="left" icon="user" content={`About ${profile.displayName}`} />
          {isCurrentUser && (
            <Button
              floated="right"
              basic
              content={editProfileMode ? "Cancel" : "Edit Profile"}
              onClick={() => setEditProfileMode(!editProfileMode)}
            />
          )}
        </Grid.Column>
        <Grid.Column width={16}>
            {editProfileMode ? (
                <ProfileEditForm setEditProfileMode={setEditProfileMode}/>
            ) : (
                <p>{profile.bio}</p>
            )}
        </Grid.Column>
      </Grid>
    </Tab.Pane>
  );
};

export default observer(ProfileDescription);
