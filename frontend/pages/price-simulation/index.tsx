import styles from "../../styles/Home.module.scss";
import PriceSimulation from "../../components/price-simulation/PriceSimulation";

export default function PriceSimulationPage() {
    return (
        <div>
            <main className={styles.main}>
                <DashboardComponent></DashboardComponent>
            </main>
        </div>
    );
}
