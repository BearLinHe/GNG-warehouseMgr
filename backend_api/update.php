<?php
header("Content-Type: application/json");
include 'db_connect.php';

$data = json_decode(file_get_contents("php://input"), true);

$container = $data['container'];
$taskPerformed = false;

// 检查是否存在对应的container记录
$checkSql = "SELECT * FROM containerPosition WHERE container = ?";
$stmt = $conn->prepare($checkSql);
$stmt->bind_param("s", $container);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 0) {
    // 插入一条新记录
    $fields = ['container']; // 默认字段包含container
    $values = [$container]; // 默认值
    $types = "s"; // 默认类型
    // 检查是否提供了位置或状态数据，并构建相应的SQL语句
    if (isset($data['positionIndex']) && isset($data['newPositionValue'])) {
        $positionIndex = "position" . $data['positionIndex'];
        $newPositionValue = $data['newPositionValue'];
        array_push($fields, $positionIndex);
        array_push($values, $newPositionValue);
        $types .= "s";
    }
    if (isset($data['statusIndex']) && isset($data['newStatus'])) {
        $statusIndex = "status" . $data['statusIndex'];
        $newStatus = $data['newStatus'];
        array_push($fields, $statusIndex);
        array_push($values, $newStatus);
        $types .= "i";
    }
    $fieldsPlaceholder = join(', ', $fields);
    $valuesPlaceholder = join(', ', array_fill(0, count($fields), '?'));
    $insertSql = "INSERT INTO containerPosition ($fieldsPlaceholder) VALUES ($valuesPlaceholder)";
    $stmt = $conn->prepare($insertSql);
    $stmt->bind_param($types, ...$values);
} else {
    // 更新记录
    if (isset($data['positionIndex']) && isset($data['newPositionValue'])) {
        $positionIndex = "position" . $data['positionIndex'];
        $newPositionValue = $data['newPositionValue'];
        $updateSql = "UPDATE containerPosition SET $positionIndex = ? WHERE container = ?";
        $stmt = $conn->prepare($updateSql);
        $stmt->bind_param("ss", $newPositionValue, $container);
        $taskPerformed = true;
    }
    if (isset($data['statusIndex']) && isset($data['newStatus'])) {
        $statusIndex = "status" . $data['statusIndex'];
        $newStatus = $data['newStatus'];
        $updateSql = "UPDATE containerPosition SET $statusIndex = ? WHERE container = ?";
        $stmt = $conn->prepare($updateSql);
        $stmt->bind_param("is", $newStatus, $container);
        $taskPerformed = true;
    }
    if (!$taskPerformed) {
        echo json_encode(["message" => "No valid data provided for update"]);
        $stmt->close();
        $conn->close();
        exit;
    }
}

if ($stmt->execute()) {
    echo json_encode(["message" => "Record updated successfully"]);
} else {
    echo json_encode(["message" => "Error updating record: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
