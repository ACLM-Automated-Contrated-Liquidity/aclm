export default function PanelComponent({ children, className }) {
    const panelStyle = {
        background: 'white',
        padding: '16px',
        borderRadius: '16px',
        boxShadow: '0px 16px 32px rgba(0, 0, 0, 0.02)',
    };

    return (
        <div className={className} style={panelStyle}>{children}</div>
    );
}
