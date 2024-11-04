<?php
include 'db_connect.php';

// 初始化查询条件
$whereClauses = [];
$params = [];

// 检查是否有日期查询参数
if (isset($_GET['date']) && !empty($_GET['date'])) {
    $whereClauses[] = "date = ?";
    $params[] = $_GET['date'];
}

// 检查是否有部门查询参数
if (isset($_GET['department']) && !empty($_GET['department'])) {
    $whereClauses[] = "department = ?";
    $params[] = $_GET['department'];
}

// 构建SQL查询语句
$sql = "SELECT id, department, issues, managerSignature, reporterSignature, date FROM departmentIssues";
if (!empty($whereClauses)) {
    $sql .= " WHERE " . implode(' AND ', $whereClauses);
}
$sql .= " ORDER BY date DESC";

$stmt = $conn->prepare($sql);

// 绑定参数
foreach ($params as $index => $param) {
    $stmt->bind_param(str_repeat("s", count($params)), ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$data = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
} else {
    echo json_encode(["message" => "0 results"]);
}

$conn->close();
?>
