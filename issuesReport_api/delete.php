<?php
include 'db_connect.php';

// 获取GET请求的数据
$id = $_GET['id'];

// 删除数据的SQL语句
$sql = "DELETE FROM departmentIssues WHERE id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo "Record deleted successfully";
} else {
    echo "Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>
