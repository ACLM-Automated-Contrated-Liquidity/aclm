import Navbar from "../components/navigation/navbar";
import styles from "../styles/CenteredLayout.module.scss";

export default function CenteredLayout({ children }) {

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
