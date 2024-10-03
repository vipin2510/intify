import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface NaxalProfile {
  id: string;
  name: string;
  description: string;
  rank: string;
  level: string;
  central: string;
  zonal: string;
  subZonal: string;
  division: string;
  areaCommittee: string;
  company: string;
  platoon: string;
  rpc: string;
  weapon: string;
  electronicGadget: string;
  status: string;
  otherInfo: string;
  resident: string;
  district: string;
  workArea: string;
}

export const NaxalProfile: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const [profile, setProfile] = useState<NaxalProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('https://intify-server.vercel.app/api/spreadsheet?name=Naxal+Profile');
        const profiles = response.data;
        console.log('Received profiles:', profiles);

        if (!Array.isArray(profiles)) {
          throw new Error('Received data is not an array');
        }

        const matchingProfile = profiles.find((p: NaxalProfile) => p && p.id === uid);
        console.log('Matching profile:', matchingProfile);
        
        if (matchingProfile) {
          setProfile(matchingProfile);
        } else {
          setError('Profile not found');
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(err instanceof Error ? err.message : 'Error fetching profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [uid]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>No profile found</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{profile.name}</h1>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(profile).map(([key, value]) => (
          <div key={key} className="mb-2">
            <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</strong> {value}
          </div>
        ))}
      </div>
    </div>
  );
};