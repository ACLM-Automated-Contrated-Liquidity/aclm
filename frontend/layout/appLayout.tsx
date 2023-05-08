import Navbar from "../components/navigation/navbar";

export default function AppLayout({ children }) {
    return (
        <div>
            <Navbar />
            {children}
        </div>
    );
}
