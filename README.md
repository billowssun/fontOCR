# 字体识别台

图片文字与字体候选识别工具，结合百度 OCR 或浏览器端 Tesseract 提取文字并对照候选字体预览。

## 功能

- 上传图片并提取中文或英文文字。
- 有服务端配置时使用百度 OCR，否则尝试 Tesseract 浏览器识别。
- 对照候选字体查看文字效果，辅助人工判断。

OCR 用于识别文字内容；字体候选预览不等于可以准确识别任意字体文件。

## 本地预览

在项目根目录运行：

```bash
python3 -m http.server 8000 --directory public
```

访问 `http://localhost:8000`，使用浏览器识别模式。普通静态服务器不会运行 `/api/ocr`。识别库和字体资源会从外部 CDN 加载，需要网络访问。

## 服务端 OCR 与部署

在 Vercel 中从仓库根目录导入项目，配置：

| 环境变量 | 用途 |
| --- | --- |
| `BAIDU_API_KEY` | 百度 OCR API Key |
| `BAIDU_SECRET_KEY` | 百度 OCR Secret Key |

`public/index.html` 是页面入口，`api/ocr.js` 是服务端接口。详细说明见 [DEPLOYMENT.md](./DEPLOYMENT.md)。

```bash
npm run check
```

该命令检查服务端 JavaScript 语法。密钥只放在服务端环境变量中。公开部署付费 OCR 接口前需配置访问控制与用量限制，当前接口没有应用级身份校验。
