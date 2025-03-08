import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
    const [url, setUrl] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const checkSecurity = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/check-security', { url });
            setResult(response.data);
        } catch (error) {
            alert('Lỗi khi kiểm tra bảo mật');
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <h2>Kiểm tra bảo mật Website</h2>
            <input 
                type='text' 
                placeholder='Nhập URL...' 
                value={url} 
                onChange={(e) => setUrl(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={checkSecurity} disabled={loading} style={{ padding: '10px 20px' }}>
                {loading ? 'Đang kiểm tra...' : 'Kiểm tra ngay'}
            </button>
            {result && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Kết quả:</h3>
                    <p><b>URL:</b> {result.url}</p>
                    <p><b>Điểm bảo mật:</b> {result.securityScore}</p>
                    <ul>
                        {result.issues.map((issue, index) => (
                            <li key={index}>{issue}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default App;
