import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { useContext } from "react";
import { Grid } from "semantic-ui-react";
import { LoadingComponent } from "../../app/layout/LoadingComponent";
import { RootStoreContext } from "../../app/stores/rootStore";
import ProfileContent from "./ProfileContent";
import ProfileHeader from "./ProfileHeader";

const ProfilePage = ({ match }) => {
  const rootStore = useContext(RootStoreContext);
  const {
    loadingProfile,
    profile,
    loadProfile,
    follow,
    unfollow,
    isCurrentUser,
    loading,
    setActivefollowingTab
  } = rootStore.profileStore;

  useEffect(() => {
    loadProfile(match.params.username);
  }, [loadProfile, match]);

  if (loadingProfile) {
    return <LoadingComponent content="Loading profile..." />;
  }

  return (
    <Grid>
      <Grid.Column width={16}>
        <ProfileHeader
          profile={profile}
          follow={follow}
          unfollow={unfollow}
          isCurrentUser={isCurrentUser}
          loading={loading}
        />
        <ProfileContent setActiveTab={setActivefollowingTab} />
      </Grid.Column>
    </Grid>
  );
};

export default observer(ProfilePage);
