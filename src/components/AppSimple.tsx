// AppSimple.tsx - Simplified version without React import

export const App = () => {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px'
    }}>
      <div style={{
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1>LAS POS Loading...</h1>
        <p>If you see this, React is working!</p>
      </div>
    </div>
  );
};
