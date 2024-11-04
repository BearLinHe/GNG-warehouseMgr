let globalWorkType = 'loading';

function verifyAccess() {
    const correctPassword1 = 'gusty'; // 设置正确的密码
    const correctPassword2 = 'lin';
    const correctPassword3 = 'cj';
    const userPassword = prompt('请输入密码来验证您的访问权限:');

    if (userPassword === correctPassword1 || correctPassword2 || correctPassword3) {
        document.getElementById('accessControl').style.display = 'none'; // 隐藏无权限提示和查看按钮
        document.getElementById('hidden-content').style.display = 'block'; // 显示表格区域
    } else if (userPassword === null) {
        // 用户点击取消，不做任何操作
        console.log('用户取消输入');
    } else {
        alert('密码错误，请重新输入！');
    }
}


document.addEventListener('DOMContentLoaded', function() {
    var currentLang = 'zh'; // 初始语言设置为中文
    updateContent(currentLang); // 首次加载时更新内容

});

function updateContent(language) {
    var translations = {
        'en': {
            'pageTitle': 'Warehouse Work Record Statistics',
            'uploadWorkRecord': 'Upload Work Record',
            'workTypeLabel': 'Work Content',
            'selectWorkType': 'Select Work Type',
            'loading': 'Loading',
            'moving': 'Container Moving',
            'labeling': 'Labeling',
            'selectOperator': 'Select Operator:',
            'startDateLabel': 'Start Date:',
            'endDateLabel': 'End Date:',
            'applyFilters': 'Apply Filters',
            'loadingWork': 'Loading Work',
            'movingWork': 'Moving Work',
            'labelingWork': 'Labeling Work',
            'operatorLabel': 'Operator',
            'workDateLabel': 'Work Date',
            'workQuantityLabel': 'Work Quantity',
            'uploadPhoto': 'Upload Photo',
            'closeButton': 'Close',
            'submitButton': 'Submit',
            'viewImage': 'View Image',
            'deleteButton': 'Delete',
            'imageModalTitle': 'Image View',
            'viewRecord': 'View Records',
            'accessRight': 'Have no right to View'
        },
        'zh': {
            'pageTitle': '仓库工作记录统计',
            'uploadWorkRecord': '上传工作记录',
            'workTypeLabel': '工作内容',
            'selectWorkType': '选择工作类型',
            'loading': '装车',
            'moving': '挪柜',
            'labeling': '贴标',
            'selectOperator': '选择操作人:',
            'startDateLabel': '开始日期:',
            'endDateLabel': '结束日期:',
            'applyFilters': '应用筛选',
            'loadingWork': '装车工作',
            'movingWork': '挪柜工作',
            'labelingWork': '贴标工作',
            'operatorLabel': '操作人',
            'workDateLabel': '工作日期',
            'workQuantityLabel': '工作数量',
            'uploadPhoto': '上传照片',
            'closeButton': '关闭',
            'submitButton': '提交',
            'viewImage': '查看图片',
            'deleteButton': '删除',
            'imageModalTitle': '图片查看',
            'viewRecord': '查看记录',
            'accessRight': '没有查看权限'
        }
    };

    // 更新页面上的所有文本
    for (var key in translations[language]) {
        var elements = document.querySelectorAll(`[data-translate=${key}]`);
        elements.forEach(element => {
            element.textContent = translations[language][key];
        });
    }
}

