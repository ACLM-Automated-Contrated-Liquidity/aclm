import styles from "../styles/Home.module.scss";
import AppComponent from '../components/app/AppComponent';

export default function Home() {
  return (
    <div>
      <main className={styles.main}>
        <AppComponent></AppComponent>
      </main>
    </div>
  );
}
