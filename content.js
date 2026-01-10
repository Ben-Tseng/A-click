// 主功能：全选所有"Yes"选项
function selectAllYesOptions() {
  try {
    let totalSelected = 0;
    let foundElements = 0;
    
    // 1. 首先在当前页面查找
    totalSelected += selectYesInCurrentDocument();
    
    // 2. 在页面中的所有iframe中查找
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach((iframe, index) => {
      try {
        // 尝试访问iframe的内容
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const iframeSelected = selectYesInDocument(iframeDoc, `iframe-${index}`);
        totalSelected += iframeSelected;
        foundElements += countElementsInDocument(iframeDoc);
        
        console.log(`iframe ${index}: selected ${iframeSelected} elements`);
      } catch (error) {
        console.log(`Cannot access iframe ${index}: ${error.message}`);
      }
    });
    
    // 3. 显示结果
    showNotification(`Selected ${totalSelected} "Yes" options on page`);
    
    if (totalSelected === 0 && foundElements === 0) {
      showNotification("No selectable elements found on this page");
    }
    
  } catch (error) {
    console.error("Error selecting Yes options:", error);
    showNotification("Error: " + error.message);
  }
}

// 在当前文档中选择所有"Yes"选项
function selectYesInCurrentDocument() {
  return selectYesInDocument(document, 'main');
}

// 在指定文档中选择所有"Yes"选项
function selectYesInDocument(doc, context = 'document') {
  let selectedCount = 0;
  
  // 1. 选择所有类型为"radio"且value为"yes"的input
  const yesRadios = doc.querySelectorAll('input[type="radio"][value="yes"], input[type="radio"][value="Yes"], input[type="radio"][value="YES"]');
  yesRadios.forEach(radio => {
    if (!radio.checked) {
      radio.checked = true;
      triggerEvents(radio);
      highlightElement(radio, 'radio');
      selectedCount++;
    }
  });
  
  // 2. 选择所有包含"Yes"文本的radio按钮
  const allRadios = doc.querySelectorAll('input[type="radio"]');
  allRadios.forEach(radio => {
    // 查找关联的label
    const id = radio.id;
    if (id) {
      const label = doc.querySelector(`label[for="${id}"]`);
      if (label && (label.textContent.includes('Yes') || label.textContent.includes('yes') || label.textContent.includes('YES'))) {
        if (!radio.checked) {
          radio.checked = true;
          triggerEvents(radio);
          highlightElement(radio, 'radio');
          selectedCount++;
        }
      }
    }
    
    // 也检查radio后面的文本
    if (!radio.checked) {
      const parent = radio.parentElement;
      if (parent && parent.textContent.includes('Yes')) {
        radio.checked = true;
        triggerEvents(radio);
        highlightElement(radio, 'radio');
        selectedCount++;
      }
    }
  });
  
  // 3. 选择所有包含"Yes"的checkbox
  const yesCheckboxes = doc.querySelectorAll('input[type="checkbox"]');
  yesCheckboxes.forEach(checkbox => {
    const id = checkbox.id;
    if (id) {
      const label = doc.querySelector(`label[for="${id}"]`);
      if (label && (label.textContent.includes('Yes') || label.textContent.includes('yes') || label.textContent.includes('YES'))) {
        checkbox.checked = true;
        triggerEvents(checkbox);
        highlightElement(checkbox, 'checkbox');
        selectedCount++;
      }
    }
  });
  
  // 4. 选择文本为"Yes"的按钮
  const yesButtons = doc.querySelectorAll('button, input[type="button"], input[type="submit"]');
  yesButtons.forEach(button => {
    if (button.textContent.includes('Yes') || button.textContent.includes('yes') || button.textContent.includes('YES') || 
        button.value.includes('Yes') || button.value.includes('yes') || button.value.includes('YES')) {
      highlightElement(button, 'button');
    }
  });
  
  // 5. 选择文本为"Yes"的选项
  const selectElements = doc.querySelectorAll('select option');
  selectElements.forEach(option => {
    if (option.textContent.includes('Yes') || option.textContent.includes('yes') || option.textContent.includes('YES')) {
      option.selected = true;
      if (option.parentElement) {
        option.parentElement.dispatchEvent(new Event('change', { bubbles: true }));
        highlightElement(option.parentElement, 'select');
      }
      selectedCount++;
    }
  });
  
  console.log(`${context}: selected ${selectedCount} "Yes" elements`);
  return selectedCount;
}

// 统计文档中的元素数量
function countElementsInDocument(doc) {
  const radios = doc.querySelectorAll('input[type="radio"]').length;
  const checkboxes = doc.querySelectorAll('input[type="checkbox"]').length;
  const selects = doc.querySelectorAll('select').length;
  return radios + checkboxes + selects;
}

// 触发元素事件
function triggerEvents(element) {
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('click', { bubbles: true }));
  element.dispatchEvent(new Event('input', { bubbles: true }));
}

// 高亮显示元素
function highlightElement(element, type = 'element') {
  const originalStyle = {
    border: element.style.border,
    boxShadow: element.style.boxShadow,
    backgroundColor: element.style.backgroundColor,
    outline: element.style.outline,
    zIndex: element.style.zIndex
  };
  
  // 根据类型设置不同的高亮颜色
  let highlightColor;
  switch(type) {
    case 'radio':
      highlightColor = '#4CAF50'; // 绿色
      break;
    case 'checkbox':
      highlightColor = '#2196F3'; // 蓝色
      break;
    case 'button':
      highlightColor = '#FF9800'; // 橙色
      break;
    case 'select':
      highlightColor = '#9C27B0'; // 紫色
      break;
    default:
      highlightColor = '#FF5722'; // 红色
  }
  
  element.style.border = `2px solid ${highlightColor}`;
  element.style.boxShadow = `0 0 10px ${highlightColor}`;
  element.style.zIndex = '10000';
  
  // 尝试滚动到元素
  try {
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center',
      inline: 'center'
    });
  } catch (e) {
    console.log('Cannot scroll to element:', e);
  }
  
  // 3秒后恢复原始样式
  setTimeout(() => {
    element.style.border = originalStyle.border;
    element.style.boxShadow = originalStyle.boxShadow;
    element.style.backgroundColor = originalStyle.backgroundColor;
    element.style.outline = originalStyle.outline;
    element.style.zIndex = originalStyle.zIndex;
  }, 3000);
}

// 显示通知
function showNotification(message) {
  // 移除现有的通知
  const existingNotification = document.getElementById('auto-select-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // 创建新通知
  const notification = document.createElement('div');
  notification.id = 'auto-select-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #4CAF50, #2E7D32);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.2);
    z-index: 100000;
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 14px;
    font-weight: 500;
    max-width: 350px;
    animation: slideInOut 3s ease-in-out;
    border-left: 4px solid white;
  `;
  
  // 添加CSS动画
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInOut {
      0% { 
        opacity: 0; 
        transform: translateX(100px) translateY(0); 
      }
      15% { 
        opacity: 1; 
        transform: translateX(0) translateY(0); 
      }
      85% { 
        opacity: 1; 
        transform: translateX(0) translateY(0); 
      }
      100% { 
        opacity: 0; 
        transform: translateX(100px) translateY(0); 
      }
    }
  `;
  document.head.appendChild(style);
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // 3秒后自动移除通知
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 3000);
}

// 键盘快捷键支持
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.shiftKey && e.key === 'Y') {
    e.preventDefault();
    selectAllYesOptions();
  }
});

// 立即执行主函数
selectAllYesOptions();