let optionsData = null;
let selectedOptions = {
    propertyType: null,
    bathroom: null,
    bathroomSubOptions: null,
    kitchen: null,
    kitchenSubOptions: null,
    livingRoom: null,
    livingRoomSubOptions: null
};

// 加載選項數據
async function loadOptions() {
    try {
        const response = await fetch('options.json');
        optionsData = await response.json();
        initializeForm();
    } catch (error) {
        console.error('Error loading options:', error);
    }
}

// 初始化表單
function initializeForm() {
    if (!optionsData) return;

    // 初始化物業類型選項
    initializePropertyTypes();
    
    // 添加物業類型變更事件監聽器
    document.getElementById('propertyType').addEventListener('change', handlePropertyTypeChange);

    // 添加表單提交事件監聽器
    document.getElementById('renovationForm').addEventListener('submit', handleFormSubmit);
}

// 初始化物業類型選項
function initializePropertyTypes() {
    const select = document.getElementById('propertyType');
    Object.entries(optionsData.propertyTypes).forEach(([id, type]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = type.name;
        select.appendChild(option);
    });
}

// 處理物業類型變更
function handlePropertyTypeChange(event) {
    const propertyType = event.target.value;
    selectedOptions.propertyType = propertyType;
    
    // 重置所有選項
    selectedOptions = {
        propertyType: propertyType,
        bathroom: null,
        bathroomSubOptions: null,
        kitchen: null,
        kitchenSubOptions: null,
        livingRoom: null,
        livingRoomSubOptions: null
    };
    
    // 清除所有選項的顯示
    document.getElementById('bathroomOptions').innerHTML = '';
    document.getElementById('bathroomSubOptions').innerHTML = '';
    document.getElementById('kitchenOptions').innerHTML = '';
    document.getElementById('kitchenSubOptions').innerHTML = '';
    document.getElementById('livingRoomOptions').innerHTML = '';
    document.getElementById('livingRoomSubOptions').innerHTML = '';
    
    // 更新圖片
    const propertyImage = document.getElementById('propertyImage');
    const typeData = optionsData.propertyTypes[propertyType];
    const imagePath = `images/${typeData.image}`;
    
    propertyImage.innerHTML = `<img src="${imagePath}" alt="${typeData.name}">`;
    
    // 顯示所有部分
    showAllSections();
    
    // 重新初始化所有選項
    initializeBathroomOptions();
    initializeKitchenOptions();
    initializeLivingRoomOptions();
    
    // 隱藏結果容器
    document.getElementById('resultContainer').style.display = 'none';
    
    // 檢查是否顯示計算按鈕
    checkAllOptionsSelected();
}

// 顯示物業圖片
function displayPropertyImage(imagePath) {
    const container = document.getElementById('propertyImage');
    if (imagePath) {
        container.innerHTML = `
            <img src="images/${imagePath}" alt="物業平面圖" class="property-image">
            <span class="image-caption">點擊查看大圖</span>
        `;
        
        // 添加點擊事件
        const img = container.querySelector('img');
        const caption = container.querySelector('.image-caption');
        
        const showModal = () => {
            const modal = document.createElement('div');
            modal.className = 'modal';
            
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            
            const modalImg = document.createElement('img');
            modalImg.src = img.src;
            
            const closeButton = document.createElement('button');
            closeButton.className = 'close-button';
            closeButton.innerHTML = '×';
            closeButton.onclick = () => {
                document.body.removeChild(modal);
            };
            
            modalContent.appendChild(modalImg);
            modalContent.appendChild(closeButton);
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            // 點擊背景關閉
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });
        };
        
        img.addEventListener('click', showModal);
        caption.addEventListener('click', showModal);
    } else {
        container.innerHTML = '';
    }
}

// 顯示所有部分
function showAllSections() {
    ['bathroomSection', 'kitchenSection', 'livingRoomSection'].forEach(id => {
        const section = document.getElementById(id);
        section.style.display = 'block';
    });
}

