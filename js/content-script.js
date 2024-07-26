// 在页面加载完成后插入弹层和引入CSS文件
window.onload = function() {
	chrome.storage.local.get('text_with_images_setting', function (data) {
		chrome.runtime.sendMessage({"type":"init_setting","setting":data.text_with_images_setting}, function (response) {
			console.log(response.farewell)
		});
	});
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "getSelectedText") {
	  	sendResponse({ selectedText: window.getSelection().toString() });
	}
	else if (request.action === "displaySummary") {
		displaySummary(request.content);
	}
	else if (request.action === "displayImage") {
		displayImage(request.imageBase64);
	}
	else if (request.action === "showLoading") {
		showLoading();
	} else if (request.action === "hideLoading") {
		hideLoading();
	} else if (request.action === "showError") {
		showError(request.message);
	}
});

/**
 * 显示总结内容，允许编辑，提交编辑后发送给后端生成图片
 * @param {*} content 
 */
function displaySummary(content) {
	
	// 创建一个覆盖整个页面的div
	let overlay = document.createElement('div');
	overlay.style.position = 'fixed';
	overlay.style.top = 0;
	overlay.style.left = 0;
	overlay.style.width = '100%';
	overlay.style.height = '100%';
	overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
	overlay.style.zIndex = 10000;
	overlay.style.display = 'flex';
	overlay.style.justifyContent = 'center';
	overlay.style.alignItems = 'center';

	// 创建一个容器元素
	let container = document.createElement('div');
	container.style.width = '80%';
	container.style.display = 'flex';
	container.style.flexDirection = 'column';
	container.style.alignItems = 'center';

	// 创建一个textarea元素显示总结内容
	let textarea = document.createElement('textarea');
	textarea.value = content;
	textarea.style.width = '80%';
	textarea.style.height = '200px';
	textarea.style.border = '2px solid #08807c';
	textarea.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
	container.appendChild(textarea);

	// 创建一个提交按钮
	let submitButton = document.createElement('button');
	submitButton.innerText = '生成图片';
	submitButton.style.marginTop = '10px'; // 添加 margin-top
	submitButton.style.padding = '10px 25px';
	submitButton.style.fontSize = '16px';
	submitButton.style.cursor = 'pointer';
	submitButton.style.backgroundColor = '#08807c';
	submitButton.style.color = 'white';
	submitButton.style.border = 'none';
	submitButton.style.borderRadius = '3px';
	container.appendChild(submitButton);

	// 将容器添加到遮罩层
	overlay.appendChild(container);

	submitButton.addEventListener('click', () => {
		if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
        }
		let content = textarea.value;
		chrome.runtime.sendMessage({ type: "generateImage", content: content }, (response) => {
			console.log(response.farewell);
		});
	});

	// 添加点击事件，点击遮罩层关闭
	overlay.addEventListener('click', () => {
		if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
        }
	});

	// 阻止点击textarea和按钮时关闭遮罩层
	textarea.addEventListener('click', (event) => {
		event.stopPropagation();
	});

	document.body.appendChild(overlay);

}

function displayImage(imageBase64) {
	// 创建一个覆盖整个页面的div
	let overlay = document.createElement('div');
	overlay.style.position = 'fixed';
	overlay.style.top = 0;
	overlay.style.left = 0;
	overlay.style.width = '100%';
	overlay.style.height = '100%';
	overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
	overlay.style.zIndex = 10000;
	overlay.style.display = 'flex';
	overlay.style.justifyContent = 'center';
	overlay.style.alignItems = 'center';

	// 创建一个容器元素
	let container = document.createElement('div');
	container.style.width = '100%';
	container.style.display = 'flex';
	container.style.flexDirection = 'column';
	container.style.alignItems = 'center';

	// 创建一个img元素显示图片
	let img = document.createElement('img');
	img.src = 'data:image/png;base64,' + imageBase64;
	img.style.maxWidth = '70%';
	img.style.maxHeight = '600px';
	img.style.border = '2px solid #08807c';
	img.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
	container.appendChild(img);

	// 创建一个下载按钮
	let downloadButton = document.createElement('button');
	downloadButton.innerText = '下载图片';
	//downloadButton.style.position = 'absolute';
	downloadButton.style.marginTop = '10px';
	downloadButton.style.padding = '10px 25px';
	downloadButton.style.fontSize = '16px';
	downloadButton.style.cursor = 'pointer';
	downloadButton.style.backgroundColor = '#08807c';
	downloadButton.style.color = 'white';
	downloadButton.style.border = 'none';
	downloadButton.style.borderRadius = '3px';
	container.appendChild(downloadButton);

	// 将容器添加到遮罩层
	overlay.appendChild(container);

	downloadButton.addEventListener('click', () => {
		let link = document.createElement('a');
		link.href = img.src;
		link.download = 'generated_image.png';
		link.click();
	});

	// 添加点击事件，点击遮罩层关闭
	overlay.addEventListener('click', () => {
		if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
        }
	});

	// 阻止点击图片和按钮时关闭遮罩层
	img.addEventListener('click', (event) => {
		event.stopPropagation();
	});
	downloadButton.addEventListener('click', (event) => {
		event.stopPropagation();
	});

	document.body.appendChild(overlay);
}

function showLoading() {
	let loadingOverlay = document.createElement('div');
	loadingOverlay.id = 'loadingOverlay';
	loadingOverlay.style.position = 'fixed';
	loadingOverlay.style.top = '50%';
	loadingOverlay.style.left = '50%';
	loadingOverlay.style.transform = 'translate(-50%, -50%)';
	loadingOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
	loadingOverlay.style.color = 'white';
	loadingOverlay.style.padding = '20px';
	loadingOverlay.style.borderRadius = '10px';
	loadingOverlay.style.zIndex = 10000;
	loadingOverlay.style.textAlign = 'center';
	loadingOverlay.innerText = '处理中...';
  
	document.body.appendChild(loadingOverlay);
  }
  
  function hideLoading() {
	let loadingOverlay = document.getElementById('loadingOverlay');
	if (loadingOverlay) {
	  loadingOverlay.remove();
	}
  }
  
  function showError(message) {
	let errorOverlay = document.createElement('div');
	errorOverlay.id = 'errorOverlay';
	errorOverlay.style.position = 'fixed';
	errorOverlay.style.top = '50%';
	errorOverlay.style.left = '50%';
	errorOverlay.style.transform = 'translate(-50%, -50%)';
	errorOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
	errorOverlay.style.color = 'white';
	errorOverlay.style.padding = '20px';
	errorOverlay.style.borderRadius = '10px';
	errorOverlay.style.zIndex = 10000;
	errorOverlay.style.textAlign = 'center';
	errorOverlay.innerText = 'Error: ' + message;
  
	document.body.appendChild(errorOverlay);
  
	// 设置3秒后隐藏错误提示
	setTimeout(() => {
	  if (errorOverlay) {
		errorOverlay.remove();
	  }
	}, 3000);
  }