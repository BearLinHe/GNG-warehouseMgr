<?php
header("Content-Type: application/json");

include 'db_connect.php';

// 读取POST请求体的内容
$data = json_decode(file_get_contents("php://input"), true);
$containers = isset($data['containers']) ? $data['containers'] : [];

// 构建基于containers参数的SQL查询条件
$sqlCondition = count($containers) > 0 ? " WHERE container IN ('" . join("','", array_map(function($item) use ($conn) { return mysqli_real_escape_string($conn, $item); }, $containers)) . "')" : "";

$sql = "SELECT * FROM containerPosition" . $sqlCondition;
$result = $conn->query($sql);

$positionInfo = [];
while ($row = $result->fetch_assoc()) {
    $positionInfo[$row['container']] = $row;
}
echo json_encode($positionInfo);

$conn->close();
?>
