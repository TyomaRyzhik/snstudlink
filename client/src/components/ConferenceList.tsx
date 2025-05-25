import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './ConferenceList.module.css';

interface Conference {
    id: string;
    title: string;
    room_name: string;
    scheduled_at: string;
    host: {
        id: string;
        name: string;
    };
}

export const ConferenceList: React.FC = () => {
    const [conferences, setConferences] = useState<Conference[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchConferences = async () => {
            try {
                const response = await axios.get('/api/conferences');
                setConferences(response.data);
            } catch (error) {
                console.error('Error fetching conferences:', error);
            }
        };

        fetchConferences();
    }, []);

    const handleJoin = async (conferenceId: string, roomName: string) => {
        try {
            // Fetch conference details again to get the JWT
            const response = await axios.get(`/api/conferences/${conferenceId}`);
            const { conference, jitsiToken } = response.data;

            if (jitsiToken) {
                window.open(`https://meet.jit.si/${conference.room_name}#jwt=${jitsiToken}`, '_blank');
            } else {
                // Fallback if no JWT is available (e.g., not logged in, or Jitsi not configured)
                window.open(`https://meet.jit.si/${conference.room_name}`, '_blank');
            }

        } catch (error) {
            console.error('Error joining conference:', error);
            alert('Failed to join conference. Please try again.');
        }
    };

    return (
        <div className={styles.conferenceList}>
            <h2>Upcoming Conferences</h2>
            <div className={styles.conferenceGrid}>
                {conferences.map((conference) => (
                    <div key={conference.id} className={styles.conferenceCard}>
                        <h3>{conference.title}</h3>
                        <p>Host: {conference.host.name}</p>
                        <p>Scheduled: {new Date(conference.scheduled_at).toLocaleString()}</p>
                        <button
                            className={styles.joinButton}
                            onClick={() => handleJoin(conference.id, conference.room_name)}
                        >
                            Join Conference
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}; 