// 隱藏所有部分
function hideAllSections() {
    ['bathroomSection', 'kitchenSection', 'livingRoomSection'].forEach(id => {
        const section = document.getElementById(id);
        section.style.display = 'none';
    });
}

// 初始化廁所選項
function initializeBathroomOptions() {
    const container = document.getElementById('bathroomOptions');
    const bathroomData = optionsData.bathroom;
    // container.innerHTML = `<h3>${bathroomData.title}</h3>`;
    
    bathroomData.options.forEach(option => {
        const optionElement = createOptionElement(option, 'bathroom');
        container.appendChild(optionElement);
    });
}

// 初始化廚房選項
function initializeKitchenOptions() {
    const container = document.getElementById('kitchenOptions');
    const kitchenData = optionsData.kitchen;
    
    // container.innerHTML = `<h3>${kitchenData.title}</h3>`;
    
    kitchenData.options.forEach(option => {
        const optionElement = createOptionElement(option, 'kitchen');
        container.appendChild(optionElement);
    });
}

// 初始化客廳/房間選項
function initializeLivingRoomOptions() {
    const container = document.getElementById('livingRoomOptions');
    const livingRoomData = optionsData.livingRoom;
    const maxRooms = optionsData.propertyTypes[selectedOptions.propertyType].maxRooms;
    
    // container.innerHTML = `<h3>${livingRoomData.title}</h3>`;
    
    livingRoomData.options.forEach(option => {
        if (option.id === 'no_room' || 
            (option.id === 'one_room' && maxRooms >= 1) ||
            (option.id === 'two_rooms' && maxRooms >= 2) ||
            (option.id === 'three_rooms' && maxRooms >= 3)) {
            const optionElement = createOptionElement(option, 'livingRoom');
            container.appendChild(optionElement);
        }
    });
}

// 創建選項元素
function createOptionElement(option, type) {
    const div = document.createElement('div');
    div.className = 'option-item';
    div.dataset.id = option.id;
    div.dataset.type = type;

    const title = document.createElement('h3');
    title.textContent = option.name;
    div.appendChild(title);

    if (option.description) {
        const description = document.createElement('p');
        description.textContent = option.description.join('\n');
        div.appendChild(description);
    }

    div.addEventListener('click', () => handleOptionClick(option, type));
    return div;
}

