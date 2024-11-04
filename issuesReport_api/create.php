<?php
include 'db_connect.php'; // 引入数据库连接文件

// 定义保存签名的文件夹路径
$signatureDirectory = '../images/signature/';

// 获取表单数据
$department = $_POST['department'];
$issue = $_POST['issue'];
$date = $_POST['date'];

// 保存签名并获取文件路径
$responsibleSignature = saveSignature($_POST['responsible_signature'], $signatureDirectory);
$reporterSignature = saveSignature($_POST['reporter_signature'], $signatureDirectory);

// 插入数据到数据库
$sql = "INSERT INTO departmentIssues (department, issues, managerSignature, reporterSignature, date) VALUES (?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    die("Prepare failed: " . $conn->error);
}
$stmt->bind_param("sssss", $department, $issue, $responsibleSignature, $reporterSignature, $date);

if ($stmt->execute()) {
    echo "New record created successfully";
} else {
    echo "Error: " . $stmt->error;
}

$stmt->close();
$conn->close();

// 函数：保存签名为图片文件并返回文件路径
function saveSignature($signatureData, $directory) {
    // 解码Base64数据
    $imageData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $signatureData));
    // 创建唯一文件名
    $fileName = uniqid() . '.png';
    $filePath = $directory . $fileName;
    // 保存图片到服务器
    file_put_contents($filePath, $imageData);
    // 返回文件路径
    return $filePath;
}
?>
