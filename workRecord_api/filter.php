<?php
include 'db_connect.php'; // Ensure the path is correct

$operator = $_GET['operator'] ?? '';
$startDate = $_GET['startDate'] ?? '';
$endDate = $_GET['endDate'] ?? '';
$workType = $_GET['workType'] ?? 'loading'; // Default to 'loading' if not specified

$tableMap = [
    'loading' => 'loadTrailer',
    'moving' => 'moveContainer',
    'labeling' => 'labelGoods'
];

$tableName = $tableMap[$workType] ?? 'loadTrailer';  // Fallback to 'loadTrailer'

$query = "SELECT * FROM {$tableName} WHERE 1 = 1";
$paramTypes = '';
$params = [];

if (!empty($operator)) {
    $query .= " AND operator = ?";
    $params[] = $operator;
    $paramTypes .= 's';
}

if (!empty($startDate)) {
    $query .= " AND workDate >= ?";
    $params[] = $startDate;
    $paramTypes .= 's';
}

if (!empty($endDate)) {
    $query .= " AND workDate <= ?";
    $params[] = $endDate;
    $paramTypes .= 's';
}

$stmt = $conn->prepare($query);

if ($stmt === false) {
    // Error handling
    error_log("MySQL prepare error: " . $conn->error);
    echo json_encode(['error' => "Prepare error: " . $conn->error]);
    exit;
}

if ($paramTypes && $params) {
    $stmt->bind_param($paramTypes, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();
$data = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode($data);

$stmt->close();
$conn->close();
?>
