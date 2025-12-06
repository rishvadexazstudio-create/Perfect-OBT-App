
import React from 'react';
import { User } from '../types';
import { GenericTeamView } from '../components/GenericTeamView';
import { getStateObtMembers, saveStateObtMember, deleteStateObtMember } from '../services/storageService';

interface StateObtViewProps {
  currentUser: User;
}

export const StateObtView: React.FC<StateObtViewProps> = ({ currentUser }) => {
  return (
    <GenericTeamView
      title="State OBT Team"
      colorTheme="purple"
      currentUser={currentUser}
      fetchMembers={getStateObtMembers}
      onSaveMember={saveStateObtMember}
      onDeleteMember={deleteStateObtMember}
    />
  );
};