function switchWorkType(workType, button) {
    globalWorkType = workType;
    // 隐藏所有工作类型的内容
    document.querySelectorAll('.work-section').forEach(function(section) {
        section.style.display = 'none';
    });

    // 显示选定的工作类型内容
    document.getElementById(workType).style.display = 'block';

    // 更新按钮的样式
    // 先将所有按钮设为非激活状态
    document.querySelectorAll('.btn-group button').forEach(function(btn) {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
    });

    // 将点击的按钮设为激活状态
    button.classList.add('btn-primary');
    button.classList.remove('btn-secondary');

    // 根据工作类型加载数据
    loadTrailerData(globalWorkType);
}
document.addEventListener('DOMContentLoaded', function() {
    var submitButton = document.getElementById('submit-btn');
    var fileInput = document.getElementById('photoUpload');

    submitButton.addEventListener('click', function(event) {
        if (fileInput.files.length === 0) {
            event.preventDefault(); // 阻止表单提交
            alert('请上传照片。'); // 提示用户
            fileInput.click(); // 尝试再次打开文件选择器
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    var form = document.getElementById('workLogForm');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        var formData = new FormData(this);
        const loadingSpinner = document.getElementById('loadingSpinner');
        loadingSpinner.style.display = 'inline-block';  // Show loading spinner
        var fileInput = document.getElementById('photoUpload');
        var file = fileInput.files[0];
        formData.append('photo', file);

        fetch('./workRecord_api/create.php', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
            .then(data => {

                // Clear the form fields
                Array.from(this.elements).forEach(input => input.value = '');

                // Close the modal using Bootstrap's modal method
                var modal = bootstrap.Modal.getInstance(document.getElementById('workLogModal'));
                modal.hide();

                loadTrailerData(globalWorkType);

            }).catch(error => {
            alert('提交失败，请稍后重试。');
            console.error('Error:', error);
        }).finally(() => {
            loadingSpinner.style.display = 'none';  // Hide loading spinner
        });
    });
});

function applyFilters() {
    const operator = document.getElementById('filterOperator').value;
    const startDate = document.getElementById('filterStartDate').value;
    const endDate = document.getElementById('filterEndDate').value;

    // Constructing query parameters
    const params = new URLSearchParams({
        operator: operator,
        startDate: startDate,
        endDate: endDate
    });

    // Clearing previous data displayed in the table
    document.getElementById('loadTrailerTableBody').innerHTML = '';
    const timestamp = new Date().getTime();

    fetch(`./workRecord_api/filter.php?${params.toString()}&workType=${globalWorkType}&timestamp=${timestamp}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                displayTrailerData(data, globalWorkType); // Display new filtered data
            } else {
                // Optionally handle the case where no results are found
                document.getElementById('loadTrailerTableBody').innerHTML = '<tr><td colspan="5" class="text-center">No data found for the selected filters.</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error loading the data:', error);
            // Optionally handle fetch errors (e.g., display a message)
            document.getElementById('loadTrailerTableBody').innerHTML = '<tr><td colspan="5" class="text-center">Error loading data. Please try again later.</td></tr>';
        });
}


function loadTrailerData(workType) {
    const timestamp = new Date().getTime();
    fetch(`./workRecord_api/search.php?workType=${globalWorkType}&timestamp=${timestamp}`)
        .then(response => response.json())
        .then(data => displayTrailerData(data, workType))
        .catch(error => console.error('Error:', error));
}

function deleteRecord(id, workType) {
    if (!confirm('确定要删除这条记录吗？')) {
        return;
    }
    console.log(workType);
    fetch(`./workRecord_api/delete.php?workType=${workType}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: id })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('记录已删除');
                location.reload();  // Reload the page to update the table
            } else {
                alert('删除失败: ' + data.error);
            }
        })
        .catch(error => console.error('Error:', error));
}

function displayTrailerData(data, workType) {
    let tableBody;
    if(workType==='loading'){
        tableBody = document.getElementById('loadTrailerTableBody');
    }else if(workType==='moving'){
        tableBody = document.getElementById('movingContainerTableBody');
    }else if(workType==='labeling'){
        tableBody = document.getElementById('labelGoodsTableBody');
    }else{
        tableBody = document.getElementById('loadTrailerTableBody');
    }

    const loadingCount = document.getElementById('loadingCount');
    const movingCount = document.getElementById('movingCount');
    const labelingCount = document.getElementById('labelingCount');
    let count = 0;  // Initialize count
    let labelCount = 0;
    tableBody.innerHTML = '';
    data.forEach(item => {
        count++;
        labelCount += parseInt(item.content);
        const imgName = item.imageUrl.split('/').pop();
        var imgSrc = `./images/workRecords/${imgName}`;
        const row = `<tr>
                <td>${item.id}</td>
                <td>${item.operator}</td>
                <td>${item.workDate}</td>
                <td><a data-translate="viewImage" href="#" onclick="showImageInModal('${imgSrc}'); return false;">查看图片</a></td>            
                <td><button data-translate="deleteButton" class="btn btn-danger" onclick="deleteRecord(${item.id}, '${workType}')">删除</button></td>
                </tr>`;
        tableBody.innerHTML += row; // 添加到表格中
    });
    loadingCount.textContent = count;
    movingCount.textContent = count;
    labelingCount.textContent = labelCount

}

function showImageInModal(imageUrl) {
    const modalImage = document.getElementById('modalImage');
    modalImage.src = imageUrl; // 设置图片地址
    const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
    imageModal.show(); // 显示Modal
}

document.addEventListener('DOMContentLoaded', function() {
    loadTrailerData();  // Load the trailer data when the document is ready
});

