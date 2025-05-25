import React, { useState } from 'react';
import axios from 'axios';
import styles from './ConferenceForm.module.css';

interface ConferenceFormProps {
    onSuccess?: () => void;
}

export const ConferenceForm: React.FC<ConferenceFormProps> = ({ onSuccess }) => {
    const [title, setTitle] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await axios.post('/api/conferences', {
                title,
                scheduled_at: new Date(scheduledAt).toISOString()
            });

            setTitle('');
            setScheduledAt('');
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error creating conference:', error);
            setError('Failed to create conference. Please try again.');
        }
    };

    return (
        <div className={styles.formContainer}>
            <h2>Create New Conference</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="scheduledAt">Scheduled Date and Time</label>
                    <input
                        type="datetime-local"
                        id="scheduledAt"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        required
                        className={styles.input}
                    />
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <button type="submit" className={styles.submitButton}>
                    Create Conference
                </button>
            </form>
        </div>
    );
}; 