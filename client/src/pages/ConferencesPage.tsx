import React, { useState, useEffect } from 'react';
import ConferenceList from '../components/ConferenceList';
import { ConferenceForm } from '../components/ConferenceForm';
import styles from './ConferencesPage.module.css';
import axios from 'axios';

export const ConferencesPage: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [userJitsiToken, setUserJitsiToken] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserToken = async () => {
            try {
                const response = await axios.get('/api/conferences');
                // Assuming the response data is an object with 'conferences' and 'userJitsiToken' fields
                if (response.data && response.data.userJitsiToken) {
                    setUserJitsiToken(response.data.userJitsiToken);
                } else {
                    console.log('No Jitsi token found for user in the response.');
                }
            } catch (error) {
                console.error('Error fetching user Jitsi token:', error);
            }
        };

        fetchUserToken();
    }, []); // Empty dependency array means this runs once on mount

    const handleInstantConference = () => {
        const roomName = `instant-${Date.now()}`;
        const jitsiUrl = userJitsiToken 
            ? `https://meet.jit.si/${roomName}#jwt=${userJitsiToken}`
            : `https://meet.jit.si/${roomName}`;
        window.open(jitsiUrl, '_blank');
    };

    return (
        <div className={styles.page}>
            <div className={styles.contentArea}>
                <h1 className={styles.contentTitle}>Conferences</h1>

                <div className={styles.actionBlocks}>
                    {/* Instant Conference Block */}
                    <div className={styles.actionBlock} onClick={handleInstantConference}>
                        {/* Вставьте иконку "New Meeting" здесь */}
                        {/* Пример: <i className="fas fa-video"></i> */}
                        <div className={styles.blockIcon}></div> {/* Оставляем для сохранения пропорций, если нужно */}
                        <p className={styles.blockLabel}>New Meeting</p>
                    </div>

                    {/* Create Conference Block */}
                    <div className={styles.actionBlock} onClick={() => setShowForm(!showForm)}>
                         {/* Вставьте иконку "Schedule" здесь */}
                         {/* Пример: <i className="fas fa-calendar-alt"></i> */}
                        <div className={styles.blockIcon}></div> {/* Оставляем для сохранения пропорций, если нужно */}
                        <p className={styles.blockLabel}>Schedule</p>
                    </div>

                    {/* Дополнительные блоки действий можно добавить здесь */}

                </div>

                <div className={styles.infoBlock}>
                     {showForm && (
                            <ConferenceForm
                                onSuccess={() => {
                                    setShowForm(false);
                                    window.location.reload();
                                }}
                            />
                    )}
                    {!showForm && <ConferenceList />}
                </div>
            </div>
        </div>
    );
}; 