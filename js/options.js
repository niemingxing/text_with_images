// options.js
document.addEventListener('DOMContentLoaded', function() {
    var mKeyInput = document.getElementById('mKey');
    var createPrompt = document.getElementById('createPrompt');
    var saveButton = document.getElementById('saveButton');


    // 获取保存的密钥值并设置输入框的默认值
    chrome.storage.local.get('text_with_images_setting', function(result) {
        let setting = result.text_with_images_setting;
        if (setting) {
            mKeyInput.value = setting.mkey;
            createPrompt.value = setting.create_prompt;
            console.log(setting);
        }
    });

    // 保存按钮点击事件处理程序
    saveButton.addEventListener('click', function() {
        //获取 name = level 的radio的值
        let setting = {
            'mkey':  mKeyInput.value,
            'create_prompt':createPrompt.value,
        };
        chrome.storage.local.set({ 'text_with_images_setting': setting }, function() {
            alert('设置已保存');
        });
    });
});
