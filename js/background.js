
let mKey;
let createPrompt;
let size;
let tabId;
const sizes = [
    "512x512", "640x360", "640x480", "640x640",
    "680x512", "512x680", "768x768", "720x1280",
    "1280x720", "1024x1024"
];
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(request.type);
    if (request.type === "init_setting")
    {
        getSetting();
        sendResponse({ farewell: "Background runtime onMessage!" });
    }
    else if (request.type === "generateImage")
    {
        getSetting(function(){
            displayImage(mKey,request.content,size);
        });
        sendResponse({ farewell: "generateImage!" });
    }
}
);

function getSetting(callback)
{
    // 获取存储的值
    chrome.storage.local.get('text_with_images_setting', function (data) {
        mKey = (typeof data.text_with_images_setting !== 'undefined') ? data.text_with_images_setting.mkey : '';
        createPrompt = (typeof data.text_with_images_setting !== 'undefined') ? data.text_with_images_setting.create_prompt : '';
        if(callback) callback();
    });
}
// 当插件安装时，创建一个右键菜单项
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "generateImage",  // 右键菜单项的唯一标识符
      title: "生成配图",  // 右键菜单项的标题
      contexts: ["selection"]  // 仅当用户选择了文本时才显示右键菜单项
    });
    sizes.forEach(size => {
        chrome.contextMenus.create({
            id: size,
            parentId: "generateImage",
            title: size,
            contexts: ["selection"]
        });
    });
});
  
// 监听右键菜单点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (sizes.includes(info.menuItemId)) {  // 检查被点击的菜单项的ID
        // 获取选中的文本
        chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getSelectedText
        }, (selection) => {
            const selectedText = selection[0].result;
            size = info.menuItemId;
            tabId = tab.id;
            console.log('选择文本:' + selectedText);
            if (selectedText) {
                getSetting(function(){
                    let summaryContent =  createPrompt.replace("{content}",selectedText)
                    console.log("总结内容：" + summaryContent);
                    summary(mKey,summaryContent);
                    //displayImage(mKey,selectedText,info.menuItemId);
                });
            }
        });
    }
});
function summary(mkey,content)
{
    // 通知content.js显示加载动画
    chrome.tabs.sendMessage(tabId, { action: "showLoading" });
    // 调用API获取图片的base64内容
    fetch('https://api.kaipm.com/picture/summary', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ mkey:mkey,content: content})
    })
    .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        chrome.tabs.sendMessage(tabId, { action: "hideLoading" });
        if(data.code !== 0) {
            chrome.tabs.sendMessage(tabId, { action: "showError", message: data.message });
        } else {
            chrome.tabs.sendMessage(tabId, { action: "displaySummary", content: data.content });
        }
    })
    .catch(error => {
        // 通知content.js隐藏加载动画并显示错误信息
        chrome.tabs.sendMessage(tabId, { action: "hideLoading" });
        chrome.tabs.sendMessage(tabId, { action: "showError", message: error.message });
    });
}
function displayImage(mkey,content,size)
{
    // 通知content.js显示加载动画
    chrome.tabs.sendMessage(tabId, { action: "showLoading" });
    // 调用API获取图片的base64内容
    fetch('https://api.kaipm.com/picture/illustration', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ mkey:mkey,content: content,size: size})
    })
    .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        chrome.tabs.sendMessage(tabId, { action: "hideLoading" });
        if(data.code !== 0) {
            chrome.tabs.sendMessage(tabId, { action: "showError", message: data.message });
        } else {
            chrome.tabs.sendMessage(tabId, { action: "displayImage", imageBase64: data.base64_image });
        }
    })
    .catch(error => {
        // 通知content.js隐藏加载动画并显示错误信息
        chrome.tabs.sendMessage(tabId, { action: "hideLoading" });
        chrome.tabs.sendMessage(tabId, { action: "showError", message: error.message });
    });
}
// 获取选中文本的函数
function getSelectedText() {
    return window.getSelection().toString();
}
  