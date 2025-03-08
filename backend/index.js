const express = require("express");
const cors = require("cors");
const axios = require("axios");
const helmet = require("helmet");
const cheerio = require("cheerio"); // Thêm thư viện cheerio để phân tích HTML

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(helmet());

app.post("/check-seo", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "Thiếu URL" });

    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        let seoScore = 100;
        let seoIssues = [];

        // Kiểm tra tiêu đề
        const title = $("title").text();
        if (!title) {
            seoIssues.push({ message: "Thiếu thẻ tiêu đề (title)" });
            seoScore -= 20;
        }

        // Kiểm tra mô tả
        const description = $('meta[name="description"]').attr("content");
        if (!description) {
            seoIssues.push({ message: "Thiếu thẻ mô tả (description)" });
            seoScore -= 20;
        } else if (description.length > 155) {
            seoIssues.push({ message: "Mô tả quá dài (nên dưới 155 ký tự)" });
            seoScore -= 5;
        }

        // Kiểm tra từ khóa
        const keywords = $('meta[name="keywords"]').attr("content");
        if (!keywords) {
            seoIssues.push({ message: "Thiếu thẻ từ khóa (keywords)" });
            seoScore -= 20;
        }

        // Kiểm tra thẻ H1
        const h1 = $("h1").text();
        if (!h1) {
            seoIssues.push({ message: "Thiếu thẻ H1" });
            seoScore -= 20;
        }

        // Kiểm tra thẻ robots
        const robots = $('meta[name="robots"]').attr("content");
        if (!robots) {
            seoIssues.push({ message: "Thiếu thẻ robots" });
            seoScore -= 20;
        }

        // Kiểm tra thẻ alt của hình ảnh
        const imagesWithoutAlt = $("img").filter((_, img) => !$(img).attr("alt"));
        if (imagesWithoutAlt.length) {
            seoIssues.push({ message: `Có ${imagesWithoutAlt.length} hình ảnh thiếu thẻ alt` });
            seoScore -= 10;
        }

        // Kiểm tra liên kết hỏng
        const links = $("a");
        const brokenLinks = [];
        for (const link of links) {
            try {
                const href = $(link).attr("href");
                if (href && !href.startsWith("http")) {
                    continue; // Bỏ qua các liên kết nội bộ
                }
                const linkResponse = await axios.get(href);
                if (linkResponse.status !== 200) {
                    brokenLinks.push(href);
                }
            } catch (error) {
                brokenLinks.push($(link).attr("href"));
            }
        }
        if (brokenLinks.length) {
            seoIssues.push({ message: `Có ${brokenLinks.length} liên kết hỏng` });
            seoScore -= 10;
        }

        // Kiểm tra thẻ canonical
        const canonical = $('link[rel="canonical"]').attr("href");
        if (!canonical) {
            seoIssues.push({ message: "Thiếu thẻ canonical" });
            seoScore -= 10;
        }

        // Kiểm tra thẻ Open Graph
        const ogTitle = $('meta[property="og:title"]').attr("content");
        if (!ogTitle) {
            seoIssues.push({ message: "Thiếu thẻ OG cho tiêu đề" });
            seoScore -= 10;
        }

        // Kiểm tra thẻ viewport
        const viewport = $('meta[name="viewport"]').attr("content");
        if (!viewport) {
            seoIssues.push({ message: "Thiếu thẻ viewport" });
            seoScore -= 10;
        }

        // Kiểm tra thẻ hreflang
        const hreflangs = $('link[rel="alternate"][hreflang]');
        if (!hreflangs.length) {
            seoIssues.push({ message: "Thiếu thẻ hreflang cho phiên bản ngôn ngữ khác" });
            seoScore -= 10;
        }

        // Kiểm tra đường dẫn URL
        const urlPath = new URL(url).pathname;
        const hasKeywords = /[a-z0-9-]+/.test(urlPath);
        if (!hasKeywords) {
            seoIssues.push({ message: "Đường dẫn không thân thiện với SEO" });
            seoScore -= 10;
        }

        // Kiểm tra sử dụng HTTPS
        if (!url.startsWith("https://")) {
            seoIssues.push({ message: "Trang không sử dụng HTTPS" });
            seoScore -= 10;
        }

        // Kiểm tra schema markup
        const schemaMarkup = $('script[type="application/ld+json"]');
        if (!schemaMarkup.length) {
            seoIssues.push({ message: "Thiếu schema markup" });
            seoScore -= 10;
        }

        // Kiểm tra độ dài nội dung
        const bodyText = $("body").text().trim();
        const wordCount = bodyText.split(/\s+/).length;
        if (wordCount < 300) {
            seoIssues.push({ message: "Nội dung quá ngắn (cần ít nhất 300 từ)" });
            seoScore -= 10;
        }

        // Kiểm tra iframe
        const iframesWithoutTitle = $("iframe").filter((_, iframe) => !$(iframe).attr("title"));
        if (iframesWithoutTitle.length) {
            seoIssues.push({ message: `Có ${iframesWithoutTitle.length} iframe thiếu thuộc tính title` });
            seoScore -= 5;
        }

        // Kiểm tra liên kết nội bộ
        const internalLinks = $("a").filter((_, a) => $(a).attr("href").startsWith(url));
        if (internalLinks.length < 3) {
            seoIssues.push({ message: "Cần thêm liên kết nội bộ để cải thiện SEO" });
            seoScore -= 5;
        }

        res.json({ url, seoScore, seoIssues });
    } catch (error) {
        res.status(500).json({ error: "Không thể kiểm tra URL này" });
    }
});


