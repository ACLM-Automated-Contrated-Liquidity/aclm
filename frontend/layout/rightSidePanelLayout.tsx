import Navbar from "../components/navigation/navbar";
import styles from "../styles/RightSidePanelLayout.module.scss";

export default function RightSidePanelLayout({ children }) {

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <Navbar />
            </div>

            <div className={styles.pageContent}>
                {children}
            </div>
        </div>
    );
}
