<?php
include 'db_connect.php';  // 引入数据库连接文件
$workType = $_GET['workType'];
$tableMap = [
    'loading' => 'loadTrailer',
    'moving' => 'moveContainer',
    'labeling' => 'labelGoods'
];
$tableName = $tableMap[$workType] ?? 'loadTrailer';  // Default to 'loadTrailer' if work type is unknown


$sql = "SELECT * FROM {$tableName} ORDER BY workDate DESC";
$result = $conn->query($sql);

$data = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
} else {
    echo json_encode([]);
}

$conn->close();
?>
