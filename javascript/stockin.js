let globalSheetData = [];
document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面，显示所有数据
    fetchGoogleSheetData();

    // 搜索框输入事件监听器
    document.getElementById('searchInput').addEventListener('input', searchData);
});

//从google_sheet获取数据
const endpointUrl = 'https://script.google.com/macros/s/AKfycbyrAdT_SkCI7o6DCKrwzRf7asPUpjMbAzso8lYZvgTpYbwsJgoHdXRLsblMMmG4CU4/exec'; // 替换为你的Apps Script Web应用URL
async function fetchGoogleSheetData() {
    try {
        // 显示加载指示器
        document.getElementById('loadingIndicator').style.display = 'block';

        const response = await fetch(endpointUrl);
        const { data } = await response.json(); // 从Google Sheets获取数据
        const containers = data.map(item => item.container); // 提取container编号

        // 发送POST请求到后端API以获取位置信息
        const positionResponse = await fetch('./backend_api/retrieve.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ containers: containers }),
        });
        const positionData = await positionResponse.json(); // 获取位置信息

        // 整合位置信息到data中并调用displayData函数
        const integratedData = data.map(item => {
            const positions = positionData[item.container];
            return { ...item, ...positions }; // 合并每个容器的数据和对应位置信息
        });

        // 隐藏加载指示器
        document.getElementById('loadingIndicator').style.display = 'none';

        console.log('integratedData');
        console.log(integratedData);
        globalSheetData = integratedData;
        console.log(globalSheetData);
        displayData(integratedData); // 使用整合后的数据调用displayData函数进行展示
    } catch (error) {
        console.error('Error fetching data:', error);
        // 发生错误时也要隐藏加载指示器
        document.getElementById('loadingIndicator').style.display = 'none';

    }
}

// 显示数据
function displayData(data) {
    var containerInfoBody = document.getElementById('containerInfoBody');
    containerInfoBody.innerHTML = ''; // 清空表格内容
    const filteredData = data.filter(container => container.container);
    console.log(filteredData);
    data.filter(container => container.container)
        .forEach( (container, index) => {
        var row = document.createElement('tr');
        row.innerHTML = `
            <th style="vertical-align: middle;" scope="row">${index}</th>
            <td style="vertical-align: middle;">${container.container}</td>
            <td style="display: none">${container.客户}</td>
            <td style="vertical-align: middle;">${container.拆柜日期.substr(0,10)}</td>
            <td style="vertical-align: middle;">
                <button class="btn btn-sm btn-primary" data-bs-toggle="collapse" data-bs-target="#collapseDetails_${index}" aria-expanded="false" aria-controls="collapseDetails_${index}">Detail</button>
            </td>`;
        containerInfoBody.appendChild(row);
        // 折叠内容的构建
        var detailsRow = document.createElement('tr');
        var collapseDetailContent = `
            <td colspan="4" class="p-0">
                <div class="collapse"  id="collapseDetails_${index}">
                    <div class="card card-body bg-dark-subtle">`;

        // 遍历所有可能的卸货地和对应的板数或#
        for (let i = 0; i < 20; i++) {
            let unloadingPlace = container[`卸货地${i}`]; // 当前卸货地
            let boardNumber; // 用于存储当前卸货地的板数或#
            let position = container[`position${i}`];
            let status  = container[`status${i}`];
            // 卸货地0使用"板数"，卸货地1使用"板数1"
            if (i === 0) {
                boardNumber = container["板数"] || '';
            } else if (i === 1) {
                boardNumber = container["板数1"] || '';
            } else if(i === 2){
                boardNumber = container["#"] || '';
            } else { // 卸货地3及之后使用 "#1", "#2", ...
                boardNumber = container[`#${i-2}`] || '';
            }

            // 为了增强可读性和维护性，先构造input元素的内容
            let inputContent;
            if (position === undefined || position === '' || position === null) {
                // 当position未定义或为空时，使用placeholder显示"未知"
                inputContent = `<input type="text" class="position-input" data-index="${i}" placeholder="未知" />`;
            } else {
                // 当position有具体值时，将其作为input的value
                inputContent = `<input type="text" class="position-input" data-index="${i}" value="${position}" />`;
            }

            // 定义行的样式，如果status是0，添加 .deleted 类
            let rowStyle = status === '0' ? 'deleted' : '';

            // 如果当前卸货地存在，则添加对应的详细内容
            if (unloadingPlace) {
                collapseDetailContent +=
                    `<div class="detail-row">
                        <p class="mb-2 ${rowStyle}">
                            <span class="truncate">${unloadingPlace}</span>
                            ${boardNumber}板  
                            ${inputContent}
                            <button class="btn btn-sm btn-warning" onclick="savePosition(this)" data-container="${container.container}" data-index="${i}">save</button>
                            <button class="btn btn-sm btn-danger" onclick="toggleDelete(this)" data-container="${container.container}" data-index="${i}">Out</button>
                        </p>
                    </div>`;

            }
        }

        collapseDetailContent += `
                    </div>
                </div>
            </td>`;

        detailsRow.innerHTML = collapseDetailContent;
        containerInfoBody.appendChild(detailsRow);
    });
}


