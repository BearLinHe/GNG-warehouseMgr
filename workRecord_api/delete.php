<?php
include 'db_connect.php';  // Make sure to use the correct path to your database connection script

$id = json_decode(file_get_contents("php://input"), true)['id'];
$workType = $_GET['workType'];
$tableMap = [
    'loading' => 'loadTrailer',
    'moving' => 'moveContainer',
    'labeling' => 'labelGoods'
];
$tableName = $tableMap[$workType] ?? 'loadTrailer';  // Default to 'loadTrailer' if work type is unknown

if (!$id) {
    echo json_encode(['success' => false, 'error' => 'No ID provided']);
    exit;
}

// Prepare a delete statement
$sql = "DELETE FROM {$tableName} WHERE id = ?";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['success' => false, 'error' => 'SQL error: ' . $conn->error]);
    exit;
}
$stmt->bind_param("i", $id);
if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Execution error']);
}
$stmt->close();
$conn->close();
?>
