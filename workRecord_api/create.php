<?php
include 'db_connect.php';  // Make sure to have your database connection file included

// Assuming file upload handling and other form data are managed here
$workType = $_POST['workType'];
$operator = $_POST['operator'];
$workDate = $_POST['workDate'];
$workQuantity = $_POST['workQuantity'];
$imageUrl = '';

// Handle file upload
if (isset($_FILES['photo']) && $_FILES['photo']['error'] == UPLOAD_ERR_OK) {
    $uploadDir = '../images/workRecords/';
    $imageName = time() . '_' . basename($_FILES['photo']['name']);
    $imageUrl = $uploadDir . $imageName;
    move_uploaded_file($_FILES['photo']['tmp_name'], $imageUrl);
}

// Determine which table to use based on work type
$tableMap = [
    'loading' => 'loadTrailer',
    'moving' => 'moveContainer',
    'labeling' => 'labelGoods'
];
$tableName = $tableMap[$workType] ?? 'loadTrailer';  // Default to 'loadTrailer' if work type is unknown

// Prepare SQL and bind parameters
$sql = "INSERT INTO {$tableName} (content, operator, workDate, imageUrl) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param('ssss', $workQuantity, $operator, $workDate, $imageUrl);
if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'Data saved successfully!']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to save data: ' . $stmt->error]);
}
$stmt->close();
$conn->close();
?>
