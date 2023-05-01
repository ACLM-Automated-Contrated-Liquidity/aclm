import styles from "../../styles/Home.module.scss";
import PriceSimulation from "../../components/price-simulation/PriceSimulation";

export default function Home() {
    return (
        <div>
            <main className={styles.main}>
                <PriceSimulation></PriceSimulation>
            </main>
        </div>
    );
}