// 處理選項點擊
function handleOptionClick(option, type) {
    const container = document.getElementById(`${type}Options`);
    const subContainer = document.getElementById(`${type}SubOptions`);
    
    // 清除之前選中的選項
    container.querySelectorAll('.option-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // 選中當前選項
    const selectedItem = container.querySelector(`[data-id="${option.id}"]`);
    selectedItem.classList.add('selected');
    
    // 更新選中的選項
    selectedOptions[type] = option.id;
    
    // 處理子選項
    if (option.sub_options && option.id !== 'bathroom_keep' && option.id !== 'kitchen_keep') {
        subContainer.innerHTML = `<h3>${option.sub_options.title}</h3>`;
        
        if (option.sub_options.type === 'multiple') {
            option.sub_options.options.forEach(subOption => {
                if (subOption.type === 'single') {
                    // 處理單選子選項（二選一）
                    const subOptionGroup = document.createElement('div');
                    subOptionGroup.className = 'sub-option-group';
                    subOptionGroup.innerHTML = `<h4>${subOption.name}</h4>`;
                    
                    const optionsContainer = document.createElement('div');
                    optionsContainer.className = 'single-options-container';
                    
                    subOption.options.forEach(opt => {
                        const subOptionElement = document.createElement('div');
                        subOptionElement.className = 'option-item';
                        subOptionElement.innerHTML = `
                            <input type="radio" id="${type}_${subOption.id}_${opt.id}" name="${type}_${subOption.id}" value="${opt.id}">
                            <label for="${type}_${subOption.id}_${opt.id}">${opt.name}</label>
                        `;
                        
                        // 設置事件監聽器
                        const radio = subOptionElement.querySelector('input[type="radio"]');
                        radio.addEventListener('change', function() {
                            if (!selectedOptions[`${type}SubOptions`]) {
                                selectedOptions[`${type}SubOptions`] = {};
                            }
                            selectedOptions[`${type}SubOptions`][subOption.id] = opt.id;
                            checkAllOptionsSelected();
                        });
                        
                        optionsContainer.appendChild(subOptionElement);
                    });
                    
                    subOptionGroup.appendChild(optionsContainer);
                    subContainer.appendChild(subOptionGroup);
                } else {
                    // 處理多選子選項
                    const subOptionElement = createSubOptionElement(subOption, type);
                    subContainer.appendChild(subOptionElement);
                }
            });
        }
    } else {
        // 清除子選項容器
        subContainer.innerHTML = '';
        // 清除子選項的選擇
        if (type === 'bathroom') {
            selectedOptions.bathroomSubOptions = null;
        } else if (type === 'kitchen') {
            selectedOptions.kitchenSubOptions = null;
        }
    }
    
    // 檢查是否顯示計算按鈕
    checkAllOptionsSelected();
}

// 檢查是否所有主要選項都已選擇
function checkAllOptionsSelected() {
    const propertyType = document.getElementById('propertyType').value;
    const bathroom = document.getElementById('bathroomOptions').querySelector('.selected');
    const kitchen = document.getElementById('kitchenOptions').querySelector('.selected');
    const livingRoom = document.getElementById('livingRoomOptions').querySelector('.selected');
    
    const calculateBtn = document.getElementById('calculateBtn');
    
    if (propertyType && bathroom && kitchen && livingRoom) {
        calculateBtn.classList.add('visible');
    } else {
        calculateBtn.classList.remove('visible');
    }
}

// 創建子選項元素
function createSubOptionElement(option, type) {
    const div = document.createElement('div');
    div.className = 'option-item';
    div.dataset.id = option.id;
    div.dataset.type = `${type}Sub`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = option.id;
    
    // 檢查是否為固定選項（瓷磚或水喉）
    const isFixedOption = (type === 'bathroom' || type === 'kitchen') && 
                         (option.id.includes('tiles') || option.id.includes('pipes'));
    
    if (isFixedOption) {
        checkbox.checked = true;
        checkbox.disabled = true;
        div.classList.add('fixed-option');
    }
    
    div.appendChild(checkbox);

    const label = document.createElement('label');
    label.htmlFor = option.id;
    label.textContent = option.name;
    div.appendChild(label);

    if (option.description) {
        const description = document.createElement('p');
        description.textContent = option.description.join('\n');
        div.appendChild(description);
    }

    if (!isFixedOption) {
        div.addEventListener('click', () => {
            checkbox.checked = !checkbox.checked;
            updateSelectedSubOptions(type);
        });
    }

    return div;
}

// 更新選中的子選項
function updateSelectedSubOptions(type) {
    const container = document.getElementById(`${type}SubOptions`);
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    selectedOptions[`${type}Sub`] = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.id);
}

// 處理表單提交
function handleFormSubmit(event) {
    event.preventDefault();
    updateResults();
}

