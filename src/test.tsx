// Test file - removed React import
import ReactDOM from 'react-dom/client'

const TestApp = () => {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: 'red', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      color: 'white',
      fontSize: '48px'
    }}>
      REACT IS WORKING!
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<TestApp />);
