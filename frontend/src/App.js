import React, { useState } from "react";
import axios from "axios";
import "./SecurityChecker.css";

const SecurityChecker = () => {
    const [url, setUrl] = useState("");
    const [securityResult, setSecurityResult] = useState(null);
    const [seoResult, setSeoResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCheckSecurity = async () => {
        if (!url) return alert("Vui lòng nhập URL");

        setLoading(true);
        try {
            const response = await axios.post("http://localhost:5000/check-security", { url });
            setSecurityResult(response.data);
            setSeoResult(null); // Reset SEO result khi kiểm tra bảo mật
        } catch (error) {
            setSecurityResult({ error: "Không thể kiểm tra URL này" });
        }
        setLoading(false);
    };

    const handleCheckSeo = async () => {
        if (!url) return alert("Vui lòng nhập URL");

        setLoading(true);
        try {
            const response = await axios.post("http://localhost:5000/check-seo", { url });
            setSeoResult(response.data);
            setSecurityResult(null); // Reset Security result khi kiểm tra SEO
        } catch (error) {
            setSeoResult({ error: "Không thể kiểm tra URL này" });
        }
        setLoading(false);
    };

    return (
        <div className="security-checker">
            <h2>🔍 Kiểm tra bảo mật & SEO Website</h2>
            <input
                type="text"
                placeholder="Nhập URL cần kiểm tra..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
            />
            <button onClick={handleCheckSecurity} disabled={loading}>
                {loading ? "Đang kiểm tra..." : "Kiểm tra bảo mật"}
            </button>
            <button onClick={handleCheckSeo} disabled={loading}>
                {loading ? "Đang kiểm tra..." : "Kiểm tra SEO"}
            </button>

            {/* Kết quả kiểm tra bảo mật */}
            {securityResult && (
                <div className="result">
                    {securityResult.error ? (
                        <p className="error">{securityResult.error}</p>
                    ) : (
                        <>
                            <h3>📌 Kết quả Bảo mật:</h3>
                            <p><strong>URL:</strong> {securityResult.url}</p>
                            <p><strong>🔐 Điểm bảo mật:</strong> {securityResult.securityScore}</p>
                            <h4>Các vấn đề bảo mật:</h4>
                            <ul>
                                {securityResult.issues.map((issue, index) => (
                                    <li key={index}>
                                        <p className="issue">{issue.message}</p>
                                        <pre className="code">{issue.solution}</pre>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            )}

            {/* Kết quả kiểm tra SEO */}
            {seoResult && (
                <div className="result">
                    {seoResult.error ? (
                        <p className="error">{seoResult.error}</p>
                    ) : (
                        <>
                            <h3>📌 Kết quả SEO:</h3>
                            <p><strong>URL:</strong> {seoResult.url}</p>
                            <p><strong>🔍 Điểm SEO:</strong> {seoResult.seoScore}</p>
                            <h4>Các vấn đề SEO:</h4>
                            <ul>
                                {seoResult.seoIssues.map((issue, index) => (
                                    <li key={index}>
                                        <p className="issue">{issue.message}</p>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SecurityChecker;
