import styles from "../../styles/Home.module.scss";
import DashboardComponent from '../../components/dashboard/DashboardComponent';

export default function DashboardPage() {
    return (
        <div>
            <main className={styles.main}>
                <DashboardComponent></DashboardComponent>
            </main>
        </div>
    );
}
