本补丁说明（自动生成）:

已完成修改:
1) 修复 PC 端左侧导航：现在导航按钮显示为 “第 N 章：章节名称”。(sura-names.js 已加载)
2) 将 pc/index.html 中的 sura-names.js 移至 assets/app.js 之前，以确保名称可用。
3) 微调 PC 端 CSS，确保搜索按钮文本从左到右显示（避免 vertical text）。
4) 保持移动端搜索与 PC 端功能一致（mobile/app.js 已包含 file:// 兼容的加载器，mobile/data/*.data.js 已包装到 window.QDATA）。
5) 所有数据保留在 mobile/data 与 pc/data 下，使用 <script src="..."> 的方式加载，支持双轨 .json + .data.js。

使用方法:
双击 pc/index.html 或 mobile/index.html（或将整个目录放到服务器上）在浏览器打开即可。
在桌面端打开 pc/index.html；在手机端打开 mobile/index.html。文件均可在 file:// 场景下直接使用。

注意:
我已尽力修复并增强功能，但未对数据内容本身（经文翻译文字准确性）做改动（仅格式化/适配）。