// 查找数据 根据柜号查找  支持只输入柜号尾号
function searchData() {
    var keyword = document.getElementById('searchInput').value.trim(); // 获取搜索关键词
    // 根据关键词过滤数据
    const filteredData = globalSheetData.filter(item => {
        const container = `${item.container}`; // 使用模板字符串确保container是字符串
        return keyword === '' || container.endsWith(keyword);
    });

    displayData(filteredData); // 显示搜索结果
}
// 查找数据 根据拆柜日期筛选
function filterByDate() {
    const selectedDate = document.getElementById('dateFilter').value;
    // 根据选定的日期过滤数据
    const filteredData = globalSheetData.filter(item => {
        const itemDate = item.拆柜日期.substr(0, 10); // 假设拆柜日期格式为"YYYY-MM-DD"
        return selectedDate === '' || itemDate === selectedDate;
    });

    displayData(filteredData); // 显示筛选结果
}


function savePosition(button) {
    const container = button.getAttribute('data-container');
    const positionIndex = button.getAttribute('data-index');
    const inputField = button.previousElementSibling; // 这里假设input紧邻在button之前
    const newPositionValue = inputField.value; // 获取输入框的新值

    fetch('./backend_api/update.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ container: container, positionIndex: positionIndex, newPositionValue: newPositionValue })
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === "Record updated successfully") {
                console.log('Position updated successfully for container ' + container);
                // 在这里更新前端显示
                inputField.value = newPositionValue; // 更新输入框显示的值
                inputField.style.backgroundColor = "#6dad72"; // 例如，成功时设置背景为绿色
            } else {
                console.error('Failed to update position for container ' + container + ':', data.message);
                inputField.style.backgroundColor = "#ffcccc"; // 失败时设置背景为红色
            }
        })
        .catch(error => console.error('Error:', error));
}

function toggleDelete(button) {

    const container = button.getAttribute('data-container');
    const statusIndex = button.getAttribute('data-index');// 找到包含按钮的父元素<p>
    const parentP = button.closest('p');
    // 根据当前类来判断新的状态值
    const isDeleted = parentP.classList.contains('deleted');
    const newStatusValue = isDeleted ? 1 : 0;  // 如果已删除则设置为1（恢复），否则设置为0（删除）
    fetch('./backend_api/update.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ container: container, statusIndex: statusIndex, newStatus: newStatusValue })
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === "Record updated successfully") {
                console.log('Status updated successfully for container ' + container);
                // 切换.deleted类
                parentP.classList.toggle('deleted');
            } else {
                console.error('Failed to update position for container ' + container + ':', data.message);
            }
        })
        .catch(error => console.error('Error:', error));

}