// 計算總價
function calculateTotalPrice() {
    let totalPrice = 0;
    const priceDetails = [];

    // 計算廁所價格
    if (selectedOptions.bathroom) {
        const bathroomOption = optionsData.bathroom.options.find(opt => opt.id === selectedOptions.bathroom);
        if (bathroomOption) {
            totalPrice += bathroomOption.price;
            priceDetails.push({
                category: '廁所裝修',
                name: bathroomOption.name,
                price: bathroomOption.price
            });

            // 計算廁所子選項價格
            if (bathroomOption.sub_options && selectedOptions.bathroomSubOptions) {
                selectedOptions.bathroomSubOptions.forEach(subId => {
                    const subOption = bathroomOption.sub_options.options.find(opt => opt.id === subId);
                    if (subOption) {
                        totalPrice += subOption.price;
                        priceDetails.push({
                            category: '廁所額外選項',
                            name: subOption.name,
                            price: subOption.price
                        });
                    }
                });
            }
        }
    }

    // 計算廚房價格
    if (selectedOptions.kitchen) {
        const kitchenOption = optionsData.kitchen.options.find(opt => opt.id === selectedOptions.kitchen);
        if (kitchenOption) {
            totalPrice += kitchenOption.price;
            priceDetails.push({
                category: '廚房裝修',
                name: kitchenOption.name,
                price: kitchenOption.price
            });

            // 計算廚房子選項價格
            if (kitchenOption.sub_options && selectedOptions.kitchenSubOptions) {
                selectedOptions.kitchenSubOptions.forEach(subId => {
                    const subOption = kitchenOption.sub_options.options.find(opt => opt.id === subId);
                    if (subOption) {
                        totalPrice += subOption.price;
                        priceDetails.push({
                            category: '廚房額外選項',
                            name: subOption.name,
                            price: subOption.price
                        });
                    }
                });
            }
        }
    }

    // 計算客廳/房間價格
    if (selectedOptions.livingRoom) {
        const livingRoomOption = optionsData.livingRoom.options.find(opt => opt.id === selectedOptions.livingRoom);
        if (livingRoomOption) {
            totalPrice += livingRoomOption.price;
            priceDetails.push({
                category: '客廳/房間裝修',
                name: livingRoomOption.name,
                price: livingRoomOption.price
            });
        }
    }

    return { totalPrice, priceDetails };
}

// 生成報價表單
function generateQuote() {
    const { totalPrice, priceDetails } = calculateTotalPrice();
    const propertyType = optionsData.propertyTypes[selectedOptions.propertyType].name;
    
    let quoteContent = `叻媽教室 HK - 裝修報價單\n\n`;
    quoteContent += `物業類型: ${propertyType}\n\n`;
    quoteContent += `項目明細:\n`;
    
    priceDetails.forEach(item => {
        quoteContent += `${item.category} - ${item.name}: $${item.price.toLocaleString()}\n`;
    });
    
    quoteContent += `\n總價: $${totalPrice.toLocaleString()}\n`;
    quoteContent += `\n報價有效期: 30天\n`;
    quoteContent += `\n備註: 以上價格僅供參考，實際價格可能因現場情況而有所調整。\n`;
    
    return quoteContent;
}

// 下載報價表單
function downloadQuote() {
    const quoteContent = generateQuote();
    const blob = new Blob([quoteContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `裝修報價單_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 更新結果顯示
function updateResults() {
    const { totalPrice, priceDetails } = calculateTotalPrice();
    const resultContainer = document.getElementById('resultContainer');
    const priceDetailsElement = document.getElementById('priceDetails');
    const totalPriceElement = document.getElementById('totalPrice');
    
    // 清空之前的結果
    priceDetailsElement.innerHTML = '';
    
    // 顯示價格明細
    priceDetails.forEach(item => {
        const detailElement = document.createElement('div');
        detailElement.className = 'price-detail';
        detailElement.innerHTML = `
            <div class="detail-category">${item.category}</div>
            <div class="detail-name">${item.name}</div>
            <div class="detail-price">$${item.price.toLocaleString()}</div>
        `;
        priceDetailsElement.appendChild(detailElement);
    });
    
    // 顯示總價
    totalPriceElement.textContent = `總價: $${totalPrice.toLocaleString()}`;
    
    // 顯示結果容器
    resultContainer.style.display = 'block';
}

// 添加下載按鈕點擊事件
document.getElementById('downloadQuote').addEventListener('click', downloadQuote);

// 頁面加載時初始化
document.addEventListener('DOMContentLoaded', loadOptions); 
