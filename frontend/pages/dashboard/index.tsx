import styles from "../../styles/Home.module.scss";
import Dashboard from '../../components/dashboard/Dashboard';

export default function DashboardPage() {
    return (
        <div>
            <main className={styles.main}>
                <Dashboard></Dashboard>
            </main>
        </div>
    );
}
