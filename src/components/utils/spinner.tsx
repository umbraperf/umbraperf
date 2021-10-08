import React from 'react';
import styles from '../../style/spinner.module.css';

function Spinner() {

    return <div className={styles.spinnerContainer}>
        <div className={styles.cssloadPiano}>
            <div className={styles.cssloadRect1}></div>
            <div className={styles.cssloadRect2}></div>
            <div className={styles.cssloadRect3}></div>
        </div>
    </div>

}

export default Spinner;