app.post("/check-security", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "Thiếu URL" });

    try {
        const response = await axios.get(url);
        const headers = response.headers;

        let securityScore = 100;
        let issues = [];

        const securityChecks = [
            {
                header: "content-security-policy",
                message: "Thiếu Content Security Policy (Bảo vệ chống XSS và các cuộc tấn công khác)",
                solution: `app.use(helmet.contentSecurityPolicy());`,
                deduction: 20,
            },
            {
                header: "x-frame-options",
                message: "Thiếu X-Frame-Options (Chống Clickjacking)",
                solution: `app.use(helmet.frameguard({ action: 'deny' }));`,
                deduction: 15,
            },
            {
                header: "x-xss-protection",
                message: "Thiếu X-XSS-Protection (Bảo vệ chống tấn công XSS)",
                solution: `app.use(helmet.xssFilter());`,
                deduction: 15,
            },
            {
                header: "strict-transport-security",
                message: "Thiếu Strict-Transport-Security (Bảo đảm chỉ sử dụng HTTPS)",
                solution: `app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));`,
                deduction: 10,
            },
            {
                header: "referrer-policy",
                message: "Thiếu Referrer-Policy (Kiểm soát thông tin referrer gửi đi)",
                solution: `app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));`,
                deduction: 10,
            },
            {
                header: "permissions-policy",
                message: "Thiếu Permissions-Policy (Hạn chế quyền truy cập của trình duyệt)",
                solution: `app.use(helmet.permittedCrossDomainPolicies({ permittedPolicies: "none" }));`,
                deduction: 10,
            },
            {
                header: "cross-origin-resource-policy",
                message: "Thiếu Cross-Origin-Resource-Policy (Ngăn chặn chia sẻ tài nguyên không mong muốn)",
                solution: `app.use(helmet.crossOriginResourcePolicy({ policy: "same-origin" }));`,
                deduction: 10,
            },
            {
                header: "cross-origin-opener-policy",
                message: "Thiếu Cross-Origin-Opener-Policy (Giúp ngăn chặn Spectre Attack)",
                solution: `app.use(helmet.crossOriginOpenerPolicy({ policy: "same-origin" }));`,
                deduction: 10,
            },
            {
                header: "cross-origin-embedder-policy",
                message: "Thiếu Cross-Origin-Embedder-Policy (Bảo vệ khỏi khai thác side-channel)",
                solution: `app.use(helmet.crossOriginEmbedderPolicy({ policy: "require-corp" }));`,
                deduction: 10,
            },
            {
                header: "expect-ct",
                message: "Thiếu Expect-CT (Bảo vệ khỏi tấn công TLS giả mạo)",
                solution: `app.use(helmet.expectCt({ maxAge: 86400, enforce: true }));`,
                deduction: 10,
            },
            {
                header: "x-content-type-options",
                message: "Thiếu X-Content-Type-Options (Ngăn chặn tấn công MIME-sniffing)",
                solution: `app.use(helmet.noSniff());`,
                deduction: 10,
            },
            {
                header: "cache-control",
                message: "Thiếu Cache-Control (Kiểm soát bộ nhớ đệm để bảo mật dữ liệu nhạy cảm)",
                solution: `app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    next();
});`,
                deduction: 10,
            },
            {
                header: "access-control-allow-origin",
                message: "Thiếu CORS Policy (Chính sách chia sẻ tài nguyên giữa các nguồn gốc khác nhau)",
                solution: `app.use(cors({
    origin: "https://yourdomain.com",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));`,
                deduction: 10,
            },
            {
                header: "server",
                message: "Máy chủ tiết lộ thông tin về server (Nên ẩn thông tin này)",
                solution: `app.use((req, res, next) => {
    res.removeHeader("Server");
    next();
});`,
                deduction: 5,
            },
            {
                header: "set-cookie",
                message: "Thiếu Secure & HttpOnly & SameSite trong cookie (Giảm nguy cơ XSS & CSRF)",
                solution: `app.use((req, res, next) => {
    res.cookie("sessionId", "yourSessionId", {
        secure: true,
        httpOnly: true,
        sameSite: "Strict"
    });
    next();
});`,
                deduction: 10,
            }
        ];

        securityChecks.forEach(({ header, message, solution, deduction }) => {
            if (!headers[header]) {
                issues.push({ message, solution });
                securityScore -= deduction;
            }
        });

        res.json({ url, securityScore, issues });
    } catch (error) {
        res.status(500).json({ error: "Không thể kiểm tra URL này" });
    }
});

app.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`);
});
