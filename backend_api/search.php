<?php
header("Content-Type: application/json");

include 'db_connect.php';

// 获取搜索关键词
$keyword = $_GET['keyword'];

// 构造 SQL 查询语句
$sql = "SELECT * FROM containerInfo WHERE containernumber LIKE '%$keyword'";

// 执行查询
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // 将查询结果转换为关联数组
    $rows = array();
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    // 输出查询结果作为 JSON 格式
    echo json_encode($rows);
} else {
    // 如果查询结果为空，输出空数组
    echo json_encode(array());
}

// 关闭连接
$conn->close();
?>
