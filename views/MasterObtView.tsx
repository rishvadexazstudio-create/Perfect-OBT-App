import React from 'react';
import { User } from '../types';
import { GenericTeamView } from '../components/GenericTeamView';
import { getMasterObtMembers, saveMasterObtMember, deleteMasterObtMember } from '../services/storageService';

interface MasterObtViewProps {
  currentUser: User;
}

export const MasterObtView: React.FC<MasterObtViewProps> = ({ currentUser }) => {
  return (
    <GenericTeamView
      title="Master OBT Team"
      colorTheme="orange"
      currentUser={currentUser}
      fetchMembers={getMasterObtMembers}
      onSaveMember={saveMasterObtMember}
      onDeleteMember={deleteMasterObtMember}
    />
  );
};