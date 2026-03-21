import { ref, nextTick } from 'vue';
import { registerFileApi, fetchEditorConfigApi } from '@/api/onlyoffice';
import { loadOnlyOfficeScript } from '@/utils/onlyoffice-helper';

const DEFAULT_API_BASE_URL = "http://47.109.139.75:8080";

export function useOnlyOffice(editorElementId) {
    const isLoading = ref(false);
    const loadingText = ref("");
    const errorMessage = ref("");
    const resolvedEditorData = ref(null);

    let docEditor = null;

    // 销毁编辑器
    const destroyEditor = (editorEl) => {
        if (docEditor?.destroyEditor) docEditor.destroyEditor();
        docEditor = null;
        if (editorEl) editorEl.innerHTML = "";
    };

    // 组装最终配置
    const buildEditorConfig = (editorData) => {
        const baseConfig = editorData.editorConfig || {};
        const baseEvents = baseConfig.events || {};
        const innerEditorConfig = baseConfig.editorConfig || {};
        return {
            ...baseConfig,
            width: "100%",
            height: "100%",
            lang: "zh-CN",
            // 1. 关键修改：permissions 必须嵌套在 document 中
            document: {
                ...baseConfig.document,
                permissions: {
                    ...(baseConfig.document?.permissions || {}),
                    download: true, // 必须开启，否则 downloadAs 方法无效
                    edit: true,
                    print: true
                }
            },
            editorConfig: {
                ...innerEditorConfig,
                mode: editorData.editorConfig?.mode || "edit",
                lang: "zh-CN",
                customization: {
                    ...(baseConfig.customization || {}),
                    autosave: true,
                    forcesave: true,
                },
                plugins: {
                    autostart: [
                        // 这里不需要自动启动，留空即可
                    ],
                    pluginsData: [
                        // 告诉 ONLYOFFICE 你的插件部署在哪里
                        "https://你的服务器/onlyoffice-plugins/html-embedder/config.json"
                    ]
                }
            },
            events: {
                ...baseEvents,
                // 2. 核心回调：异步创建完成后，ONLYOFFICE 会触发此事件
                onDownloadAs: (event) => {
                    console.log('2. ONLYOFFICE 异步打包完成，触发回调！', event);

                    // 获取生成的文件链接
                    const downloadUrl = event?.data?.url;

                    if (downloadUrl) {
                        console.log(`3. 正在下载最新编辑的文件: ${downloadUrl}`);
                        // 使用 _blank 打开避免 WebAssembly 运行环境受干扰
                        window.open(downloadUrl, '_blank');
                    } else {
                        console.error('打包成功，但 event 中未包含下载 URL');
                    }

                    if (typeof baseEvents.onDownloadAs === 'function') {
                        baseEvents.onDownloadAs(event);
                    }
                },
                onAppReady: (...args) => {
                    isLoading.value = false;
                    console.log('ONLYOFFICE 已准备就绪')
                    loadingText.value = "ONLYOFFICE 已准备就绪";
                    if (typeof baseEvents.onAppReady === "function") baseEvents.onAppReady(...args);
                },
                onRequestRefreshFile: () => {
                    console.log('收到刷新请求，准备获取最新版本...');
                    // 这里可以触发重新加载逻辑
                    if (typeof baseEvents.onRequestRefreshFile === "function") {
                        baseEvents.onRequestRefreshFile();
                    }
                },
                onDocumentReady: (...args) => {
                    isLoading.value = false;
                    if (typeof baseEvents.onDocumentReady === "function") baseEvents.onDocumentReady(...args);
                },
                onError: (event) => {
                    isLoading.value = false;
                    console.log("onError")
                    errorMessage.value = event?.data?.message || "ONLYOFFICE 编辑器加载失败";
                    if (typeof baseEvents.onError === "function") baseEvents.onError(event);
                },
                onDocumentStateChange: (event) => {
                    if (event.data) {
                        console.log("文档已修改，等待自动保存...");
                    }
                    if (typeof baseEvents.onDocumentStateChange === "function") {
                        baseEvents.onDocumentStateChange(event);
                    }
                },

            },
        };
    };

    // 核心初始化方法 (支持传入 mode: 'view' 或 'edit')
    const initPreview = async (config, editorEl) => {
        if (!config) {
            errorMessage.value = "缺少预览配置，无法打开文件。";
            return;
        }

        isLoading.value = true;
        loadingText.value = "正在加载 ONLYOFFICE 编辑器...";
        errorMessage.value = "";
        destroyEditor(editorEl);

        try {
            let editorData;
            // 模式1：直接传入完整配置
            if (config.editorConfig && config.apiJsUrl) {
                editorData = config;
            } else {
                // 模式2：传入基本参数，通过后端获取配置 (注意这里的 mode)
                const apiBaseUrl = config.apiBaseUrl || import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
                const payload = {
                    fileId: config.fileId,
                    objectKey: config.objectKey,
                    fileName: config.fileName,
                    creatorId: config.creatorId,
                    bucketName: config.bucketName,
                    userId: config.userId || config.creatorId,
                    mode: config.mode || "edit", // 默认 view，或者由外部传入覆盖
                };

                loadingText.value = "正在注册文件...";
                await registerFileApi(apiBaseUrl, payload);

                loadingText.value = "正在获取编辑器配置...";
                const res = await fetchEditorConfigApi(apiBaseUrl, payload);
                editorData = res.data; // 依赖拦截器返回 response.data
                console.log(editorData)
            }

            resolvedEditorData.value = editorData;
            if (!editorData.apiJsUrl) throw new Error("后端未返回 apiJsUrl。");

            loadingText.value = "正在加载 ONLYOFFICE API...";
            await loadOnlyOfficeScript(editorData.apiJsUrl);
            await nextTick();

            const docsWindow = window;
            if (!docsWindow.DocsAPI) throw new Error("ONLYOFFICE DocsAPI 未就绪。");

            loadingText.value = "正在初始化 ONLYOFFICE 编辑器...";
            docEditor = new docsWindow.DocsAPI.DocEditor(editorElementId, buildEditorConfig(editorData));

            // 超时保护
            window.setTimeout(() => {
                if (isLoading.value && !errorMessage.value) isLoading.value = false;
            }, 5000);

        } catch (error) {
            console.error("ONLYOFFICE 初始化失败:", error);
            isLoading.value = false;
            errorMessage.value = error instanceof Error ? error.message : "预览初始化失败";
        }
    };

    // 全屏功能支持
    const enterFullscreen = async (editorEl) => {
        if (editorEl?.requestFullscreen) await editorEl.requestFullscreen();
    };

    const exitFullscreen = async () => {
        if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen();
    };

    return {
        isLoading,
        loadingText,
        errorMessage,
        resolvedEditorData,
        initPreview,
        destroyEditor,
        enterFullscreen,
        exitFullscreen,
        getEditor: () => docEditor,
    };
}